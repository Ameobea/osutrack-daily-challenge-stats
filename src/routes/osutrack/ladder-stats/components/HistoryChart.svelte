<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  const defaultFormatY = (d: number) => d.toFixed(0);

  let {
    data,
    yLabel,
    color = 'steelblue',
    formatY = defaultFormatY,
    yMin = null,
    yMax = null,
    formatTooltipX = (value: Date) => value.toLocaleDateString(),
    formatTooltipY = formatY,
  }: {
    data: [Date, number][];
    yLabel: string;
    color?: string;
    formatY?: (d: number) => string;
    yMin?: number | null;
    yMax?: number | null;
    formatTooltipX?: (value: Date) => string;
    formatTooltipY?: (value: number) => string;
  } = $props();

  let container: HTMLDivElement;
  let width = $state(600);
  let height = 300;
  let marginTop = 20;
  let marginRight = 30;
  let marginBottom = 30;
  let marginLeft = 70;

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let gx: d3.Selection<SVGGElement, unknown, null, undefined>;
  let gy: d3.Selection<SVGGElement, unknown, null, undefined>;
  let path: d3.Selection<SVGPathElement, unknown, null, undefined>;
  let yAxisLabel: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let overlay: d3.Selection<SVGRectElement, unknown, null, undefined>;
  let focusDot: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;

  let xScale: d3.ScaleTime<number, number> | null = null;
  let yScale: d3.ScaleLinear<number, number> | null = null;
  let currentData: [Date, number][] = [];

  const bisectDate = d3.bisector<[Date, number], Date>(d => d[0]).center;

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
    const clampedY = Math.max(0, y - tooltipHeight - padding);

    tooltip.style('left', `${clampedX}px`).style('top', `${clampedY}px`);
  };

  const pointerMove = (event: PointerEvent) => {
    if (!xScale || !yScale || !currentData.length) {
      return;
    }

    const [mx] = d3.pointer(event, svg?.node() ?? null);
    const hoveredDate = xScale.invert(mx);
    const index = bisectDate(currentData, hoveredDate);
    const point = currentData[Math.min(Math.max(index, 0), currentData.length - 1)];

    const xPos = xScale(point[0]);
    const yPos = yScale(point[1]);

    focusDot?.style('display', null).attr('cx', xPos).attr('cy', yPos).attr('fill', color);

    tooltip
      ?.style('opacity', 1)
      .html(
        `<div class="tooltip-title">${formatTooltipX(point[0])}</div><div class="tooltip-value">${formatTooltipY(point[1])} ${yLabel}</div>`
      );

    updateTooltipPosition(xPos, yPos);
  };

  const updateChart = (data: [Date, number][]) => {
    if (!container || !data || data.length === 0) {
      return;
    }

    width = container.clientWidth;

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, d => d[0]) as [Date, Date])
      .range([marginLeft, width - marginRight]);

    const values = data.map(d => d[1]);
    const computedMin = values.length ? (d3.min(values) as number) : 0;
    const computedMax = values.length ? (d3.max(values) as number) : 0;

    let domainMin = yMin ?? Math.min(0, computedMin);
    let domainMax = yMax ?? computedMax;

    if (domainMin === domainMax) {
      const epsilon = Math.abs(domainMin) || 1;
      domainMin -= epsilon * 0.1;
      domainMax += epsilon * 0.1;
    }

    const y = d3
      .scaleLinear()
      .domain([domainMin, domainMax])
      .range([height - marginBottom, marginTop]);

    xScale = x;
    yScale = y;
    currentData = data;

    const line = d3
      .line<[Date, number]>()
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

      // Y-axis label
      yAxisLabel = svg
        .append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', `translate(20, ${height / 2}) rotate(-90)`)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(yLabel);

      path = svg
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5);

      focusDot = svg
        .append('circle')
        .attr('r', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
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
      yAxisLabel?.text(yLabel);
    }

    gx.call(d3.axisBottom(x));
    gy.call(
      d3
        .axisLeft(y)
        .ticks(6)
        .tickFormat(d => formatY(d as number))
    );
    path.datum(data).attr('d', line).attr('stroke', color);

    overlay
      ?.attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', Math.max(0, width - marginLeft - marginRight))
      .attr('height', Math.max(0, height - marginTop - marginBottom));

    if (!data.length) {
      hideTooltip();
    }
  };

  onMount(() => {
    updateChart(data);
    const resizeObserver = new ResizeObserver(() => {
      updateChart(data);
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });

  $effect(() => {
    // ensure changes to these props retrigger updates
    void yMin;
    void yMax;
    void yLabel;
    void color;
    void formatY;
    updateChart(data);
  });
</script>

<div class="chart-container" bind:this={container}></div>

<style>
  .chart-container {
    width: 100%;
    height: 300px;
    position: relative;
  }

  :global(.chart-tooltip) {
    position: absolute;
    pointer-events: none;
    background: rgba(22, 22, 25, 0.92);
    color: #fff;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-size: 0.85rem;
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
