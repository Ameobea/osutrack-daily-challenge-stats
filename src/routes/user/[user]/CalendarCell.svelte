<script lang="ts" context="module">
  const RankFormatter = new Intl.NumberFormat();
  const PercentFormatter = new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
</script>

<script lang="ts">
  import type { DailyChallengeHistoryEntry } from '../../../api';

  export let stats: DailyChallengeHistoryEntry | undefined;
  export let day: number;
  export let isSelected: boolean;
  export let setIsSelected: () => void;
</script>

<div
  class="root"
  style:background={(() => {
    if (!day) {
      return '#262626';
    }

    if (isSelected) {
      return 'hsl(333, 24%, 18%)';
    }

    return undefined;
  })()}
  style:border={isSelected ? '1px solid #ccccccff' : undefined}
  style:cursor={isSelected || !day ? undefined : 'pointer'}
  on:click={day ? () => setIsSelected() : undefined}
  tabindex={0}
  role="button"
  aria-label={day ? `Day ${day}` : 'Empty day'}
  on:keydown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsSelected();
    }
  }}
>
  {#if day}
    <div class="day">{day}</div>
    <span class="data">
      {#if stats}
        <span class="percent">
          {PercentFormatter.format(stats.percentile / 100)}
        </span>
        <br />
        <span class="rank">
          <span style:color={stats.score.user_rank <= 50 ? 'green' : undefined}
            >{RankFormatter.format(stats.score.user_rank)}</span
          >/{RankFormatter.format(stats.total_rankings)}
        </span>
      {/if}
    </span>
  {/if}
</div>

<style lang="css">
  .root {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
    border: 1px solid #cccccc99;
    background: #111;
    text-align: center;
  }

  .data {
    font-size: 18px;
  }

  .day {
    position: absolute;
    top: 4px;
    left: 4px;
    color: #ccccccdd;
    font-size: 13px;
  }

  .rank {
    font-size: 13.5px;
  }
</style>
