<script lang="ts">
  import type { BestPlacement } from '../../../api';
  import { colorPlacement, formatDayID, IntegerFormatter } from '../../../util';

  export let placement: BestPlacement | null;
  export let userID: number;
</script>

{#if placement}
  <span style:color={colorPlacement(placement.rank)}>
    {IntegerFormatter.format(placement.rank)}
  </span>
  /{IntegerFormatter.format(placement.total_rankings)} on&nbsp;
  <a href="/osutrack/daily-challenge/user/{userID}/calendar?day={placement.day_id}">
    {typeof placement.total_rankings === 'number' ? formatDayID(placement.day_id) : '-'}
  </a>
{:else}
  -
{/if}
