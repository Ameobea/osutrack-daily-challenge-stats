<script lang="ts">
  import { submitAnalyticsEvent } from '../../../api';
  import type { PageData } from './$types';
  import type { RichHiscore } from './+page.server';
  import HiscoreTable from './HiscoreTable.svelte';
  import ScoreDetails from './ScoreDetails.svelte';
  import StatsExplorer from './StatsExplorer.svelte';

  let { data }: { data: PageData } = $props();

  let selectedScore = $state<RichHiscore | null>(null);
  let isScoreDetailsCollapsed = $state<boolean>(false);
  let filteredHiscores = $state<RichHiscore[] | null>(null);
  let showStatsExplorer = $state(false);

  const setSelectedScore = (score: RichHiscore | null) => {
    selectedScore = score;
    if (score !== null) {
      isScoreDetailsCollapsed = false;
    }

    setTimeout(() =>
      submitAnalyticsEvent({ category: 'hiscores_table', subcategory: 'select_score' })
    );
  };

  const toggleScoreDetailsCollapsed = () => {
    isScoreDetailsCollapsed = !isScoreDetailsCollapsed;
    if (isScoreDetailsCollapsed) {
      selectedScore = null;
    }

    setTimeout(() =>
      submitAnalyticsEvent({
        category: 'hiscores_table',
        subcategory: 'toggle_score_details_collapsed',
      })
    );
  };

  const toggleStatsExplorer = () => {
    showStatsExplorer = !showStatsExplorer;
    if (!showStatsExplorer) {
      filteredHiscores = null;
    } else {
      selectedScore = null;
      isScoreDetailsCollapsed = true;
    }

    setTimeout(() =>
      submitAnalyticsEvent({ category: 'hiscores_table', subcategory: 'toggle_stats_explorer' })
    );
  };

  const setFilteredHiscores = (hiscores: RichHiscore[] | null) => {
    filteredHiscores = hiscores;
    if (hiscores && selectedScore && !hiscores.includes(selectedScore)) {
      selectedScore = null;
    }
  };
</script>

<div class="root">
  <div class="controls">
    {#if !showStatsExplorer}
      <button class="open-stats-btn" onclick={toggleStatsExplorer}>Show Advanced Stats</button>
    {:else}
      <div class="stats-explorer-wrapper">
        <button class="close-stats-btn" onclick={toggleStatsExplorer} title="Close stats explorer">
          ×
        </button>
        <StatsExplorer hiscores={data.hiscores} {setFilteredHiscores} mode={data.mode} />
      </div>
    {/if}
  </div>

  <div class="table-contents">
    <HiscoreTable
      hiscores={filteredHiscores ?? data.hiscores}
      {selectedScore}
      {setSelectedScore}
      bind:showAdvancedStats={showStatsExplorer}
      mode={data.mode}
    />
    <ScoreDetails
      {selectedScore}
      isCollapsed={isScoreDetailsCollapsed}
      toggleCollapsed={toggleScoreDetailsCollapsed}
      mode={data.mode}
    />
  </div>
</div>

<style>
  .root {
    display: flex;
    flex-direction: column;
    height: calc(max(65vh, 800px));
    overflow: hidden;
    margin-top: 14px;
  }

  .controls {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .open-stats-btn {
    padding: 10px 20px;
    background-color: #5cc9e4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    transition: background-color 0.2s ease;
    align-self: flex-start;
  }

  .open-stats-btn:hover {
    background-color: #4db8d3;
  }

  .stats-explorer-wrapper {
    position: relative;
  }

  .close-stats-btn {
    appearance: none;
    all: unset;
    position: absolute;
    top: 8px;
    right: 8px;
    cursor: pointer;
    padding: 4px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    height: 20px;
    width: 20px;
    z-index: 10;
    border-radius: 4px;
  }

  .close-stats-btn:hover {
    background-color: rgba(0, 0, 0, 0.08);
    color: #333;
  }

  .table-contents {
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
</style>
