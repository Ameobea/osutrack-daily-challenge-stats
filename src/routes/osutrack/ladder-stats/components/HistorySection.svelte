<script lang="ts">
  import type { AnalysisDataset } from '../types';
  import { getHistoryForRank } from '../utils';
  import HistoryChart from './HistoryChart.svelte';
  import { IntegerFormatter } from '../../../../util';

  let {
    analysisData,
    selectedRank = $bindable(),
  }: { analysisData: AnalysisDataset | null; selectedRank: number } = $props();

  const MIN_RANK = 1;
  const MAX_RANK = 2_000_000;
  const PIVOT_RANK = 50_000;
  const LOG_MIN = Math.log10(MIN_RANK);
  const LOG_MAX = Math.log10(MAX_RANK);
  const logRange = LOG_MAX - LOG_MIN;

  // Solve sliderValue^gamma = pivotNorm so slider midpoint (~0.5) maps near rank 50k
  const pivotNorm = (Math.log10(PIVOT_RANK) - LOG_MIN) / logRange;
  const sliderGamma = Math.log(pivotNorm) / Math.log(0.5);

  const sliderToRank = (value: number) => {
    const scaled = Math.pow(value, sliderGamma);
    const logRank = LOG_MIN + scaled * logRange;
    const rank = Math.round(10 ** logRank);
    return Math.min(MAX_RANK, Math.max(MIN_RANK, rank));
  };

  const rankToSlider = (rank: number) => {
    const clamped = Math.min(MAX_RANK, Math.max(MIN_RANK, rank));
    const norm = (Math.log10(clamped) - LOG_MIN) / logRange;
    return Math.pow(norm, 1 / sliderGamma);
  };

  const { ppHistory, decayHistory } = $derived.by(() => {
    if (!analysisData || !selectedRank) {
      return { ppHistory: [], decayHistory: [] };
    }

    return {
      ppHistory: getHistoryForRank(
        selectedRank,
        analysisData.pp_matrix,
        analysisData.dates,
        analysisData.buckets
      ),
      decayHistory: getHistoryForRank(
        selectedRank,
        analysisData.decay_matrix,
        analysisData.dates,
        analysisData.buckets
      ),
    };
  });

  const handleRankChange = (evt: Event) => {
    const target = evt.target as HTMLInputElement;
    const sliderValue = parseFloat(target.value);
    selectedRank = sliderToRank(sliderValue);
  };

  const formatRankValue = (value: number) => IntegerFormatter.format(Math.round(value));
  const formatPpTick = (value: number) => IntegerFormatter.format(Math.round(value));

  const computeSeriesStats = (series: [Date, number][]) => {
    if (!series.length) {
      return { min: 0, max: 0 };
    }

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for (const [, value] of series) {
      if (value < min) min = value;
      if (value > max) max = value;
    }

    return { min, max };
  };

  const formatNumber = (value: number, fractionDigits: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });

  const { ppAxis, decayAxis, decayFormatter } = $derived.by(() => {
    const ppStats = computeSeriesStats(ppHistory);
    const decayStats = computeSeriesStats(decayHistory);

    const paddedPPMax = ppStats.max > 0 ? ppStats.max * 1.1 : ppStats.max;

    const padValue = (value: number) => {
      if (value === 0) return 0;
      const padding = Math.abs(value) * 0.1;
      return value > 0 ? value + padding : value - padding;
    };

    const decayMax = padValue(decayStats.max);
    const decayMin = padValue(decayStats.min);

    const decayRangeMax = Math.max(Math.abs(decayMax), Math.abs(decayMin));
    const symmetricDecayRange = decayRangeMax === 0 ? 1 : decayRangeMax;
    const decayDecimals = symmetricDecayRange >= 100 ? 0 : symmetricDecayRange >= 10 ? 1 : 2;

    return {
      ppAxis: { min: 0, max: paddedPPMax },
      decayAxis: { min: -symmetricDecayRange, max: symmetricDecayRange },
      decayFormatter: (value: number) => formatNumber(value, decayDecimals),
    };
  });
</script>

<div class="history-section">
  <div class="controls">
    <label for="rank-slider" class="rank-display">
      Rank
      <span class="rank-number">{formatRankValue(selectedRank)}</span>
    </label>
    <input
      id="rank-slider"
      type="range"
      min="0"
      max="1"
      step="0.001"
      value={rankToSlider(selectedRank)}
      oninput={handleRankChange}
      class="slider"
      aria-valuetext={`Rank ${formatRankValue(selectedRank)}`}
    />
  </div>

  <div class="charts">
    <div class="chart-wrapper">
      <h3>PP History</h3>
      <p class="description">
        Performance points required to reach rank #{formatRankValue(selectedRank)} over time.
      </p>
      <HistoryChart
        data={ppHistory}
        yLabel="PP"
        color="#4CAF50"
        yMin={ppAxis.min}
        yMax={ppAxis.max}
        formatY={formatPpTick}
      />
    </div>
    <div class="chart-wrapper">
      <h3>Decay History</h3>
      <p class="description">
        Average rank decay per day for rank #{formatRankValue(selectedRank)} over time.
      </p>
      <HistoryChart
        data={decayHistory}
        yLabel="Rank Decay / Day"
        color="#F44336"
        yMin={decayAxis.min}
        yMax={decayAxis.max}
        formatY={decayFormatter}
      />
    </div>
  </div>
</div>

<style>
  .history-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 8px 4px;
    background: #fff;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    text-align: center;
  }

  .rank-display {
    font-size: clamp(1.25rem, 1.25rem + 1vw, 2rem);
    font-weight: 700;
    color: #111;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .rank-number {
    font-size: clamp(1.5rem, 2rem + 1.5vw, 2.25rem);
    font-weight: 800;
    color: #ff4081;
  }

  .slider {
    width: 100%;
  }

  .charts {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .chart-wrapper {
    display: flex;
    flex-direction: column;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #333;
  }

  .description {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: #666;
  }
</style>
