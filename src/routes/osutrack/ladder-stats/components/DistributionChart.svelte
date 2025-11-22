<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import type { AnalysisDataset } from '../types';
  import { submitAnalyticsEvent } from '../../../../api';

  let {
    analysisData,
    selectedDate = $bindable(),
  }: {
    analysisData: AnalysisDataset | null;
    selectedDate: Date | null;
  } = $props();

  let container: HTMLDivElement;
  let width = $state(600);
  let height = 400;
  let marginTop = 20;
  let marginRight = 30;
  let marginBottom = 40;
  let marginLeft = 75;

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let gx: d3.Selection<SVGGElement, unknown, null, undefined>;
  let gy: d3.Selection<SVGGElement, unknown, null, undefined>;
  let path: d3.Selection<SVGPathElement, unknown, null, undefined>;
  let overlay: d3.Selection<SVGRectElement, unknown, null, undefined>;
  let focusDot: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

  let xScale: d3.ScaleLogarithmic<number, number> | null = null;
  let yScale: d3.ScaleLinear<number, number> | null = null;
  let currentData: [number, number][] = [];
  const bisectRank = d3.bisector<[number, number], number>(d => d[0]).center;

  let dateIndex = $state(0);
  let maxDateIndex = $state(0);
  let globalPpMax = $state(0);

  const computeGlobalPpMax = (matrix: ArrayLike<number>) => {
    let max = 0;
    for (let i = 0; i < matrix.length; i++) {
      const value = matrix[i];
      if (value > max) {
        max = value;
      }
    }
    return max;
  };

  const getPaddedMax = (value: number) => {
    if (value <= 0) return value;
    return value * 1.1;
  };

  const rankFormatter = new Intl.NumberFormat('en-US');

  const formatRankTick = (value: number) => {
    if (!Number.isFinite(value)) {
      return '';
    }

    if (value >= 1_000_000) {
      return `${Math.round(value / 1_000_000)}M`;
    }

    if (value >= 1_000) {
      return `${Math.round(value / 1_000)}K`;
    }

    return value.toString();
  };

  const formatTooltipRank = (value: number) => `Rank #${rankFormatter.format(Math.round(value))}`;
  const formatTooltipPp = (value: number) => `${rankFormatter.format(Math.round(value))} PP`;

  const hideTooltip = () => {
    focusDot?.style('display', 'none');
    tooltip?.style('opacity', 0);
  };

  const updateTooltipPosition = (x: number, y: number) => {
    if (!tooltip || !container) return;

    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode?.offsetWidth ?? 0;
    const tooltipHeight = tooltipNode?.offsetHeight ?? 0;
    const padding = 8;

    const clampedX = Math.min(
      Math.max(padding, x + padding),
      container.clientWidth - tooltipWidth - padding
    );
    const clampedY = Math.max(marginTop, y - tooltipHeight - padding);

    tooltip.style('left', `${clampedX}px`).style('top', `${clampedY}px`);
  };

  const pointerMove = (event: PointerEvent) => {
    if (!xScale || !yScale || !currentData.length) {
      return;
    }

    const [mx] = d3.pointer(event, svg?.node() ?? null);
    const hoveredRank = xScale.invert(mx);

    const index = bisectRank(currentData, hoveredRank);
    const closestPoint = currentData[Math.min(Math.max(index, 0), currentData.length - 1)];

    const xPos = xScale(closestPoint[0]);
    const yPos = yScale(closestPoint[1]);

    focusDot?.style('display', null).attr('cx', xPos).attr('cy', yPos);

    tooltip
      ?.style('opacity', 1)
      .html(
        `<div class="tooltip-title">${formatTooltipRank(closestPoint[0])}</div><div class="tooltip-value">${formatTooltipPp(closestPoint[1])}</div>`
      );

    updateTooltipPosition(xPos, yPos);
  };

  const updateChart = (analysisData: AnalysisDataset | null, dateIndex: number) => {
    if (!container || !analysisData?.dates.length) {
      return;
    }

    const { buckets, pp_matrix } = analysisData;
    const numBuckets = buckets.length;

    const currentPpSlice = pp_matrix.slice(dateIndex * numBuckets, (dateIndex + 1) * numBuckets);
    const data: [number, number][] = [];
    for (let i = 0; i < numBuckets; i++) {
      data.push([buckets[i], currentPpSlice[i]]);
    }

    width = container.clientWidth;

    const x = d3
      .scaleLog()
      .domain(d3.extent(buckets) as [number, number])
      .range([marginLeft, width - marginRight]);

    xScale = x;

    const currentMax = data.length ? (d3.max(data, d => d[1]) as number) : 0;
    const yMaxValue = globalPpMax || currentMax;
    const paddedMax = getPaddedMax(yMaxValue);
    const safeMax = paddedMax > 0 ? paddedMax : 1;

    const y = d3
      .scaleLinear()
      .domain([0, safeMax])
      .range([height - marginBottom, marginTop]);

    yScale = y;
    currentData = data;

    const line = d3
      .line<[number, number]>()
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    if (!svg) {
      svg = d3
        .select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto;');

      gx = svg.append('g').attr('transform', `translate(0,${height - marginBottom})`);

      gy = svg.append('g').attr('transform', `translate(${marginLeft},0)`);

      // X-axis label
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .text('Rank');

      // Y-axis label
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 15)
        .attr('x', 0 - height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('PP');

      path = svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5);
      focusDot = svg
        .append('circle')
        .attr('r', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('fill', 'steelblue')
        .style('display', 'none');

      overlay = svg
        .append('rect')
        .attr('class', 'overlay')
        .attr('fill', 'transparent')
        .style('pointer-events', 'all')
        .on('pointerenter pointermove', pointerMove)
        .on('pointerleave', hideTooltip);

      tooltip = d3
        .select(container)
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('opacity', 0);
    } else {
      svg.attr('width', width).attr('viewBox', [0, 0, width, height]);
    }

    const rawTicks = x.ticks();
    const maxLabels = width < 640 ? 8 : 5;
    const step = Math.max(1, Math.ceil(rawTicks.length / Math.max(1, maxLabels)));
    const tickValues = rawTicks.filter((_, idx) => idx % step === 0);

    gx.call(
      d3
        .axisBottom(x)
        .tickValues(tickValues.length ? tickValues : rawTicks)
        .tickFormat(d => formatRankTick(d as number))
    );
    gy.call(d3.axisLeft(y));
    path.datum(data).attr('d', line);

    overlay
      ?.attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', Math.max(0, width - marginLeft - marginRight))
      .attr('height', Math.max(0, height - marginTop - marginBottom));

    if (!data.length) {
      hideTooltip();
    }
  };

  const handleDateChange = (evt: Event) => {
    setTimeout(() =>
      submitAnalyticsEvent(
        { category: 'ladder_stats', subcategory: 'pp_distribution_date_slider_input' },
        fetch,
        true
      )
    );

    const target = evt.target as HTMLInputElement;
    dateIndex = parseInt(target.value, 10);
    if (analysisData) {
      selectedDate = analysisData.dates[dateIndex];
    }
  };

  onMount(() => {
    updateChart(analysisData, dateIndex);
    const resizeObserver = new ResizeObserver(() => {
      updateChart(analysisData, dateIndex);
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });

  let didInitDateIndex = false;
  $effect(() => {
    if (!analysisData) {
      return;
    }

    maxDateIndex = analysisData.dates.length - 1;
    if (!didInitDateIndex && dateIndex === 0 && maxDateIndex > 0) {
      didInitDateIndex = true;
      dateIndex = maxDateIndex;
      selectedDate = analysisData.dates[dateIndex];
    }
    globalPpMax = computeGlobalPpMax(analysisData.pp_matrix);
    updateChart(analysisData, dateIndex);
  });

  $effect(() => {
    if (analysisData) {
      updateChart(analysisData, dateIndex);
    }
  });
</script>

<div class="distribution-section">
  <h3>PP Distribution</h3>
  <p class="description">
    PP distribution across ranks for {selectedDate?.toLocaleDateString() ?? 'Loading...'}
  </p>

  <div class="controls">
    <input
      type="range"
      min="0"
      max={maxDateIndex}
      value={dateIndex}
      oninput={handleDateChange}
      class="slider"
      disabled={!analysisData}
    />
  </div>

  <div class="chart-container" bind:this={container}></div>
</div>

<style>
  .distribution-section {
    padding: 8px 2px;
    background: #fff;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 20px;
    color: #333;
  }

  .description {
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    color: #666;
  }

  .controls {
    margin-bottom: 1rem;
  }

  .slider {
    width: 100%;
  }

  .chart-container {
    width: 100%;
    height: 400px;
    position: relative;
  }

  :global(.chart-tooltip) {
    position: absolute;
    pointer-events: none;
    background: rgba(22, 22, 25, 0.92);
    color: #fff;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-size: 1.15rem;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transition: opacity 120ms ease;
    white-space: nowrap;
    z-index: 2;
  }

  :global(.chart-tooltip .tooltip-title) {
    font-weight: 600;
    margin-bottom: 2px;
  }

  :global(.chart-tooltip .tooltip-value) {
    font-weight: 500;
  }
</style>
