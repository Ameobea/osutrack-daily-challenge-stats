<script lang="ts">
  import SvelteSeo from 'svelte-seo';

  import { renderHistogram } from '../../components/histogram';
  import { IntegerFormatter, TotalScoreFormatter } from '../../util';
  import type { PageData } from './$types';
  import ModDisplay from '../../components/ModDisplay.svelte';

  export let data: PageData;
  $: stats = data.stats;

  let innerWidth = 500;
  let histogram1Ref: HTMLDivElement | undefined;
  let histogram2Ref: HTMLDivElement | undefined;
  let histogram3Ref: HTMLDivElement | undefined;
  let histogram4Ref: HTMLDivElement | undefined;
  let histogram5Ref: HTMLDivElement | undefined;
  let histogram6Ref: HTMLDivElement | undefined;

  $: svgWidth = (() => {
    if (innerWidth < 800) {
      return innerWidth - 80;
    } else if (innerWidth >= 1080) {
      return 500;
    }
    return 400;
  })();
  $: svgHeight = Math.floor(svgWidth * 0.5);

  $: if (histogram1Ref) {
    renderHistogram({
      histogramContainer: histogram1Ref,
      histogramData: stats.map_stats.difficulty_distribution,
      svgHeight,
      svgWidth,
    });
  }
  $: if (histogram2Ref) {
    const minDate = new Date(stats.map_stats.ranked_timestamp_distribution.min * 1000);
    const maxDate = new Date(stats.map_stats.ranked_timestamp_distribution.max * 1000);
    const minYear = minDate.getFullYear();
    const maxYear = maxDate.getFullYear();
    const xAxisTickValues = [];
    for (let year = minYear; year <= maxYear; year += innerWidth < 600 ? 2 : 1) {
      const timestamp = new Date(year, 0, 1).getTime() / 1000;
      if (
        timestamp >= stats.map_stats.ranked_timestamp_distribution.min &&
        timestamp <= stats.map_stats.ranked_timestamp_distribution.max
      ) {
        xAxisTickValues.push(timestamp);
      }
    }

    renderHistogram({
      histogramContainer: histogram2Ref,
      histogramData: stats.map_stats.ranked_timestamp_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: undefined,
      xAxisTickFormat: (timestamp: number) => new Date(timestamp * 1000).getFullYear().toString(),
      yAxisTicksCount: undefined,
      yAxisTickValues: undefined,
      xAxisTickValues,
    });
  }
  $: if (histogram3Ref) {
    renderHistogram({
      histogramContainer: histogram3Ref,
      histogramData: stats.map_stats.cs_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: undefined,
      xAxisTickFormat: x => Math.floor(x).toFixed(0),
      yAxisTicksCount: undefined,
      yAxisTickValues: undefined,
      xAxisTickValues: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5],
    });
  }
  $: if (histogram4Ref) {
    renderHistogram({
      histogramContainer: histogram4Ref,
      histogramData: stats.map_stats.od_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: undefined,
      xAxisTickFormat: x => Math.floor(x).toFixed(0),
      yAxisTicksCount: undefined,
      yAxisTickValues: undefined,
      xAxisTickValues: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5],
    });
  }
  $: if (histogram5Ref) {
    renderHistogram({
      histogramContainer: histogram5Ref,
      histogramData: stats.map_stats.ar_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: undefined,
      xAxisTickFormat: x => Math.floor(x).toFixed(0),
      yAxisTicksCount: undefined,
      yAxisTickValues: undefined,
      xAxisTickValues: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5],
    });
  }
  $: if (histogram6Ref) {
    renderHistogram({
      histogramContainer: histogram6Ref,
      histogramData: stats.map_stats.length_distribution_seconds,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: undefined,
      xAxisTickFormat: x => {
        // format like 2:30
        const minutes = Math.floor(x / 60);
        const seconds = Math.floor(x % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      },
      yAxisTicksCount: undefined,
      yAxisTickValues: undefined,
      xAxisTickValues: undefined,
      xAxisTickCount: innerWidth < 600 ? 6 : 10,
    });
  }
</script>

<svelte:window bind:innerWidth />

<SvelteSeo
  title="osu!track Daily Challenge Stats"
  description="Maps, mappers, trends, and other stats for the osu! daily challenge"
  openGraph={{
    title: 'osu!track Daily Challenge Stats',
    description: 'Maps, mappers, trends, and other stats for the osu! daily challenge',
  }}
/>

<div class="root">
  <h1>Daily Challenge Stats</h1>
  <div class="stats-grid">
    <div class="scalar-stat">
      <div class="title">Total Challenges</div>
      <div class="value">{IntegerFormatter.format(stats.total_challenges)}</div>
    </div>
    <div class="scalar-stat">
      <div class="title">Total Unique Participants</div>
      <div class="value">{IntegerFormatter.format(stats.total_unique_participants)}</div>
    </div>
    <div class="scalar-stat">
      <div class="title">Total Leaderboard Entries</div>
      <div class="value">{IntegerFormatter.format(stats.total_rankings)}</div>
    </div>
    <div class="scalar-stat">
      <div class="title">Total Score</div>
      <div class="value">{TotalScoreFormatter.format(stats.total_combined_score)}</div>
    </div>
    <div>
      <div class="title">Star Distribution</div>
      <div class="histogram" bind:this={histogram1Ref}></div>
    </div>
    <div>
      <div class="title">Date Ranked Distribution</div>
      <div class="histogram" bind:this={histogram2Ref}></div>
    </div>
    <div>
      <div class="title">CS Distribution</div>
      <div class="histogram" bind:this={histogram3Ref}></div>
    </div>
    <div>
      <div class="title">OD Distribution</div>
      <div class="histogram" bind:this={histogram4Ref}></div>
    </div>
    <div>
      <div class="title">AR Distribution</div>
      <div class="histogram" bind:this={histogram5Ref}></div>
    </div>
    <div>
      <div class="title">Length Distribution</div>
      <div class="histogram" bind:this={histogram6Ref}></div>
    </div>
    <div>
      <div class="title">Most Featured Mappers</div>
      <div class="inline-list top-mappers-list">
        {#each stats.map_stats.top_mappers as { map_ids, user_id, username }, i}
          {@const style =
            i == 0 &&
            stats.map_stats.top_mappers.length > 1 &&
            stats.map_stats.top_mappers[1].map_ids.length < stats.map_stats.top_mappers.length
              ? 'font-size: 24px; font-weight: 500;'
              : undefined}
          <div {style}>
            <a href="https://osu.ppy.sh/u/{user_id}" target="_blank">{username}</a>
          </div>
          <div {style}>{map_ids.length}</div>
        {/each}
      </div>
    </div>
    <div>
      <div class="title">Most Required Mods</div>
      <div class="inline-list top-mods-list">
        <div class="header">Mods</div>
        <div class="header">Days Required</div>
        {#each stats.map_stats.top_required_mods as [mods, count]}
          <div class="mods-list">
            {#if mods.length}
              {#each mods as mod}
                <ModDisplay {mod} />
              {/each}
            {:else}
              <span style="color: hsl(0, 0%, 50%); font-size: 18px">None</span>
            {/if}
          </div>
          <div>{IntegerFormatter.format(count)}</div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    padding: 12px;
  }

  h1 {
    text-align: center;
    margin-top: 16px;
  }

  .stats-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 16px;
      border: 1px solid hsl(200, 10%, 15%);
      padding: 6px 8px;

      .title {
        font-size: 16px;
      }
    }

    .scalar-stat {
      .value {
        text-align: center;
        font-size: 54px;
        line-height: 22px;
        margin-bottom: 25px;
        margin-top: 16px;
      }
    }
  }

  .inline-list {
    display: grid;
    grid-template-columns: 1fr max-content;
    width: 100%;
    max-width: calc(min(90%, 200px));
    margin: 0 auto;
    gap: 4px;
    font-size: 18px;
    margin-bottom: 8px;

    .header {
      font-weight: 500;
      color: hsl(0, 0%, 70%);
      padding-bottom: 4px;
    }

    a {
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .top-mods-list {
    .mods-list {
      display: flex;
      gap: 4px;
    }

    & > div {
      height: 28px;
      max-height: 28px;
    }
  }

  .histogram {
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 28px;
      font-weight: 500;
    }

    .stats-grid {
      grid-template-columns: 1fr;

      & > div {
        .title {
          font-size: 14px;
        }
      }

      .scalar-stat {
        .value {
          font-size: 38px;
          margin-bottom: 16px;
          margin-top: 8px;
        }
      }
    }
  }

  @media (max-width: 700px) {
    h1 {
      margin-top: 40px;
    }
  }

  @media (max-width: 890px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
