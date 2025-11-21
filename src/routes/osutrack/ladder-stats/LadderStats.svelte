<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  import { getCompressedLadderStatsData, type SimulationConfig } from '../../../api';
  import HistorySection from './components/HistorySection.svelte';
  import RankSimulator from './components/RankSimulator.svelte';
  import DistributionChart from './components/DistributionChart.svelte';
  import type { AnalysisDataset } from './types';
  import * as DecompressorModule from './data-decompressor/pkg/data_decompressor';
  import wasmPath from './data-decompressor/pkg/data_decompressor_bg.wasm?url';

  let { simulationConfig, mode }: { simulationConfig: SimulationConfig; mode: number } = $props();

  let analysisData = $state.raw<AnalysisDataset | null>(null);
  let selectedDate = $state<Date | null>(null);
  let selectedRank = $state<number>(50_000);
  // TODO: add an input box for users to specify their username and have their rank looked up and populated

  onMount(() => {
    if (!browser) {
      return;
    }

    const decompresssorPromise = DecompressorModule.default(
      new URL(wasmPath, window.location.href)
    );
    const dataFetchPromise = getCompressedLadderStatsData(mode);

    Promise.all([decompresssorPromise, dataFetchPromise])
      .then(([_decompressorInited, compressedData]) => {
        const ptr = DecompressorModule.decompress_data(new Uint8Array(compressedData));
        const startDateEpoch = Number(DecompressorModule.get_start_date_epoch(ptr));
        const numDays = DecompressorModule.get_days_count(ptr);
        const rankBuckets = DecompressorModule.take_rank_buckets(ptr);
        const ppMatrix = DecompressorModule.take_pp_matrix(ptr);
        const decayMatrix = DecompressorModule.take_decay_matrix(ptr);
        DecompressorModule.free_decompressed_data(ptr);

        const dates = [];
        const startDate = new Date(startDateEpoch * 1000);
        for (let i = 0; i < numDays; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          dates.push(date);
        }
        selectedDate = dates[dates.length - 1];

        analysisData = {
          dates,
          buckets: rankBuckets,
          pp_matrix: ppMatrix,
          decay_matrix: decayMatrix,
        };
      })
      .catch(err => {
        console.error('Error loading or decompressing ladder stats data:', err);
        // TODO: show error message to user
      });
  });
</script>

<div class="root">
  <header>
    <h1>osu! Ranked Ladder Stats</h1>
  </header>

  <main>
    <section class="section">
      <HistorySection {analysisData} {selectedRank} />
    </section>

    <section class="grid-section section">
      <RankSimulator {simulationConfig} />
      <DistributionChart {analysisData} {selectedDate} />
    </section>
  </main>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1270px;
    margin: 0 auto;
    padding: 8px 0;
  }

  header {
    margin-bottom: 16px;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    margin-top: 8px;
  }

  main {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: center;
  }

  .section {
    width: min(100%, 900px);
  }

  .grid-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
</style>
