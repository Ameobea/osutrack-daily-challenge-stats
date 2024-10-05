<script lang="ts" context="module">
  const zeroPad = (num: number) => num.toString().padStart(2, '0');
</script>

<script lang="ts">
  import calendarize from 'calendarize';

  import type { DailyChallengeHistoryEntry } from '../../../../api';
  import { dayIDToDate } from '../../../../util';
  import CalendarCell from './CalendarCell.svelte';

  export let statsByDayID: Record<number, DailyChallengeHistoryEntry>;
  export let selectedDayID: number | null;
  export let setSelectedDayID: (dayID: number) => void;
  export let latestChallengeDayID: number;

  const initialSelectedDayID = selectedDayID;
  const now = initialSelectedDayID
    ? dayIDToDate(initialSelectedDayID)
    : dayIDToDate(latestChallengeDayID);
  let curYear = now.getFullYear();
  let curMonth = now.getMonth();

  $: calendarGrid = calendarize(new Date(curYear, curMonth));
</script>

<div class="header">
  <button
    disabled={curYear <= 2024 && curMonth <= 6}
    on:click={() => {
      curMonth -= 1;
      if (curMonth < 0) {
        curMonth = 11;
        curYear -= 1;
      }
    }}
  >
    Previous
  </button>

  <h1>
    {new Date(curYear, curMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
  </h1>

  <button
    disabled={curYear >= now.getFullYear() && curMonth >= now.getMonth()}
    on:click={() => {
      curMonth += 1;
      if (curMonth > 11) {
        curMonth = 0;
        curYear += 1;
      }
    }}
  >
    Next
  </button>
</div>

<div class="calendar">
  {#each calendarGrid as week}
    {#each week as day}
      {@const dayID = +`${curYear}${zeroPad(curMonth + 1)}${zeroPad(day)}`}
      {@const stats = statsByDayID[dayID]}
      <CalendarCell
        {stats}
        {dayID}
        {day}
        isSelected={dayID === selectedDayID}
        setIsSelected={() => setSelectedDayID(dayID)}
        {latestChallengeDayID}
      />
    {/each}
  {/each}
</div>

<style lang="css">
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

      &:disabled {
        cursor: default;
        color: #666;
        background-color: #333 !important;
      }
    }
  }

  .calendar {
    display: grid;
    /* make the cells square */
    grid-template-columns: repeat(7, 1fr);
    grid-auto-rows: 1fr;
    gap: 1px;
    max-width: min(760px, 100vw);
    width: 100%;
    margin: 0 auto;
  }

  @media (max-width: 600px) {
    .header {
      padding-left: 10px;
      padding-right: 10px;

      h1 {
        font-size: 24px;
      }
    }
  }
</style>
