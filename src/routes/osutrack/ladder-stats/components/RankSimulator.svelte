<script lang="ts">
  import { submitAnalyticsEvent, type SimulationConfig } from '../../../../api';
  import { interpolateSorted } from '../utils';
  import { FloatFormatter, IntegerFormatter } from '../../../../util';
  import RankProjectionChart from './RankProjectionChart.svelte';
  import type { AnalysisDataset } from '../types';

  let {
    simulationConfig,
    selectedRank = $bindable(),
    analysisData,
  }: {
    simulationConfig: SimulationConfig;
    selectedRank: number;
    analysisData: AnalysisDataset | null;
  } = $props();

  let localSelectedRank = $state(selectedRank);
  $effect(() => {
    localSelectedRank = selectedRank;
  });
  let daysToSimulate = $state(60);
  let ppGained = $state(50);

  const MIN_SIM_DAYS = 1;
  const MAX_SIM_DAYS = 5 * 365;
  const MIDPOINT_DAYS = 180;
  const LOG_MIN_DAYS = Math.log10(MIN_SIM_DAYS);
  const LOG_MAX_DAYS = Math.log10(MAX_SIM_DAYS);
  const daysLogRange = LOG_MAX_DAYS - LOG_MIN_DAYS;
  const pivotNormDays = (Math.log10(MIDPOINT_DAYS) - LOG_MIN_DAYS) / daysLogRange;
  const daySliderGamma = Math.log(pivotNormDays) / Math.log(0.5);

  const sliderToDays = (value: number) => {
    const scaled = Math.pow(value, daySliderGamma);
    const logDays = LOG_MIN_DAYS + scaled * daysLogRange;
    const days = Math.round(10 ** logDays);
    return Math.min(MAX_SIM_DAYS, Math.max(MIN_SIM_DAYS, days));
  };

  const daysToSlider = (days: number) => {
    const clamped = Math.min(MAX_SIM_DAYS, Math.max(MIN_SIM_DAYS, days));
    const logValue = Math.log10(clamped);
    const norm = (logValue - LOG_MIN_DAYS) / daysLogRange;
    return Math.pow(norm, 1 / daySliderGamma);
  };

  const handleDaysSliderInput = (evt: Event) => {
    setTimeout(() =>
      submitAnalyticsEvent(
        { category: 'ladder_stats', subcategory: 'simulate_days_slider_input' },
        fetch,
        true
      )
    );

    const sliderValue = parseFloat((evt.target as HTMLInputElement).value);
    daysToSimulate = sliderToDays(sliderValue);
  };

  const MAX_PP_GAIN = 5000;
  const PP_LINEAR_MAX = 300;
  const PP_LINEAR_PORTION = 0.55;
  const PP_SLIDER_POWER = 2.25;
  const SIMULATION_OVERSAMPLE_FACTOR = 50;

  const sliderToPpGain = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    if (clamped === 0) {
      return 0;
    }
    if (clamped <= PP_LINEAR_PORTION) {
      const progress = clamped / PP_LINEAR_PORTION;
      return Math.round(progress * PP_LINEAR_MAX);
    }

    const curvedProgress = (clamped - PP_LINEAR_PORTION) / (1 - PP_LINEAR_PORTION);
    const curvedValue =
      PP_LINEAR_MAX +
      Math.round((MAX_PP_GAIN - PP_LINEAR_MAX) * Math.pow(curvedProgress, PP_SLIDER_POWER));
    return Math.min(MAX_PP_GAIN, curvedValue);
  };

  const ppGainToSlider = (value: number) => {
    const clamped = Math.min(MAX_PP_GAIN, Math.max(0, value));
    if (clamped <= PP_LINEAR_MAX) {
      return (clamped / PP_LINEAR_MAX) * PP_LINEAR_PORTION;
    }

    const curved = (clamped - PP_LINEAR_MAX) / (MAX_PP_GAIN - PP_LINEAR_MAX);
    const curvedSlider = Math.pow(curved, 1 / PP_SLIDER_POWER);
    return PP_LINEAR_PORTION + curvedSlider * (1 - PP_LINEAR_PORTION);
  };

  const handlePpSliderInput = (evt: Event) => {
    setTimeout(() =>
      submitAnalyticsEvent(
        { category: 'ladder_stats', subcategory: 'simulate_pp_gain_slider_input' },
        fetch,
        true
      )
    );

    const sliderValue = parseFloat((evt.target as HTMLInputElement).value);
    ppGained = sliderToPpGain(sliderValue);
  };

  const formatDaysLabel = (value: number) => {
    const rounded = Math.max(0, Math.round(value));
    return `${IntegerFormatter.format(rounded)} day${rounded === 1 ? '' : 's'}`;
  };

  const formatPpLabel = (value: number) => {
    const rounded = Math.max(0, Math.round(value));
    return `${IntegerFormatter.format(rounded)} pp`;
  };

  type ProjectionPoint = { day: number; rank: number };

  const buildSimulationTrajectory = (
    simulationConfig: SimulationConfig,
    ppGainOverride = ppGained
  ) => {
    const { rank_to_decay, rank_to_density, rank_to_pp } = simulationConfig;

    const totalDays = Math.max(0, Math.round(daysToSimulate));
    const startingValue = Math.max(1, Math.round(currentRank));
    const trajectory: ProjectionPoint[] = [{ day: 0, rank: startingValue }];

    if (totalDays === 0) {
      return trajectory;
    }

    let rank = startingValue;
    const ppGain = Math.max(0, ppGainOverride);
    const dailyPpGain = totalDays > 0 ? ppGain / totalDays : 0;
    const stepPpGain = dailyPpGain / SIMULATION_OVERSAMPLE_FACTOR;

    for (let i = 0; i < totalDays; i++) {
      for (let j = 0; j < SIMULATION_OVERSAMPLE_FACTOR; j++) {
        const naturalDecay = interpolateSorted(rank, rank_to_decay);
        const density = interpolateSorted(rank, rank_to_density);

        // density is ranks gained per pp
        const climbVelocity = stepPpGain * density;
        // naturalDecay is per day, so we need to scale it down
        const netChange = naturalDecay / SIMULATION_OVERSAMPLE_FACTOR - climbVelocity;

        rank += netChange;
        if (rank < 1) {
          rank = 1;
        }
      }

      trajectory.push({ day: i + 1, rank: Math.round(rank) });
    }

    return trajectory;
  };

  const currentRank = $derived.by(() => {
    if (localSelectedRank > 0 && localSelectedRank <= 2_000_000 && !isNaN(localSelectedRank)) {
      return localSelectedRank;
    }
    return selectedRank;
  });
  const currentPP = $derived.by(() => {
    if (!simulationConfig.rank_to_pp) {
      return 0;
    }
    return interpolateSorted(currentRank, simulationConfig.rank_to_pp);
  });
  const simulationTrajectory = $derived.by(() =>
    buildSimulationTrajectory(simulationConfig, ppGained)
  );
  const baselineTrajectory = $derived.by(() => buildSimulationTrajectory(simulationConfig, 0));
  const predictedRank = $derived.by(() => {
    const lastPoint = simulationTrajectory[simulationTrajectory.length - 1];
    return lastPoint ? lastPoint.rank : Math.round(Math.max(1, currentRank));
  });
  const rankDifference = $derived(currentRank - predictedRank);
  const shouldShowBaseline = $derived(ppGained > 0);
</script>

<div class="simulator-section">
  <h3>Rank Projection Simulator</h3>
  <p class="description">Simulates a future rank based on historical decay rates.</p>
  <p class="note">
    Note that this simulation makes a lot of estimates and simplifications.<br />It does not
    consider things like PP algorithm changes, inactive account purges, macro-level shifts in the
    playerbase, etc.
  </p>

  <div class="inputs">
    <div class="input-group">
      <label for="current-rank">Current Rank</label>
      <input
        id="current-rank"
        type="number"
        value={localSelectedRank}
        oninput={evt => {
          const newValue = parseInt((evt.target as HTMLInputElement).value, 10);
          if (!isNaN(newValue)) {
            localSelectedRank = newValue;
          }
          if (!isNaN(newValue) && newValue >= 1 && newValue <= 2_000_000) {
            selectedRank = newValue;
          }
        }}
        min="1"
      />
    </div>

    <div class="input-group slider-group">
      <label for="days-simulate">Days to Simulate</label>
      <div class="value-readout">{formatDaysLabel(daysToSimulate)}</div>
      <input
        id="days-simulate"
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={daysToSlider(daysToSimulate)}
        oninput={handleDaysSliderInput}
        aria-valuetext={formatDaysLabel(daysToSimulate)}
      />
      <div class="slider-scale">
        <span>1d</span>
        <span>~6mo</span>
        <span>5y</span>
      </div>
    </div>

    <div class="input-group slider-group">
      <label for="pp-gained">PP Gained</label>
      <div class="value-readout">{formatPpLabel(ppGained)}</div>
      <input
        id="pp-gained"
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={ppGainToSlider(ppGained)}
        oninput={handlePpSliderInput}
        aria-valuetext={formatPpLabel(ppGained)}
      />
      <div class="slider-scale">
        <span>0</span>
        <span>300</span>
        <span>5k</span>
      </div>
    </div>
  </div>

  <div class="result">
    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
      <div>
        <span class="label">Predicted Rank Change:</span>
        <span class="value">
          #{IntegerFormatter.format(currentRank)} -> {IntegerFormatter.format(predictedRank)}
        </span>
        <span
          class="change"
          class:positive={currentRank > predictedRank}
          class:negative={currentRank < predictedRank}
        >
          ({rankDifference >= 0 ? '+' : ''}{IntegerFormatter.format(rankDifference)})
        </span>
      </div>

      <div>
        <span class="label">Predicted PP Change:</span>
        <span class="value">
          {FloatFormatter.format(currentPP)} -> {FloatFormatter.format(currentPP + ppGained)}
        </span>
        <span class="change" class:positive={ppGained > 0} class:negative={ppGained < 0}>
          ({ppGained >= 0 ? '+' : ''}{FloatFormatter.format(ppGained)})
        </span>
      </div>
    </div>
  </div>

  <div class="projection-chart">
    <h4>Projected Rank Trend</h4>
    <RankProjectionChart
      projection={simulationTrajectory}
      baseline={shouldShowBaseline ? baselineTrajectory : null}
      startingRank={Math.max(1, Math.round(currentRank))}
    />
  </div>
</div>

<style>
  .simulator-section {
    padding: 8px 4px;
    background: #fff;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 20px;
    color: #333;
    font-weight: bold;
  }

  .description {
    margin-bottom: 8px;
    font-size: 1.4rem;
    color: #555;
  }

  .note {
    margin-top: 0;
    margin-bottom: 28px;
    font-size: 1.34rem;
    color: #777;
  }

  .inputs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 1.6rem;
    font-weight: 500;
    color: #444;
  }

  input[type='number'] {
    padding: 0.5rem;
    border: 1px solid #ddd;
    font-size: 1.5rem;
  }

  input[type='range'] {
    width: 100%;
    accent-color: #ff4081;
  }

  .slider-group {
    gap: 0.35rem;
  }

  .value-readout {
    font-size: 1.4rem;
    font-weight: 600;
    color: #333;
  }

  .slider-scale {
    display: flex;
    justify-content: space-between;
    font-size: 1.2rem;
    color: #777;
  }

  .result {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .result .label {
    font-weight: 500;
    color: #444;
    font-size: 1.6rem;
    padding-left: 0;
  }

  .result .value {
    font-size: 1.6rem;
    font-weight: bold;
    color: #222;
  }

  .change {
    font-size: 1rem;
    font-weight: 500;
    font-size: 1.4rem;
  }

  .change.positive {
    color: #4caf50;
  }

  .change.negative {
    color: #f44336;
  }

  .projection-chart {
    margin-top: 1.5rem;
  }

  .projection-chart h4 {
    margin: 0 0 0.35rem 0;
    font-size: 1.4rem;
    color: #333;
    font-weight: bold;
  }
</style>
