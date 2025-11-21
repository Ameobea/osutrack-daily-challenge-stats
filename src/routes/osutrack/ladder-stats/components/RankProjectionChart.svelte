<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';

  import { IntegerFormatter } from '../../../../util';

  type ProjectionPoint = { day: number; rank: number };

  let {
    projection,
    startingRank,
    baseline = null,
  }: {
    projection: ProjectionPoint[];
    startingRank: number;
    baseline?: ProjectionPoint[] | null;
  } = $props();

  let container: HTMLDivElement;
  let width = $state(600);
  const height = 280;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 45;
  const marginLeft = 70;

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let gx: d3.Selection<SVGGElement, unknown, null, undefined>;
  let gy: d3.Selection<SVGGElement, unknown, null, undefined>;
  let segmentsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let baselinePath: d3.Selection<SVGPathElement, unknown, null, undefined>;
  let startLine: d3.Selection<SVGLineElement, unknown, null, undefined>;
  let overlay: d3.Selection<SVGRectElement, unknown, null, undefined>;
  let focusDot: d3.Selection<SVGCircleElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  let xAxisLabel: d3.Selection<SVGTextElement, unknown, null, undefined>;
  let yAxisLabel: d3.Selection<SVGTextElement, unknown, null, undefined>;

  let xScale: d3.ScaleLinear<number, number> | null = null;
  let yScale: d3.ScaleLinear<number, number> | null = null;
  let currentSeries: [number, number][] = [];
  let baselineSeries: [number, number][] = [];
  let showLegend = $state(false);

  const bisectDay = d3.bisector<[number, number], number>(d => d[0]).center;

  const formatDay = (value: number) => `${IntegerFormatter.format(Math.round(value))}d`;
  const formatRank = (value: number) => `#${IntegerFormatter.format(Math.round(value))}`;

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
    if (!xScale || !yScale || !currentSeries.length) {
      return;
    }

    const [mx] = d3.pointer(event, svg?.node() ?? null);
    const hoveredDay = xScale.invert(mx);
    const index = bisectDay(currentSeries, hoveredDay);
    const point = currentSeries[Math.min(Math.max(index, 0), currentSeries.length - 1)];
    const baselinePoint = baselineSeries.length
      ? baselineSeries[
          Math.min(Math.max(bisectDay(baselineSeries, hoveredDay), 0), baselineSeries.length - 1)
        ]
      : null;

    const xPos = xScale(point[0]);
    const yPos = yScale(point[1]);
    const improved = point[1] <= startingRank;

    focusDot
      ?.style('display', null)
      .attr('cx', xPos)
      .attr('cy', yPos)
      .attr('fill', improved ? '#4caf50' : '#f44336');

    const tooltipContent = [`<div class="tooltip-title">${formatDay(point[0])}</div>`];
    tooltipContent.push(
      `<div class="tooltip-line projected"><span class="line-label">Projected</span><span class="value">${formatRank(
        point[1]
      )}</span></div>`
    );
    if (baselinePoint) {
      tooltipContent.push(
        `<div class="tooltip-line baseline"><span class="line-label">No PP Gain</span><span class="value">${formatRank(
          baselinePoint[1]
        )}</span></div>`
      );
    }

    tooltip?.style('opacity', 1).html(tooltipContent.join(''));

    updateTooltipPosition(xPos, yPos);
  };

  type Segment = { improved: boolean; points: [number, number][] };

  const computeIntersection = (
    prev: [number, number],
    next: [number, number],
    baseline: number
  ): [number, number] => {
    const [x1, y1] = prev;
    const [x2, y2] = next;
    if (y1 === y2) {
      return [x2, baseline];
    }
    const ratio = (baseline - y1) / (y2 - y1);
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const crossX = x1 + clampedRatio * (x2 - x1);
    return [crossX, baseline];
  };

  const computeSegments = (points: [number, number][], baseline: number): Segment[] => {
    if (!points.length) {
      return [];
    }

    const segments: Segment[] = [];
    let currentSegment: Segment | null = null;
    let prevPoint = points[0];
    let prevImproved = prevPoint[1] <= baseline;

    currentSegment = { improved: prevImproved, points: [prevPoint] };

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const improved = point[1] <= baseline;

      if (improved === prevImproved) {
        currentSegment?.points.push(point);
      } else {
        const intersection = computeIntersection(prevPoint, point, baseline);
        currentSegment?.points.push(intersection);
        if (currentSegment) {
          segments.push(currentSegment);
        }
        currentSegment = { improved, points: [intersection, point] };
        prevImproved = improved;
      }

      prevPoint = point;
    }

    if (currentSegment) {
      segments.push(currentSegment);
    }

    return segments;
  };

  const ensureSeriesCoverage = (
    points: [number, number][],
    fallbackRank: number
  ): [number, number][] => {
    if (!points.length) {
      return [[0, fallbackRank] as [number, number], [1, fallbackRank] as [number, number]];
    }

    if (points.length === 1) {
      return [...points, [points[0][0] + 1, points[0][1]]];
    }

    return points;
  };

  const updateChart = (
    projectionData: ProjectionPoint[],
    baselineData?: ProjectionPoint[] | null
  ) => {
    if (!container) {
      return;
    }

    let normalized: [number, number][] = (projectionData ?? []).map(point => [
      point.day,
      point.rank,
    ]);
    normalized = ensureSeriesCoverage(normalized, startingRank);

    let baselineNormalized: [number, number][] = Array.isArray(baselineData)
      ? baselineData.map(point => [point.day, point.rank])
      : [];
    if (baselineNormalized.length) {
      baselineNormalized = ensureSeriesCoverage(baselineNormalized, startingRank);
    }

    const hasBaseline = baselineNormalized.length > 0;
    showLegend = hasBaseline;

    width = container.clientWidth || 600;

    const maxDay = d3.max(normalized, d => d[0]) ?? 0;
    const baselineMaxDay = hasBaseline ? (d3.max(baselineNormalized, d => d[0]) ?? 0) : 0;
    const xDomainMax = Math.max(1, maxDay, baselineMaxDay);
    const x = d3
      .scaleLinear()
      .domain([0, xDomainMax])
      .range([marginLeft, width - marginRight]);

    const rankValues = normalized.map(d => d[1]).concat([startingRank]);
    if (hasBaseline) {
      rankValues.push(...baselineNormalized.map(d => d[1]));
    }
    const computedMin = d3.min(rankValues) ?? startingRank;
    const computedMax = d3.max(rankValues) ?? startingRank;
    const range = Math.max(1, computedMax - computedMin);
    const padding = range * 0.1;
    const domainMin = Math.max(1, computedMin - padding);
    const domainMax = computedMax + padding;

    const y = d3
      .scaleLinear()
      .domain([domainMax, domainMin])
      .range([height - marginBottom, marginTop]);

    xScale = x;
    yScale = y;
    currentSeries = normalized;
    baselineSeries = hasBaseline ? baselineNormalized : [];

    const line = d3
      .line<[number, number]>()
      .curve(d3.curveMonotoneX)
      .x(d => x(d[0]))
      .y(d => y(d[1]));

    const segments = computeSegments(normalized, startingRank);

    if (!svg) {
      svg = d3
        .select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto;');

      baselinePath = svg.append('path').attr('class', 'projection-baseline');
      segmentsGroup = svg.append('g').attr('class', 'projection-segments');
      gx = svg.append('g').attr('transform', `translate(0,${height - marginBottom})`);
      gy = svg.append('g').attr('transform', `translate(${marginLeft},0)`);

      xAxisLabel = svg
        .append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .text('Days Simulated');

      yAxisLabel = svg
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(20, ${height / 2}) rotate(-90)`)
        .style('text-anchor', 'middle')
        .text('Rank');

      startLine = svg
        .append('line')
        .attr('class', 'start-rank-line')
        .attr('stroke', '#999')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 1.5);

      focusDot = svg
        .append('circle')
        .attr('class', 'projection-dot')
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
      xAxisLabel?.attr('x', width / 2);
    }

    baselinePath
      ?.style('display', hasBaseline ? '' : 'none')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('d', hasBaseline ? (line(baselineNormalized) ?? '') : '')
      .lower();

    startLine
      ?.attr('x1', x(0))
      .attr('x2', x(0))
      .attr('y1', marginTop)
      .attr('y2', height - marginBottom);

    const segmentSelection = segmentsGroup
      ?.selectAll<SVGPathElement, Segment>('path.projection-segment')
      .data(segments);

    segmentSelection
      ?.join(
        enter =>
          enter
            .append('path')
            .attr('class', d => `projection-segment ${d.improved ? 'improved' : 'decline'}`),
        update =>
          update.attr('class', d => `projection-segment ${d.improved ? 'improved' : 'decline'}`),
        exit => exit.remove()
      )
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .attr('d', d => line(d.points));

    gx.call(
      d3
        .axisBottom(x)
        .ticks(Math.min(10, xDomainMax))
        .tickFormat(value => formatDay(value as number))
    );
    gy.call(
      d3
        .axisLeft(y)
        .ticks(6)
        .tickFormat(value => formatRank(value as number))
    );

    overlay
      ?.attr('x', marginLeft)
      .attr('y', marginTop)
      .attr('width', Math.max(0, width - marginLeft - marginRight))
      .attr('height', Math.max(0, height - marginTop - marginBottom));

    if (!normalized.length) {
      hideTooltip();
    }
  };

  onMount(() => {
    updateChart(projection, baseline);
    const resizeObserver = new ResizeObserver(() => {
      updateChart(projection, baseline);
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  });

  $effect(() => {
    updateChart(projection, baseline);
    void startingRank;
  });
</script>

<div class="chart-container" bind:this={container}></div>
{#if showLegend}
  <div class="chart-legend">
    <div class="legend-item">
      <span class="legend-swatch projected"></span>
      <span>Projected gain</span>
    </div>
    <div class="legend-item">
      <span class="legend-swatch baseline"></span>
      <span>No PP gain</span>
    </div>
  </div>
{/if}

<style>
  .chart-container {
    width: 100%;
    height: 280px;
    position: relative;
  }

  .chart-legend {
    margin-top: 0.5rem;
    display: flex;
    gap: 1.25rem;
    font-size: 0.8rem;
    color: #444;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .legend-swatch {
    width: 26px;
    height: 4px;
    border-radius: 999px;
    display: inline-block;
  }

  .legend-swatch.projected {
    background: linear-gradient(90deg, #f44336, #4caf50);
  }

  .legend-swatch.baseline {
    background: repeating-linear-gradient(
      90deg,
      #607d8b,
      #607d8b 6px,
      transparent 6px,
      transparent 12px
    );
  }

  :global(.projection-segment.improved) {
    stroke: #4caf50;
  }

  :global(.projection-segment.decline) {
    stroke: #f44336;
  }

  :global(.projection-baseline) {
    stroke: #607d8b;
    stroke-dasharray: 6 4;
  }

  :global(.start-rank-line) {
    stroke: #999;
    stroke-dasharray: 4 4;
  }

  :global(.projection-dot) {
    pointer-events: none;
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

  :global(.chart-tooltip .tooltip-line) {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.8rem;
  }

  :global(.chart-tooltip .tooltip-line + .tooltip-line) {
    margin-top: 2px;
  }

  :global(.chart-tooltip .tooltip-line.projected .line-label) {
    color: #c8e6c9;
  }

  :global(.chart-tooltip .tooltip-line.baseline .line-label) {
    color: #b0bec5;
  }

  :global(.chart-tooltip .tooltip-value) {
    font-weight: 500;
  }
</style>
