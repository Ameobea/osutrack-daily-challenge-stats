<script lang="ts" context="module">
  const IntegerFormatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    maximumFractionDigits: 0,
  });

  const DateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formatDayID = (dayID: number) => {
    const date = dayIDToDate(dayID);
    return DateFormatter.format(date);
  };
</script>

<script lang="ts">
  import TooltipIcon from 'carbon-components-svelte/src/TooltipIcon/TooltipIcon.svelte';
  import Information from 'carbon-icons-svelte/lib/Information.svelte';

  import type { UserDailyChallengeStats } from '../../../api';
  import { colorPlacement, dayIDToDate } from '../../../util';
  import { renderHistogram } from '../../../components/histogram';

  export let userID: number;
  export let stats: UserDailyChallengeStats;

  let innerWidth = 550;
  let scoreHistogramContainer: HTMLDivElement;
  let timeOfDayHistogramContainer: HTMLDivElement;

  $: if (scoreHistogramContainer) {
    let svgWidth = Math.min(innerWidth - 10, 500);
    const svgHeight = Math.floor(svgWidth * 0.5);
    renderHistogram(
      scoreHistogramContainer,
      stats.score_distribution,
      svgHeight,
      svgWidth,
      undefined,
      { top: 10, right: 3, bottom: 20, left: 18 },
      undefined,
      3
    );
  }

  $: if (timeOfDayHistogramContainer) {
    let svgWidth = Math.min(innerWidth, 500);
    const svgHeight = Math.floor(svgWidth * 0.5);
    renderHistogram(
      timeOfDayHistogramContainer,
      stats.time_of_day_distribution,
      svgHeight,
      svgWidth,
      undefined,
      { top: 10, right: 8, bottom: 20, left: 25 },
      // converting from seconds from 0 to 86400 to hours from 0 to 24
      (x: number) => {
        const hourIxUTC = Math.floor(x / 3600);
        const date = new Date(`2024-04-20T${hourIxUTC < 10 ? 0 : ''}${hourIxUTC}:00:00Z`);
        return date.toLocaleTimeString(undefined, { hour: 'numeric' /*hour12: true*/ });
      },
      3
    );
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
        {IntegerFormatter.format(stats.total_score_stats.total_score_rank)}
        <TooltipIcon
          style="margin-left: 8px;"
          icon={Information}
          tooltipText="Ranked by sum of all daily challenge scores"
          direction="right"
        />
      </div>
      <div class="label">Total Score</div>
      <div class="value">{IntegerFormatter.format(stats.total_score_stats.total_score_sum)}</div>
      <div class="label">Best Placement</div>
      <div class="value">
        <span style:color={colorPlacement(stats.best_placement_absolute.rank)}>
          {IntegerFormatter.format(stats.best_placement_absolute.rank)}
        </span>
        /{IntegerFormatter.format(stats.best_placement_absolute.total_rankings)} on&nbsp;
        <a
          href="/osutrack/daily-challenge/user/{userID}/calendar?day={stats.best_placement_absolute
            .day_id}"
        >
          {formatDayID(stats.best_placement_absolute.day_id)}
        </a>
      </div>
      <div class="label">Highest Score</div>
      <div class="value">
        {IntegerFormatter.format(stats.best_placement_score.score)} on&nbsp;
        <a
          href="/osutrack/daily-challenge/user/{userID}/calendar?day={stats.best_placement_score
            .day_id}"
        >
          {formatDayID(stats.best_placement_score.day_id)}
        </a>
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
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    padding: 4px;
    min-width: min(100vw, 520px);
  }

  .top-stats {
    margin-top: 24px;
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

  @media (max-width: 600px) {
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
</style>
