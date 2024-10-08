<script lang="ts" context="module">
  const RankFormatter = new Intl.NumberFormat();
  const PercentFormatter = new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
</script>

<script lang="ts">
  import type { DailyChallengeHistoryEntry } from '../../../../api';
  import { colorPercentile, colorPlacement } from '../../../../util';

  export let stats: DailyChallengeHistoryEntry | undefined;
  export let dayID: number;
  export let day: number;
  export let isSelected: boolean;
  export let setIsSelected: () => void;
  export let latestChallengeDayID: number;

  $: isSelectable = !isSelected && !!day && dayID >= 20240725 && dayID <= latestChallengeDayID;
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
  style:cursor={isSelectable ? 'pointer' : undefined}
  on:click={isSelectable ? () => setIsSelected() : undefined}
  tabindex={isSelectable ? 0 : undefined}
  role={isSelectable ? 'button' : undefined}
  on:keydown={isSelectable
    ? e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setIsSelected();
        }
      }
    : undefined}
>
  {#if day}
    <div class="day">{day}</div>
    <span class="data">
      {#if stats}
        <span class="percent" style:color={colorPercentile(stats.percentile)}>
          {PercentFormatter.format(stats.percentile / 100)}
        </span>
        <br />
        <span class="rank">
          <span style:color={colorPlacement(stats.score.user_rank)}>
            {RankFormatter.format(stats.score.user_rank)}
          </span>/{RankFormatter.format(stats.total_rankings)}
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

  @media (max-width: 600px) {
    .rank {
      display: none;
    }

    .percent {
      font-size: 14px;
    }

    .day {
      top: 2px;
      left: 2px;
      font-size: 11px;
    }
  }
</style>
