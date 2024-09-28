<script lang="ts">
  import Calendar from './Calendar.svelte';

  import type { PageData } from '../$types';
  import StatsForDay from './StatsForDay.svelte';
  import type { DailyChallengeHistoryEntry } from '../../../../api';

  export let data: PageData;
  $: statsByDayID = data.stats.reduce(
    (acc, stat) => {
      acc[stat.score.day_id] = stat;
      return acc;
    },
    {} as Record<number, DailyChallengeHistoryEntry>
  );

  let selectedDayID: number | null = null;
  const setSelectedDayID = (dayID: number) => {
    selectedDayID = dayID;
  };
</script>

<div class="root">
  <Calendar {statsByDayID} {selectedDayID} {setSelectedDayID} />
  {#if selectedDayID}
    <StatsForDay dayID={selectedDayID} stats={statsByDayID[selectedDayID]} />
  {/if}
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
