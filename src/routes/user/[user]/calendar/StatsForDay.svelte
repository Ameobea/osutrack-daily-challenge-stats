<script lang="ts" context="module">
  const DateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const PlaycountFormatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    maximumFractionDigits: 0,
  });

  const margin = { top: 10, right: 30, bottom: 20, left: 25 };

  const renderHistogram = (
    histogramContainer: HTMLDivElement,
    statsForDay: DailyChallengeStatsForDay,
    svgHeight: number,
    svgWidth: number,
    userScore: number | undefined
  ) => {
    const histogramData = statsForDay.histogram;

    histogramContainer.innerHTML = '';

    const svg = select(histogramContainer)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = scaleLinear().domain([histogramData.min, histogramData.max]).range([0, width]);

    const y = scaleLinear()
      .domain([0, Math.max(...histogramData.buckets)])
      .range([height, 0]);

    const barWidth = width / histogramData.buckets.length;

    g.selectAll('.histogram-bar')
      .data(histogramData.buckets)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d, i) => i * barWidth)
      .attr('y', d => y(d))
      .attr('width', barWidth - 1)
      .attr('height', d => height - y(d))
      .attr('fill', '#24a6c7');

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x).tickFormat(format('.2s')));

    // render magenta line for user score along with a label
    if (typeof userScore === 'number') {
      const lineX = x(userScore);
      g.append('line')
        .attr('x1', lineX)
        .attr('y1', 20)
        .attr('x2', lineX)
        .attr('y2', height)
        .attr('stroke', 'magenta');

      const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElement.setAttribute('x', `${lineX}`);
      textElement.setAttribute('y', '14');
      textElement.setAttribute('text-anchor', 'middle');
      textElement.setAttribute('fill', 'magenta');
      textElement.setAttribute('font-size', '12px');
      textElement.textContent = PlaycountFormatter.format(userScore);
      g.node()!.appendChild(textElement);

      const textBBox = textElement.getBBox();

      const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectElement.setAttribute('x', `${textBBox.x - 2}`);
      rectElement.setAttribute('y', `${textBBox.y - 2}`);
      rectElement.setAttribute('width', `${textBBox.width + 4}`);
      rectElement.setAttribute('height', `${textBBox.height + 4}`);
      rectElement.setAttribute('fill', 'rgba(0, 0, 0, 0.5)');
      rectElement.setAttribute('rx', '2');
      rectElement.setAttribute('ry', '2');
      g.node()!.insertBefore(rectElement, textElement);
    }

    g.append('g').call(axisLeft(y));
  };
</script>

<script lang="ts">
  import { scaleLinear, select, axisBottom, axisLeft, format } from 'd3';

  import { useQuery } from '@sveltestack/svelte-query';
  import {
    fetchStatsForDay,
    type DailyChallengeHistoryEntry,
    type DailyChallengeStatsForDay,
  } from '../../../../api';

  export let dayID: number;
  export let stats: DailyChallengeHistoryEntry | undefined;

  $: res = useQuery(['stats-for-day', dayID], async () => fetchStatsForDay(dayID));
  $: statsForDay = $res.data;

  $: date = (() => {
    const dayIdString = `${dayID}`;
    const year = dayIdString.slice(0, 4);
    const month = dayIdString.slice(4, 6);
    const day = dayIdString.slice(6, 8);
    return new Date(+year, +month - 1, +day);
  })();

  $: formattedDate = DateFormatter.format(date);

  let histogramContainer: HTMLDivElement | null = null;

  let innerWidth = 550;

  // TODO: highlight the user's spot in the histogram
  $: if (statsForDay && histogramContainer) {
    let svgWidth = Math.min(innerWidth, 500);
    const svgHeight = Math.floor(svgWidth * 0.5);
    renderHistogram(histogramContainer, statsForDay, svgHeight, svgWidth, stats?.score.total_score);
  }
</script>

<svelte:window bind:innerWidth />

<div class="root">
  {#if statsForDay}
    <div
      class="bg-image"
      style={`background-image: url(${statsForDay.descriptor.current_playlist_item.beatmap.beatmapset.covers.cover}); background-size: cover; background-position: 50%`}
    ></div>
    {@const beatmap = statsForDay.descriptor.current_playlist_item.beatmap}
    <div class="content">
      <h2>{formattedDate}</h2>
      <h3>
        <a
          href={`https://osu.ppy.sh/b/${beatmap.id}`}
          target="_blank"
          style="color: rgb(244, 244, 244)">{beatmap.beatmapset.title} - [{beatmap.version}]</a
        >
      </h3>
      <span>{beatmap.difficulty_rating.toFixed(2)}★</span> | <b>By {beatmap.beatmapset.artist}</b>
      <p>
        Mapset by <a href={`https://osu.ppy.sh/u/${beatmap.beatmapset.creator}`} target="_blank">
          {beatmap.beatmapset.creator}
        </a>
      </p>
      <p>
        Total Scores Submitted: <b style="font-weight: 500">
          {PlaycountFormatter.format(statsForDay.total_scores)}
        </b>
      </p>
    </div>

    <div class="histogram-container" bind:this={histogramContainer}></div>
  {:else if $res.isLoading}
    <span class="loading">Loading...</span>
  {:else}
    <span class="loading">No data available for this day.</span>
  {/if}
</div>

<style>
  .root {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    margin: 16px auto 8px auto;
  }

  .bg-image {
    max-height: 250px;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .content {
    z-index: 1;
    background-color: hsla(200, 10%, 15%, 75%);
    padding: 14px 20px;
    height: 250px;
  }

  .histogram-container {
    z-index: 1;
  }

  h2 {
    text-align: center;
    margin-top: -8px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  h3 {
    margin: 0 0 4px 0;
  }

  p {
    margin: 5px 0;
  }

  .loading {
    color: #666;
  }

  ::global(.histogram-bar) {
    stroke: #fff;
  }

  @media (max-width: 600px) {
    .content {
      padding: 14px 10px;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bg-image,
    .content {
      max-height: 200px;
    }
  }
</style>
