<script lang="ts">
  import TooltipIcon from 'carbon-components-svelte/src/TooltipIcon/TooltipIcon.svelte';
  import TooltipDefinition from 'carbon-components-svelte/src/TooltipDefinition/TooltipDefinition.svelte';
  import Information from 'carbon-icons-svelte/lib/Information.svelte';

  import type { DailyChallengeUserStats } from '../../../../../api';
  import {
    colorPercentile,
    FloatFormatter,
    formatDayID,
    IntegerFormatter,
  } from '../../../../../util';
  import { renderHistogram } from '../../../../../components/histogram';
  import ModDisplay from '../../../../../components/ModDisplay.svelte';
  import BestPlacement from './BestPlacement.svelte';

  export let userID: number;
  export let username: string;
  export let stats: DailyChallengeUserStats;

  let innerWidth = 550;
  let scoreHistogramContainer: HTMLDivElement;
  let timeOfDayHistogramContainer: HTMLDivElement;
  let modsListManuallyExpanded = false;
  $: modsListExpanded =
    modsListManuallyExpanded || stats.most_used_mods.length <= 5 || innerWidth > 600;

  $: svgWidth = Math.min(innerWidth - 10, 400);
  $: svgHeight = Math.floor(svgWidth * 0.5);

  $: if (scoreHistogramContainer) {
    renderHistogram({
      histogramContainer: scoreHistogramContainer,
      histogramData: stats.score_distribution,
      svgHeight,
      svgWidth,
      userScore: undefined,
      margin: { top: 10, right: 3, bottom: 20, left: 22 },
      xAxisTickFormat: undefined,
      yAxisTicksCount: 3,
    });
  }

  $: if (timeOfDayHistogramContainer) {
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
    <table class="stats-table">
      <tbody>
        <tr>
          <td class="label">Total Participation</td>
          <td class="value">
            <span
              class={stats.total_participation === stats.total_challenge_count
                ? 'rainbow-text'
                : undefined}
            >
              {IntegerFormatter.format(stats.total_participation)}/{IntegerFormatter.format(
                stats.total_challenge_count
              )}
            </span>
          </td>
        </tr>
        <tr>
          <td class="label">Best Daily Streak</td>
          <td class="value">{IntegerFormatter.format(stats.streaks.best_daily_streak)}</td>
        </tr>
        <tr>
          <td class="label">Current Daily Streak</td>
          <td class="value">{IntegerFormatter.format(stats.streaks.cur_daily_streak)}</td>
        </tr>
        <tr>
          <td class="label">Best Weekly Streak</td>
          <td class="value">{IntegerFormatter.format(stats.streaks.best_weekly_streak)}</td>
        </tr>
        <tr>
          <td class="label">Current Weekly Streak</td>
          <td class="value">{IntegerFormatter.format(stats.streaks.cur_weekly_streak)}</td>
        </tr>
      </tbody>
    </table>
    <table class="stats-table">
      <tbody>
        <tr>
          <td class="label">Global Daily Challenge Rank</td>
          <td class="value">
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
          </td>
        </tr>
        <tr>
          <td class="label">Total Score</td>
          <td class="value">
            {IntegerFormatter.format(stats.total_score_stats.total_score_sum)}
          </td>
        </tr>
        <tr>
          <td class="label">Best Placement (Rank)</td>
          <td class="value">
            <BestPlacement placement={stats.best_placement_absolute} {userID} />
          </td>
        </tr>
        <tr>
          <td class="label">Best Placement (Percentile)</td>
          <td class="value">
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
          </td>
        </tr>
        <tr>
          <td class="label">Highest Score</td>
          <td class="value">
            {#if typeof stats.best_placement_score?.score === 'number'}
              {IntegerFormatter.format(stats.best_placement_score.score)} on&nbsp;
              <a
                href="/osutrack/daily-challenge/user/{userID}/calendar?day={stats
                  .best_placement_score.day_id}"
              >
                {formatDayID(stats.best_placement_score.day_id)}
              </a>
            {:else}
              -
            {/if}
          </td>
        </tr>
        <tr>
          <td class="label">Highest PP</td>
          <td class="value">
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
          </td>
        </tr>
      </tbody>
    </table>
    <table class="stats-table">
      <tbody>
        <tr>
          <td class="label">Top 50% Count</td>
          <td class="value">
            {IntegerFormatter.format(stats.top_50_percent_count)}
            {#if typeof stats.top_50_percent_rank === 'number'}
              (<a
                href="/osutrack/daily-challenge/rankings/top_50p{(() => {
                  const pageSize = 50;
                  const pageNumber = Math.floor((stats.top_50_percent_rank - 1) / pageSize);
                  return pageNumber > 0 ? `?page=${pageNumber + 1}` : '';
                })()}#username={encodeURIComponent(username)}"
              >
                #{IntegerFormatter.format(stats.top_50_percent_rank)}</a
              >)
            {/if}
          </td>
        </tr>
        <tr>
          <td class="label">Top 10% Count</td>
          <td class="value">
            {IntegerFormatter.format(stats.top_10_percent_count)}
            {#if typeof stats.top_10_percent_rank === 'number'}
              (<a
                href="/osutrack/daily-challenge/rankings/top_10p{(() => {
                  const pageSize = 50;
                  const pageNumber = Math.floor((stats.top_10_percent_rank - 1) / pageSize);
                  return pageNumber > 0 ? `?page=${pageNumber + 1}` : '';
                })()}#username={encodeURIComponent(username)}"
              >
                #{IntegerFormatter.format(stats.top_10_percent_rank)}</a
              >)
            {/if}
          </td>
        </tr>
        <tr>
          <td class="label">Top 1% Count</td>
          <td class="value">
            {IntegerFormatter.format(stats.top_1_percent_count)}
            {#if typeof stats.top_1_percent_rank === 'number'}
              (<a
                href="/osutrack/daily-challenge/rankings/top_1p{(() => {
                  const pageSize = 50;
                  const pageNumber = Math.floor((stats.top_1_percent_rank - 1) / pageSize);
                  return pageNumber > 0 ? `?page=${pageNumber + 1}` : '';
                })()}#username={encodeURIComponent(username)}"
              >
                #{IntegerFormatter.format(stats.top_1_percent_rank)}</a
              >)
            {/if}
          </td>
        </tr>
        {#if stats.first_place_count > 0}
          <tr>
            <td class="label">First Place Count</td>
            <td class="value">
              {IntegerFormatter.format(stats.first_place_count)}
              {#if typeof stats.first_place_rank === 'number'}
                (<a
                  href="/osutrack/daily-challenge/rankings/first_place{(() => {
                    const pageSize = 50;
                    const pageNumber = Math.floor((stats.first_place_rank - 1) / pageSize);
                    return pageNumber > 0 ? `?page=${pageNumber + 1}` : '';
                  })()}#username={encodeURIComponent(username)}"
                >
                  #{IntegerFormatter.format(stats.first_place_rank)}</a
                >)
              {/if}
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
    <table class="stats-table">
      <tbody>
        <tr>
          <td class="label">Top 50% Streak</td>
          <td class="value streak-cols">
            <div>
              Best: {#if stats.streaks.best_top_50_percent_streak_span}
                <TooltipDefinition direction="top">
                  <span style="font-size: 14px">
                    {IntegerFormatter.format(stats.streaks.best_top_50_percent_streak)}
                  </span>

                  <span slot="tooltip">
                    {formatDayID(stats.streaks.best_top_50_percent_streak_span[0])} - {formatDayID(
                      stats.streaks.best_top_50_percent_streak_span[1]
                    )}
                  </span>
                </TooltipDefinition>
              {:else}
                <span style="font-size: 14px">
                  {IntegerFormatter.format(stats.streaks.best_top_50_percent_streak)}
                </span>
              {/if}
            </div>
            <div>Current: {IntegerFormatter.format(stats.streaks.cur_top_50_percent_streak)}</div>
          </td>
        </tr>
        <tr>
          <td class="label">Top 10% Streak</td>
          <td class="value streak-cols">
            <div>
              Best: {#if stats.streaks.best_top_10_percent_streak_span}
                <TooltipDefinition direction="top">
                  <span style="font-size: 14px">
                    {IntegerFormatter.format(stats.streaks.best_top_10_percent_streak)}
                  </span>

                  <span slot="tooltip">
                    {formatDayID(stats.streaks.best_top_10_percent_streak_span[0])} - {formatDayID(
                      stats.streaks.best_top_10_percent_streak_span[1]
                    )}
                  </span>
                </TooltipDefinition>
              {:else}
                <span style="font-size: 14px">
                  {IntegerFormatter.format(stats.streaks.best_top_10_percent_streak)}
                </span>
              {/if}
            </div>
            <div>Current: {IntegerFormatter.format(stats.streaks.cur_top_10_percent_streak)}</div>
          </td>
        </tr>
        <tr>
          <td class="label">Top 1% Streak</td>
          <td class="value streak-cols">
            <div>
              Best: {#if stats.streaks.best_top_1_percent_streak_span}
                <TooltipDefinition direction="top">
                  <span style="font-size: 14px">
                    {IntegerFormatter.format(stats.streaks.best_top_1_percent_streak)}
                  </span>

                  <span slot="tooltip">
                    {formatDayID(stats.streaks.best_top_1_percent_streak_span[0])} - {formatDayID(
                      stats.streaks.best_top_1_percent_streak_span[1]
                    )}
                  </span>
                </TooltipDefinition>
              {:else}
                <span style="font-size: 14px">
                  {IntegerFormatter.format(stats.streaks.best_top_1_percent_streak)}
                </span>
              {/if}
            </div>
            <div>Current: {IntegerFormatter.format(stats.streaks.cur_top_1_percent_streak)}</div>
          </td>
        </tr>
      </tbody>
    </table>
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
      <div class={`top-mods-list-wrapper${modsListManuallyExpanded ? ' expanded' : ''}`}>
        <table class="inline-list top-mods-list">
          <thead>
            <tr>
              <th class="header">Mods</th>
              <th class="header">Days Used</th>
            </tr>
          </thead>
          <tbody>
            {#each stats.most_used_mods as [mod, count], i}
              {#if i < 5 || modsListExpanded}
                <tr>
                  <td class="mod">
                    {#if mod}
                      <ModDisplay {mod} />
                    {:else}
                      <span style="color: hsl(0, 0%, 50%); font-size: 18px">None</span>
                    {/if}
                  </td>
                  <td class="count">
                    <div>{IntegerFormatter.format(count)}</div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
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
    min-width: calc(min(100vw - 20px, 520px));
    max-width: calc(min(100vw - 20px, 520px));
    border: 1px solid hsl(200, 10%, 15%);

    td {
      padding-left: 10px;
      padding-right: 10px;
      padding-bottom: 4px;
      padding-top: 4px;
      vertical-align: middle;
    }

    tr:first-child > td {
      padding-top: 8px;
    }

    tr:last-child > td {
      padding-bottom: 8px;
    }

    .label {
      font-weight: 500;
      font-size: 17px;
      width: 52%;
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
    table-layout: auto;
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

    th {
      text-align: left;
    }

    td {
      height: 28px;
      max-height: 28px;
    }

    .mod {
      width: 100%;
    }

    .count,
    th {
      white-space: nowrap;
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
    max-width: 400px;
    max-height: calc(min(80vh, 600px));
    margin-top: 24px;
  }

  .top-mods-list-wrapper.expanded {
    max-height: none;
  }

  .streak-cols {
    display: flex;
    flex-direction: row;

    > div {
      flex: 1;
      max-width: calc(max(40%, 100px));
    }
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

  .rainbow-text {
    background: linear-gradient(
      270deg,
      red,
      orange,
      yellow,
      green,
      rgb(0, 98, 255),
      rgb(146, 22, 234),
      violet,
      rgb(237, 38, 16)
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
