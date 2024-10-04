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
</script>

<script lang="ts">
  import { useQuery } from '@sveltestack/svelte-query';
  import {
    fetchRankingsForDay,
    fetchStatsForDay,
    type DailyChallengeHistoryEntry,
  } from '../../../../api';
  import { dayIDToDate } from '../../../../util';
  import { renderHistogram } from '../../../../components/histogram';
  import RankingsTable from '../../../rankings/RankingsTable.svelte';
  import { writable } from 'svelte/store';

  export let dayID: number;
  export let stats: DailyChallengeHistoryEntry | undefined;
  export let username: string;

  $: statsRes = useQuery(['stats-for-day', dayID], async () => fetchStatsForDay(fetch, dayID));
  $: statsForDay = $statsRes.data;

  let rankingsPageNumber = writable(1);
  $: rankingsRes = useQuery(['rankings-for-day', dayID], async () =>
    fetchRankingsForDay(fetch, dayID, $rankingsPageNumber)
  );

  $: date = dayIDToDate(dayID);
  $: formattedDate = DateFormatter.format(date);

  let histogramContainer: HTMLDivElement | null = null;

  let innerWidth = 550;

  $: if (statsForDay && histogramContainer) {
    let svgWidth = Math.min(innerWidth, 500);
    const svgHeight = Math.floor(svgWidth * 0.5);
    renderHistogram({
      histogramContainer,
      histogramData: statsForDay.histogram,
      svgHeight,
      svgWidth,
      userScore: stats?.score.total_score,
    });
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
        <a href={`https://osu.ppy.sh/b/${beatmap.id}`} target="_blank">
          {beatmap.beatmapset.title} - [{beatmap.version}]
        </a>
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

    <div class="bottom">
      <div class="histogram-container" bind:this={histogramContainer}></div>
      <RankingsTable
        pageNumber={rankingsPageNumber}
        rankings={$rankingsRes.data}
        totalRankings={statsForDay.total_scores}
        highlightedUsername={username}
      />
    </div>
  {:else if $statsRes.isLoading}
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

  .bottom {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
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
