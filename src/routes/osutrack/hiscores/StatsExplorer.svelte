<script lang="ts">
  import type { RichHiscore } from './+page.server';
  import { renderHistogram } from '../../../components/histogram';
  import type { Histogram } from '../../../api';

  let {
    hiscores,
    setFilteredHiscores,
    mode,
  }: {
    hiscores: RichHiscore[];
    setFilteredHiscores: (hiscores: RichHiscore[] | null) => void;
    mode: number;
  } = $props();

  let histogramContainer = $state<HTMLDivElement | null>(null);
  let tooltip = $state<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  type StatKey =
    | 'pp'
    | 'aim_pp'
    | 'speed_pp'
    | 'acc_pp'
    | 'fl_pp'
    | 'difficulty_aim'
    | 'difficulty_speed'
    | 'difficulty_flashlight'
    | 'stars'
    | 'accuracy'
    | 'cs'
    | 'ar'
    | 'od'
    | 'hp'
    | 'bpm'
    | 'score_date'
    | 'beatmap_rank_date';

  interface HistogramParams {
    label: string;
    valueGetter: (score: RichHiscore) => number;
    binCount?: number;
    min?: number;
    max?: number;
    xAxisTickFormat?: (value: number) => string;
    xAxisTickCount?: number;
  }

  const hasFlashlightPP = hiscores.some(h => !!h.perf?.earned.pp_flashlight);

  const formatDateForAxis = (timestamp: number): string => {
    if (timestamp === 0) return 'N/A';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  const statConfigs: Record<StatKey, HistogramParams> = {
    pp: {
      label: 'PP',
      valueGetter: score => score.pp ?? 0,
    },
    aim_pp: {
      label: 'Aim PP',
      valueGetter: score => score.perf?.earned.pp_aim ?? 0,
    },
    speed_pp: {
      label: 'Tap PP',
      valueGetter: score => score.perf?.earned.pp_speed ?? 0,
    },
    acc_pp: {
      label: 'Acc PP',
      valueGetter: score => score.perf?.earned.pp_acc ?? 0,
    },
    fl_pp: {
      label: 'FL PP',
      valueGetter: score => score.perf?.earned.pp_flashlight ?? 0,
    },
    difficulty_aim: {
      label: 'Diff Aim',
      valueGetter: score => score.difficulty?.difficulty_aim ?? 0,
    },
    difficulty_speed: {
      label: 'Diff Speed',
      valueGetter: score => score.difficulty?.difficulty_speed ?? 0,
    },
    difficulty_flashlight: {
      label: 'Diff FL',
      valueGetter: score => score.difficulty?.difficulty_flashlight ?? 0,
    },
    stars: {
      label: 'Stars',
      valueGetter: score => score.difficulty?.stars ?? score.beatmap.difficultyrating,
    },
    accuracy: {
      label: 'Accuracy',
      valueGetter: score => score.accuracy * 100,
    },
    cs: {
      label: 'CS',
      valueGetter: score => score.attrs_with_mods?.cs ?? score.beatmap.diff_size,
    },
    ar: {
      label: 'AR',
      valueGetter: score => score.attrs_with_mods?.ar ?? score.beatmap.diff_approach,
    },
    od: {
      label: 'OD',
      valueGetter: score => score.attrs_with_mods?.od ?? score.beatmap.diff_overall,
    },
    hp: {
      label: 'HP',
      valueGetter: score => score.attrs_with_mods?.hp ?? score.beatmap.diff_drain,
    },
    bpm: {
      label: 'BPM',
      valueGetter: score => score.beatmap.bpm * (score.attrs_with_mods?.clock_rate ?? 1),
    },
    score_date: {
      label: 'Score Date',
      valueGetter: score => new Date(score.ended_at).getTime(),
      xAxisTickFormat: formatDateForAxis,
      xAxisTickCount: 8,
    },
    beatmap_rank_date: {
      label: 'Map Ranked',
      valueGetter: score =>
        score.beatmap.approved_date ? new Date(score.beatmap.approved_date).getTime() : 0,
      xAxisTickFormat: formatDateForAxis,
      xAxisTickCount: 8,
    },
  };

  const perSkillStats: StatKey[] = [
    'aim_pp',
    'speed_pp',
    'acc_pp',
    'fl_pp',
    'difficulty_aim',
    'difficulty_speed',
    'difficulty_flashlight',
  ];

  const availableStats = $derived(
    (Object.keys(statConfigs) as StatKey[]).filter(key => {
      const isFlStat = key.includes('fl_') || key === 'difficulty_flashlight';
      if (isFlStat && !hasFlashlightPP) {
        return false;
      }
      if (perSkillStats.includes(key) && mode !== 0) {
        return false;
      }
      return true;
    })
  );

  let selectedStat = $state<StatKey>('pp');
  let selectedBucket = $state<number | null>(null);
  let hoveredBucket = $state<number | null>(null);
  let hasInteracted = $state<boolean>(false);
  let mouseoutTimeout: number | null = null;

  const buildHistogramData = (
    valueGetter: (score: RichHiscore) => number,
    binCount = 40,
    explicitMin?: number,
    explicitMax?: number
  ): Histogram => {
    const buckets = new Array<number>(binCount).fill(0);
    let min = explicitMin ?? Infinity;
    let max = explicitMax ?? -Infinity;

    const values = hiscores.map(valueGetter);

    if (explicitMin === undefined || explicitMax === undefined) {
      for (const value of values) {
        if (explicitMin === undefined && value < min) {
          min = value;
        }
        if (explicitMax === undefined && value > max) {
          max = value;
        }
      }
    }

    const binSize = (max - min) / binCount;
    for (const value of values) {
      let binIndex = Math.floor((value - min) / binSize);
      if (binIndex === binCount) {
        binIndex = binCount - 1;
      }
      buckets[binIndex] += 1;
    }

    return { buckets, min, max };
  };

  const handleStatChange = (stat: StatKey) => {
    selectedStat = stat;
    selectedBucket = null;
    hoveredBucket = null;
    setFilteredHiscores(null);
    tooltip = null;
    if (!hasInteracted) {
      hasInteracted = true;
    }
  };

  const clearSelectedBucketClass = () => {
    if (!histogramContainer) {
      return;
    }

    const selectedBar = histogramContainer.querySelector('rect.histogram-bar.selected');
    if (selectedBar) {
      selectedBar.classList.remove('selected');
    }
  };

  $effect(() => {
    if (!histogramContainer) {
      return;
    }

    const config = statConfigs[selectedStat];
    const bucketCount = config.binCount ?? 30;
    const data = buildHistogramData(config.valueGetter, bucketCount, config.min, config.max);

    const formatter = config.xAxisTickFormat ?? ((value: number) => value.toFixed(2));

    const { bars } = renderHistogram({
      histogramContainer,
      histogramData: data,
      svgHeight: 200,
      svgWidth: 600,
      margin: { top: 20, right: 30, bottom: 30, left: 40 },
      xAxisTickFormat: config.xAxisTickFormat,
      xAxisTickCount: config.xAxisTickCount,
    });

    const updateTooltip = (bucketIx: number, rect: DOMRect) => {
      const bucketMin = data.min + (bucketIx * (data.max - data.min)) / data.buckets.length;
      const bucketMax = data.min + ((bucketIx + 1) * (data.max - data.min)) / data.buckets.length;

      const containerRect = histogramContainer!.getBoundingClientRect();

      tooltip = {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 5,
        text: `${formatter(bucketMin)} - ${formatter(bucketMax)}`,
      };
    };

    bars.on('mouseover', (event, { index: bucketIx }) => {
      // Cancel any pending mouseout timeout
      if (mouseoutTimeout !== null) {
        clearTimeout(mouseoutTimeout);
        mouseoutTimeout = null;
      }

      hoveredBucket = bucketIx;
      const rect = event.currentTarget.getBoundingClientRect();
      updateTooltip(bucketIx, rect);
    });

    bars.on('mouseout', () => {
      // Add a small delay before processing mouseout
      mouseoutTimeout = window.setTimeout(() => {
        hoveredBucket = null;
        // If a bar is selected, show tooltip for selected bar
        if (selectedBucket !== null) {
          const selectedBar = histogramContainer!.querySelector(
            `rect.histogram-bar:nth-child(${selectedBucket + 1})`
          );
          if (selectedBar) {
            const rect = selectedBar.getBoundingClientRect();
            updateTooltip(selectedBucket, rect);
          }
        } else {
          tooltip = null;
        }
        mouseoutTimeout = null;
      }, 50);
    });

    bars.on('click', (event, { index: bucketIx }) => {
      if (!hasInteracted) {
        hasInteracted = true;
      }

      if (selectedBucket === bucketIx) {
        selectedBucket = null;
        setFilteredHiscores(null);
        clearSelectedBucketClass();
        tooltip = null;
        return;
      }

      const bucketMin = data.min + (bucketIx * (data.max - data.min)) / data.buckets.length;
      const bucketMax = data.min + ((bucketIx + 1) * (data.max - data.min)) / data.buckets.length;
      const scoresInBucket = hiscores.filter(score => {
        const value = config.valueGetter(score);
        return (
          value >= bucketMin &&
          (bucketIx === bucketCount - 1 ? value <= bucketMax : value < bucketMax)
        );
      });
      setFilteredHiscores(scoresInBucket);

      clearSelectedBucketClass();
      const clickedBar = event.currentTarget;
      clickedBar.classList.add('selected');
      selectedBucket = bucketIx;

      // Update tooltip for the selected bar
      const rect = clickedBar.getBoundingClientRect();
      updateTooltip(bucketIx, rect);
    });
  });
</script>

<div class="root">
  <div class="stat-selector">
    {#each availableStats as stat}
      <button
        class="stat-button"
        class:active={selectedStat === stat}
        onclick={() => handleStatChange(stat)}
      >
        {statConfigs[stat].label}
      </button>
    {/each}
  </div>
  {#if !hasInteracted}
    <div class="helper-text">Click a bar to filter scores by range</div>
  {/if}
  <div style="position: relative;">
    <div class="histogram-container" bind:this={histogramContainer}></div>
    {#if tooltip}
      <div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
        {tooltip.text}
      </div>
    {/if}
  </div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
  }

  .stat-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    overflow: hidden;
    width: fit-content;
  }

  .stat-button {
    padding: 6px 14px;
    border: none;
    border-right: 1px solid #ccc;
    background-color: #f5f5f5;
    border-radius: 0;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s ease;
    user-select: none;
  }

  .stat-button:last-child {
    border-right: none;
  }

  .stat-button:hover {
    background-color: #e8e8e8;
  }

  .stat-button.active {
    background-color: #5cc9e4;
    color: white;
    font-weight: 500;
  }

  .stat-button.active:hover {
    background-color: #4db8d3;
  }

  .helper-text {
    color: #666;
    font-size: 14px;
    font-style: italic;
    margin-top: -4px;
  }

  .histogram-container {
    display: flex;
    justify-content: center;
    position: relative;
  }

  .tooltip {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.95);
    color: #333;
    padding: 3px 7px;
    border-radius: 3px;
    border: 1px solid #ccc;
    font-size: 12px;
    pointer-events: none;
    white-space: nowrap;
    transform: translate(-50%, -100%);
    z-index: 1000;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
  }

  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #ccc;
  }

  :global(.histogram-container rect.histogram-bar) {
    cursor: pointer;
  }

  :global(.histogram-container rect.histogram-bar:hover) {
    fill: #5cc9e4;
  }

  :global(.histogram-container rect.histogram-bar.selected) {
    fill: #f826ff;
  }

  :global(.histogram-container text) {
    user-select: none;
  }
</style>
