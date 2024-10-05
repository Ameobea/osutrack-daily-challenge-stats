<script lang="ts">
  import type { DailyChallengeScore } from '../../../../api';
  import ModDisplay from '../../../../components/ModDisplay.svelte';
  import {
    colorPercentile,
    colorPlacement,
    FloatFormatter,
    getRankColor,
    IntegerFormatter,
  } from '../../../../util';

  export let score: DailyChallengeScore;
  export let totalScoresForDay: number;
</script>

<div class="root">
  <h2>Your Score</h2>
  <div class="score-ranking">
    Rank <span style:color={colorPlacement(score.user_rank)}
      >{IntegerFormatter.format(score.user_rank)}</span
    >/{IntegerFormatter.format(totalScoresForDay)} (Top
    <span style:color={colorPercentile(score.user_rank)}>
      {FloatFormatter.format((score.user_rank / totalScoresForDay) * 100)}%)
    </span>
  </div>
  <div class="mods">
    {#each score.mods as mod}
      <ModDisplay {mod} />
    {/each}
  </div>
  <div class="top">
    <div class="rank" style:color={getRankColor(score.rank)}>{score.rank}</div>
    <div class="total-score">{IntegerFormatter.format(score.total_score)}</div>
  </div>
  <div class="stats-table">
    <div>
      <div class="label">Accuracy</div>
      <div class="value">{`${FloatFormatter.format(score.accuracy * 100)}%`}</div>
    </div>
    <div>
      <div class="label">Max Combo</div>
      <div class="value">{score.max_combo}</div>
    </div>
    <div>
      <div class="label">PP</div>
      <div class="value">
        {typeof score.pp === 'number' ? FloatFormatter.format(score.pp) : '-'}
      </div>
    </div>
    <div>
      <div class="label">300</div>
      <div class="value">
        {IntegerFormatter.format(score.statistics.great)}
      </div>
    </div>
    <div>
      <div class="label">100</div>
      <div class="value">
        {IntegerFormatter.format(score.statistics.ok ?? 0)}
      </div>
    </div>
    <div>
      <div class="label">50</div>
      <div class="value">
        {IntegerFormatter.format(score.statistics.meh ?? 0)}
      </div>
    </div>
  </div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }

  h2 {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .mods {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  .top {
    display: flex;
    flex-direction: row;
    gap: 8px;
    line-height: 48px;
  }

  .rank {
    font-size: 36px;
  }

  .total-score {
    font-size: 32px;
    margin-bottom: 8px;
    font-weight: 300;
  }

  .score-ranking {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .stats-table {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    font-size: 16px;

    .label {
      color: hsl(0, 0%, 70%);
    }
  }
</style>
