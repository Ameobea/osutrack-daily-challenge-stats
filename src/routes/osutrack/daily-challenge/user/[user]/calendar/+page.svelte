<script lang="ts">
  import { queryParam } from 'sveltekit-search-params';

  import Calendar from './Calendar.svelte';
  import type { PageData } from './$types';
  import StatsForDay from './StatsForDay.svelte';
  import type { DailyChallengeHistoryEntry } from '../../../../../../api';
  import { formatDayID } from '../../../../../../util';

  export let data: PageData;
  $: statsByDayID = data.history.reduce(
    (acc, stat) => {
      acc[stat.score.day_id] = stat;
      return acc;
    },
    {} as Record<number, DailyChallengeHistoryEntry>
  );

  const selectedDayID = queryParam('day', {
    decode: (value: string | null) => (value ? +value : null),
    encode: (value: number | null) => (value ? value.toString() : undefined),
  });
  const setSelectedDayID = (dayID: number) => selectedDayID.set(dayID);

  $: metadata = (() => {
    if ($selectedDayID) {
      return {
        title: `${data.username} | ${formatDayID($selectedDayID, true)} Daily Challenge Stats`,
        description: `osu! daily challenge stats for ${data.username} on ${formatDayID($selectedDayID, true)}`,
      };
    } else {
      return {
        title: `${data.username} | Daily Challenge Calendar`,
        description: `osu! daily challenge calendar for ${data.username}`,
      };
    }
  })();
  $: title = metadata.title;
  $: description = metadata.description;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
</svelte:head>

<div class="root">
  <Calendar
    {statsByDayID}
    selectedDayID={$selectedDayID}
    {setSelectedDayID}
    latestChallengeDayID={data.latestChallengeDayID}
  />
  {#if $selectedDayID}
    <StatsForDay
      dayID={$selectedDayID}
      stats={statsByDayID[$selectedDayID]}
      username={data.username}
    />
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
