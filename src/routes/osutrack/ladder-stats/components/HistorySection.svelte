<script lang="ts">
  import type { AnalysisDataset } from '../types';
  import { getHistoryForRank } from '../utils';
  import HistoryChart from './HistoryChart.svelte';
  import { IntegerFormatter } from '../../../../util';
  import { fetchUserStats, submitAnalyticsEvent } from '../../../../api';

  let {
    analysisData,
    selectedRank = $bindable(),
    mode,
    changeMode,
  }: {
    analysisData: AnalysisDataset | null;
    selectedRank: number;
    mode: number;
    changeMode: (newMode: number) => void;
  } = $props();

  const MIN_RANK = 1;
  let MAX_RANK = $derived.by(
    () =>
      (({ [0]: 2_000_000, [1]: 250_000, [2]: 100_000, [3]: 1_000_000 }) as Record<number, number>)[
        mode
      ]
  );
  let PIVOT_RANK = $derived.by(
    () => (({ [0]: 50_000, [1]: 10_000, [2]: 5_000, [3]: 25_000 }) as Record<number, number>)[mode]
  );
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

  const modeOptions = [
    { value: 0, label: 'Standard' },
    { value: 1, label: 'Taiko' },
    { value: 2, label: 'Catch the Beat' },
    { value: 3, label: 'Mania' },
  ];

  const selectedModeMeta = $derived.by(
    () => modeOptions.find(option => option.value === mode) ?? modeOptions[0]
  );

  const handleModeChange = (evt: Event) => {
    const target = evt.target as HTMLSelectElement;
    const nextMode = Number(target.value);

    if (Number.isNaN(nextMode) || nextMode === mode) return;

    changeMode(nextMode);
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
    setTimeout(() =>
      submitAnalyticsEvent(
        { category: 'ladder_stats', subcategory: 'rank_slider_input' },
        'osu-daily-challenge',
        true
      )
    );

    const target = evt.target as HTMLInputElement;
    const sliderValue = parseFloat(target.value);
    selectedRank = sliderToRank(sliderValue);
  };

  const formatRankValue = (value: number) => IntegerFormatter.format(Math.round(value));

  const clampRank = (value: number) => Math.min(MAX_RANK, Math.max(MIN_RANK, value));

  let rankInputValue = $state(formatRankValue(selectedRank));
  let isRankInputFocused = $state(false);

  $effect(() => {
    if (!isRankInputFocused) {
      rankInputValue = formatRankValue(selectedRank);
    }
  });

  const handleRankInputFocus = () => {
    isRankInputFocused = true;
    rankInputValue = String(selectedRank);
  };

  const handleRankInputBlur = () => {
    isRankInputFocused = false;
  };

  const handleRankInput = (evt: Event) => {
    setTimeout(() =>
      submitAnalyticsEvent(
        { category: 'ladder_stats', subcategory: 'rank_input_entry' },
        'osu-daily-challenge',
        true
      )
    );

    const target = evt.target as HTMLInputElement;
    const numericValue = target.value.replace(/[^0-9]/g, '');

    if (!numericValue) {
      rankInputValue = '';
      return;
    }

    const parsed = clampRank(Number(numericValue));
    rankInputValue = String(parsed);
    selectedRank = parsed;
  };

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

  type LookupStatus = 'idle' | 'loading' | 'success' | 'error';

  let usernameQuery = $state('');
  let usernameStatus = $state<LookupStatus>('idle');
  let usernameMessage = $state<string | null>(null);

  const fetchUserRank = async (username: string): Promise<number | null> =>
    fetchUserStats(fetch, username, mode).then(res => res.pp_rank);

  const handleUsernameLookup = async () => {
    setTimeout(() =>
      submitAnalyticsEvent(
        { category: 'ladder_stats', subcategory: 'username_lookup_submit' },
        'osu-daily-challenge',
        true
      )
    );

    const trimmed = usernameQuery.trim();

    if (!trimmed) {
      usernameStatus = 'error';
      usernameMessage = 'Enter a username to look up their rank.';
      return;
    }

    usernameStatus = 'loading';

    try {
      usernameMessage = null;
      const rank = await fetchUserRank(trimmed);

      if (rank) {
        selectedRank = clampRank(rank);
        usernameStatus = 'success';
      } else {
        usernameStatus = 'idle';
      }
    } catch (err) {
      console.error('Username lookup failed', err);
      usernameStatus = 'error';
      usernameMessage = 'Failed to stats for that username';
    }
  };
</script>

<div class="history-section">
  <div class="mode-selector">
    <p class="mode-description">Showing stats for</p>
    <label for="mode-select" class="visually-hidden">Select osu! game mode</label>
    <div class="mode-select-wrapper">
      <select
        id="mode-select"
        class="mode-select"
        value={mode}
        onchange={handleModeChange}
        aria-label="Select osu! game mode"
      >
        {#each modeOptions as option}
          <option value={option.value} selected={option.value === mode}>
            {option.label}
          </option>
        {/each}
      </select>
      <span class="mode-select-caret" aria-hidden="true"></span>
    </div>
  </div>
  <div class="controls">
    <div class="rank-selector">
      <label for="rank-input" class="rank-label">Select Rank</label>
      <input
        id="rank-input"
        class="rank-input"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        value={rankInputValue}
        onfocus={handleRankInputFocus}
        onblur={handleRankInputBlur}
        oninput={handleRankInput}
        aria-label="Select rank by typing"
      />
      <input
        id="rank-slider"
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={rankToSlider(selectedRank)}
        oninput={handleRankChange}
        class="slider"
        aria-label="Select rank with slider"
        aria-valuetext={`Rank ${formatRankValue(selectedRank)}`}
      />
    </div>

    <div class="username-selector">
      <p class="username-title">Or lookup by username</p>
      <form
        class="username-form"
        onsubmit={evt => {
          evt.preventDefault();
          handleUsernameLookup();
        }}
      >
        <input
          type="text"
          class="username-input"
          placeholder="osu! username"
          aria-label="osu! username"
          bind:value={usernameQuery}
        />
        <button type="submit" class="lookup-button" disabled={usernameStatus === 'loading'}>
          {usernameStatus === 'loading' ? 'Loading' : 'Lookup rank'}
        </button>
      </form>
      {#if usernameMessage}
        <p class={`lookup-message ${usernameStatus}`}>{usernameMessage}</p>
      {/if}
    </div>
  </div>

  <div class="charts">
    <div class="chart-wrapper">
      <h3>PP History</h3>
      <p class="description">
        PP required to reach rank #{formatRankValue(selectedRank)} over time
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
        Average rank decay per day for rank #{formatRankValue(selectedRank)} over time
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
    gap: 1.25rem;
    width: 100%;
  }

  .mode-selector {
    min-width: calc(min(80vw, 400px));
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid #eee;
    padding: 1.5rem 1rem;
    text-align: left;
    margin-top: 6px;
    margin-bottom: 6px;
  }

  @media (max-width: 768px) {
    .mode-selector {
      min-width: 95vw;
    }
  }

  .mode-description {
    margin: 0;
    font-size: 1.55rem;
    color: #222;
    font-weight: 500;
    text-align: center;
    line-height: 8px;
    margin-bottom: 5px;
  }

  .mode-select {
    width: 100%;
    padding: 0.65rem 2.75rem 0.65rem 0.85rem;
    border-radius: 0.65rem;
    border: 2px solid #ff80ab;
    font-size: 1.4rem;
    background: #fff;
    font-weight: 600;
    color: #111;
    appearance: none;
    text-align: center;
    cursor: pointer;
  }

  .mode-select-wrapper {
    position: relative;
    width: 100%;
  }

  .mode-select-caret {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
    width: 10px;
    height: 10px;
    border-right: 3px solid #ff4081;
    border-bottom: 3px solid #ff4081;
    pointer-events: none;
  }

  .mode-select:focus {
    outline: none;
    border-color: #ff4081;
    box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.2);
  }

  .mode-select:hover {
    border-color: #ff4081;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .rank-selector,
  .username-selector {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: left;
  }

  .rank-label {
    font-size: clamp(1.25rem, 1.25rem + 1vw, 2rem);
    font-weight: 700;
    color: #111;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 0;
  }

  .rank-input {
    font-size: clamp(1.5rem, 2rem + 1.5vw, 2.25rem);
    font-weight: 800;
    color: #ff4081;
    border: 2px solid #ff80ab;
    border-radius: 0.75rem;
    padding: 0.45rem 1.4rem;
    text-align: center;
    background: #fff5fa;
  }

  .rank-input:focus {
    outline: none;
    border-color: #ff4081;
    box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.2);
    background: #fff;
  }

  .helper-text {
    margin: 0;
    font-size: 1.4rem;
    color: #666;
  }

  .slider {
    width: 100%;
    margin-top: 8px;
    appearance: none;
    height: 8px;
    border-radius: 4px;
    background: #e8e8e8;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ff4081;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }

  .username-selector {
    background: #fff7fb;
    border: 1px solid #ffd4e6;
    border-radius: 1rem;
    padding: 1rem;
  }

  .username-title {
    margin: 0;
    font-weight: 700;
    color: #111;
    font-size: 1.7rem;
  }

  .username-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .username-input {
    flex: 1 1 160px;
    padding: 0.65rem 0.85rem;
    border-radius: 0.65rem;
    border: 1px solid #ccc;
    font-size: 1.4rem;
  }

  .username-input:focus {
    outline: none;
    border-color: #ff4081;
    box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.2);
  }

  .lookup-button {
    background: #ff4081;
    color: #fff;
    border: none;
    border-radius: 0.65rem;
    padding: 0.65rem 1.25rem;
    font-size: 1.4rem;
    font-weight: 600;
    cursor: pointer;
  }

  .lookup-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .lookup-message {
    margin: 0;
    font-size: 1.4rem;
  }

  .lookup-message.idle {
    color: #555;
  }

  .lookup-message.success {
    color: #1b873f;
  }

  .lookup-message.error {
    color: #d32f2f;
  }

  .lookup-message.loading {
    color: #555;
  }

  @media (min-width: 768px) {
    .controls {
      flex-direction: row;
      align-items: stretch;
    }

    .rank-selector,
    .username-selector,
    .mode-selector {
      width: 100%;
    }
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
    font-size: 2rem;
    color: #333;
    font-weight: bold;
  }

  .description {
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
    color: #666;
  }
</style>
