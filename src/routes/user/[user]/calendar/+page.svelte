<script lang="ts">
  import { queryParam } from 'sveltekit-search-params';

  import Calendar from './Calendar.svelte';
  import type { PageData } from '../$types';
  import StatsForDay from './StatsForDay.svelte';
  import type { DailyChallengeHistoryEntry } from '../../../../api';

  export let data: PageData;
  $: statsByDayID = data.history.reduce(
    (acc, stat) => {
      acc[stat.score.day_id] = stat;
      return acc;
    },
    {} as Record<number, DailyChallengeHistoryEntry>
  );

  let selectedDayID = queryParam('day', {
    decode: (value: string | null) => (value ? +value : null),
    encode: (value: number | null) => (value ? value.toString() : undefined),
  });
  const setSelectedDayID = (dayID: number) => selectedDayID.set(dayID);
</script>

<div class="root">
  <Calendar {statsByDayID} selectedDayID={$selectedDayID} {setSelectedDayID} />
  {#if $selectedDayID}
    <StatsForDay dayID={$selectedDayID} stats={statsByDayID[$selectedDayID]} />
  {:else}
    <p class="select-a-day-prompt">Select a day to view stats</p>
  {/if}
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .select-a-day-prompt {
    text-align: center;
    color: #888;
    font-style: italic;
    margin-top: 20px;
    font-size: 18px;
  }
</style>
