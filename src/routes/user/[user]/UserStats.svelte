<script lang="ts">
  import TooltipIcon from 'carbon-components-svelte/src/TooltipIcon/TooltipIcon.svelte';
  import Information from 'carbon-icons-svelte/lib/Information.svelte';

  import type { UserDailyChallengeStats } from '../../../api';
  import {
    colorPercentile,
    colorPlacement,
    dayIDToDate,
    FloatFormatter,
    formatDayID,
    IntegerFormatter,
  } from '../../../util';
  import { renderHistogram } from '../../../components/histogram';
  import ModDisplay from '../../../components/ModDisplay.svelte';
  import BestPlacement from './BestPlacement.svelte';

  export let userID: number;
  export let username: string;
  export let stats: UserDailyChallengeStats;

  let innerWidth = 550;
  let scoreHistogramContainer: HTMLDivElement;
  let timeOfDayHistogramContainer: HTMLDivElement;
  let modsListManuallyExpanded = false;
  $: modsListExpanded =
    modsListManuallyExpanded || stats.most_used_mods.length <= 5 || innerWidth > 600;

  $: if (scoreHistogramContainer) {
    let svgWidth = Math.min(innerWidth - 10, 500);
    const svgHeight = Math.floor(svgWidth * 0.5);
    renderHistogram({
      histogramContainer: scoreHistogramContainer,
      histogramData: stats.score_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: { top: 10, right: 3, bottom: 20, left: 18 },
      xAxisTickFormat: undefined,
      yAxisTicksCount: 3,
    });
  }

  $: if (timeOfDayHistogramContainer) {
    let svgWidth = Math.min(innerWidth, 500);
    const svgHeight = Math.floor(svgWidth * 0.5);
    renderHistogram({
      histogramContainer: timeOfDayHistogramContainer,
      histogramData: stats.time_of_day_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: { top: 10, right: 8, bottom: 20, left: 25 },
      // converting from seconds from 0 to 86400 to hours from 0 to 24
      xAxisTickFormat: (x: number) => {
        const hourIxUTC = Math.floor(x / 3600);
        const date = new Date(`2024-04-20T${hourIxUTC < 10 ? 0 : ''}${hourIxUTC}:00:00Z`);
        return date.toLocaleTimeString(undefined, { hour: 'numeric' });
      },
      yAxisTicksCount: 3,
    });
  }
</script>

<svelte:window bind:innerWidth />

<div class="root">
  <div class="top-stats">
    <div class="stats-table">
      <div class="label">Total Participation</div>
      <div class="value">
        {IntegerFormatter.format(stats.total_participation)}/{IntegerFormatter.format(
          stats.total_challenge_count
        )}
      </div>
      <div class="label">Best Daily Streak</div>
      <div class="value">{IntegerFormatter.format(stats.streaks.best_daily_streak)}</div>
      <div class="label">Current Daily Streak</div>
      <div class="value">{IntegerFormatter.format(stats.streaks.cur_daily_streak)}</div>
      <div class="label">Best Weekly Streak</div>
      <div class="value">{IntegerFormatter.format(stats.streaks.best_weekly_streak)}</div>
      <div class="label">Current Weekly Streak</div>
      <div class="value">{IntegerFormatter.format(stats.streaks.cur_weekly_streak)}</div>
    </div>
    <div class="stats-table">
      <div class="label">Global Daily Challenge Rank</div>
      <div class="value">
        {#if stats.total_score_stats.total_score_rank}
          <a
            href="/osutrack/daily-challenge/rankings{(() => {
              const pageSize = 50;
              const pageNumber = Math.floor(
                (stats.total_score_stats.total_score_rank - 1) / pageSize
              );
              return pageNumber > 0 ? `?page=${pageNumber + 1}` : '';
            })()}#username={encodeURIComponent(username)}"
          >
            {IntegerFormatter.format(stats.total_score_stats.total_score_rank)}
          </a>
          <TooltipIcon
            style="margin-left: 8px;"
            icon={Information}
            tooltipText="Ranked by sum of all daily challenge scores"
            direction="right"
          />
        {:else}
          -
        {/if}
      </div>
      <div class="label">Total Score</div>
      <div class="value">{IntegerFormatter.format(stats.total_score_stats.total_score_sum)}</div>
      <div class="label">Best Placement (Rank)</div>
      <div class="value">
        <BestPlacement placement={stats.best_placement_absolute} {userID} />
      </div>
      <div class="label">Best Placement (Percentile)</div>
      <div class="value">
        {#if typeof stats.best_placement_percentile?.score === 'number'}
          <span style:color={colorPercentile(stats.best_placement_percentile?.percentile)}>
            {FloatFormatter.format(stats.best_placement_percentile.percentile)}%
          </span>
          &nbsp;on&nbsp;
          <a
            href="/osutrack/daily-challenge/user/{userID}/calendar?day={stats
              .best_placement_percentile.day_id}"
          >
            {formatDayID(stats.best_placement_percentile.day_id)}
          </a>
        {:else}
          -
        {/if}
      </div>
      <div class="label">Highest Score</div>
      <div class="value">
        {#if typeof stats.best_placement_score?.score === 'number'}
          {IntegerFormatter.format(stats.best_placement_score.score)} on&nbsp;
          <a
            href="/osutrack/daily-challenge/user/{userID}/calendar?day={stats.best_placement_score
              .day_id}"
          >
            {formatDayID(stats.best_placement_score.day_id)}
          </a>
        {:else}
          -
        {/if}
      </div>
      <div class="label">Highest PP</div>
      <div class="value">
        {#if typeof stats.best_placement_pp?.score === 'number'}
          {typeof stats.best_placement_pp.pp === 'number'
            ? stats.best_placement_pp.pp.toFixed(2)
            : '-'} on&nbsp;
          <a
            href="/osutrack/daily-challenge/user/{userID}/calendar?day={stats.best_placement_pp
              .day_id}"
          >
            {formatDayID(stats.best_placement_pp.day_id)}
          </a>
        {:else}
          -
        {/if}
      </div>
    </div>
  </div>
  <div class="histograms">
    <div>
      <h3>Score Distribution</h3>
      <div class="score-histogram" bind:this={scoreHistogramContainer}></div>
    </div>
    <div>
      <h3>Time of Day Distribution</h3>
      <div class="time-of-day-histogram" bind:this={timeOfDayHistogramContainer}></div>
    </div>
  </div>
  <div style="margin-top: 42px">
    <div class="mods">
      <h3>Most Used Mods</h3>
      <div class="top-mods-list-wrapper">
        <div class="inline-list top-mods-list">
          <div class="header">Mods</div>
          <div class="header">Days Used</div>
          {#each stats.most_used_mods as [mod, count], i}
            {#if i < 5 || modsListExpanded}
              {#if mod}
                <ModDisplay {mod} />
              {:else}
                <span style="color: hsl(0, 0%, 50%); font-size: 18px">None</span>
              {/if}
              <div>{IntegerFormatter.format(count)}</div>
            {/if}
          {/each}
        </div>
      </div>
      {#if !modsListExpanded && stats.most_used_mods.length > 5}
        <button
          class="expand-button"
          on:click={() => {
            modsListManuallyExpanded = true;
          }}
        >
          Show All
        </button>
      {/if}
    </div>
  </div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    padding: 4px;
    min-width: min(100vw, 520px);
  }

  .histograms,
  .top-stats {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: space-between;
    padding-left: 40px;
    padding-right: 40px;
  }

  h3 {
    font-size: 22px;
  }

  .histograms {
    margin-top: 42px;

    & > div {
      display: flex;
      flex-direction: column;
      align-items: center;

      h3 {
        margin-bottom: 8px;
      }
    }
  }

  .stats-table {
    flex: 1;
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    min-width: calc(min(100vw - 20px, 520px));
    max-width: calc(min(100vw - 20px, 520px));
    border: 1px solid hsl(200, 10%, 15%);
    padding: 6px;

    & > div {
      padding: 4px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .label {
      font-weight: 500;
      font-size: 17px;
    }

    .value {
      font-size: 15px;
    }
  }

  .mods {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
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
    padding-left: 16px;
    padding-right: 16px;

    .header {
      font-weight: 500;
      color: hsl(0, 0%, 70%);
      padding-bottom: 4px;
    }

    & > div {
      height: 28px;
      max-height: 28px;
    }
  }

  .expand-button {
    margin-top: 8px;
    margin-left: auto;
    margin-right: auto;
    display: block;
    padding: 4px 8px;
    border: 1px solid hsl(200, 10%, 15%);
    border-radius: 4px;
    background-color: hsl(200, 10%, 15%);
    color: hsl(0, 0%, 90%);
    font-size: 16px;
    cursor: pointer;
  }

  .top-mods-list-wrapper {
    width: 100%;
    max-width: 500px;
    max-height: calc(min(80vh, 600px));
    margin-top: 24px;
  }

  @media (min-width: 601px) {
    .top-mods-list-wrapper {
      overflow-y: auto;
      overflow-x: visible;
    }

    .top-stats {
      margin-top: 24px;
    }
  }

  @media (max-width: 600px) {
    .top-stats {
      margin-top: 8px;
    }

    .stats-table {
      grid-template-columns: 1fr;

      & > div {
        padding: 2px;
      }
    }

    .stats-table .label {
      font-size: 15px;
    }

    .value {
      font-size: 13.5px;
    }

    .histograms,
    .top-stats {
      padding-left: 0px;
      padding-right: 0px;
      justify-content: center;
    }

    h3 {
      font-size: 18px;
    }
  }

  @media (max-width: 1135px) {
    .top-stats,
    .histograms {
      justify-content: center;
    }
  }
</style>
