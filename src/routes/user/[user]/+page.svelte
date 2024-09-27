<script lang="ts">
  import calendarize from 'calendarize';
  import type { PageData } from './$types';
  import type { DailyChallengeHistoryEntry, DailyChallengeScore } from '../../../api';
  import CalendarCell from './CalendarCell.svelte';

  const zeroPad = (num: number) => num.toString().padStart(2, '0');

  export let data: PageData;
  $: statsByDayID = data.stats.reduce(
    (acc, stat) => {
      acc[stat.score.day_id] = stat;
      return acc;
    },
    {} as Record<number, DailyChallengeHistoryEntry>
  );

  const now = new Date();
  let curYear = now.getFullYear();
  let curMonth = now.getMonth();
  let selectedDayID: number | undefined;

  $: calendarGrid = calendarize(new Date(`${curYear}-${curMonth + 1}-01`));
</script>

<div class="root">
  <div class="header">
    <button
      on:click={() => {
        curMonth -= 1;
        if (curMonth < 0) {
          curMonth = 11;
          curYear -= 1;
        }
        calendarGrid = calendarize(new Date(`${curYear}-${curMonth + 1}-01`));
      }}>Previous</button
    >

    <h1>
      {new Date(curYear, curMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
    </h1>

    <button
      on:click={() => {
        curMonth += 1;
        if (curMonth > 11) {
          curMonth = 0;
          curYear += 1;
        }
        calendarGrid = calendarize(new Date(`${curYear}-${curMonth + 1}-01`));
      }}>Next</button
    >
  </div>

  <div class="calendar">
    {#each calendarGrid as week}
      {#each week as day}
        {@const dayID = +`${curYear}${zeroPad(curMonth + 1)}${zeroPad(day)}`}
        {@const stats = statsByDayID[dayID]}
        <CalendarCell
          {stats}
          {day}
          isSelected={dayID === selectedDayID}
          setIsSelected={() => {
            selectedDayID = dayID;
          }}
        />
      {/each}
    {/each}
  </div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    padding-left: 10%;
    padding-right: 10%;
    padding-top: 16px;
    padding-bottom: 16px;

    button {
      padding: 8px;
      border: 1px solid #cccccc99;
      border-radius: 4px;
      background-color: #333;
      cursor: pointer;
      color: #f9f9f9;
      font-size: 16px;
      width: 80px;

      &:active {
        background-color: #262626;
      }
    }
  }

  .calendar {
    display: grid;
    /* make the cells square */
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: 1fr;
    gap: 1px;
    max-width: 960px;
    width: 100%;
    margin: 0 auto;
  }
</style>
