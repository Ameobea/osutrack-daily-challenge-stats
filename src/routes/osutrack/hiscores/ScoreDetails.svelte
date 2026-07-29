<script lang="ts">
  import { getEmbedPage, submitAnalyticsEvent } from '../../../api';
  import ModDisplay from '../../../components/ModDisplay.svelte';
  import { IntegerFormatter } from '../../../util';
  import type { RichHiscore } from './+page.server';
  import PerformanceGauge from './PerformanceGauge.svelte';

  let {
    selectedScore,
    isCollapsed,
    toggleCollapsed,
    mode,
  }: {
    selectedScore: RichHiscore | null;
    isCollapsed: boolean;
    toggleCollapsed: () => void;
    mode: number;
  } = $props();

  const formatLength = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
</script>

<div class="root" class:collapsed={isCollapsed}>
  {#if !isCollapsed}
    <button class="collapse-btn" onclick={toggleCollapsed} title="Collapse sidebar">×</button>
    <div style="margin-top: 20px;">
      {#if selectedScore}
        <h3>{selectedScore.beatmap.title} [{selectedScore.beatmap.version}]</h3>
        <div style="display: flex; flex-direction: row; margin-top: 8px;">
          <img
            class="beatmap-cover-thumb"
            src={`https://b.ppy.sh/thumb/${selectedScore.beatmap.beatmapset_id}l.jpg`}
            alt={`Cover image for ${selectedScore.beatmap.title}`}
          />
          <div class="beatmap-details">
            <div>
              <a
                href={`https://osu.ppy.sh/b/${selectedScore.beatmap.beatmap_id}`}
                target="_blank"
                onclick={() =>
                  submitAnalyticsEvent(
                    {
                      category: 'hiscores_table',
                      subcategory: 'open_beatmap_link',
                      payload: {
                        target: 'beatmap_details',
                        beatmap_id: selectedScore!.beatmap.beatmap_id,
                        page: getEmbedPage(),
                      },
                    },
                    'osutrack'
                  )}
              >
                View Beatmap on osu!
              </a>
            </div>
            <div>
              <b>Artist:</b>
              {selectedScore.beatmap.artist}
            </div>
            <div>
              <b>Mapper:</b>
              <a
                href={`https://osu.ppy.sh/users/${selectedScore.beatmap.creator}`}
                target="_blank"
                onclick={() =>
                  submitAnalyticsEvent(
                    {
                      category: 'hiscores_table',
                      subcategory: 'open_beatmap_link',
                      payload: {
                        target: 'mapper',
                        beatmap_id: selectedScore!.beatmap.beatmap_id,
                        page: getEmbedPage(),
                      },
                    },
                    'osutrack'
                  )}
              >
                {selectedScore.beatmap.creator}
              </a>
            </div>
            <div>
              <b>Length:</b>
              {formatLength(selectedScore.beatmap.total_length)}
            </div>
            <div>
              <b>BPM:</b>
              {selectedScore.beatmap.bpm}
            </div>
            <div>
              <b>Stars:</b>
              {selectedScore.difficulty ? selectedScore.difficulty.stars.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>

        <div class="score-stats">
          <div>
            <b>Score:</b>
            {IntegerFormatter.format(selectedScore.total_score)}
          </div>
          <div>
            <b>Accuracy:</b>
            {(selectedScore.accuracy * 100).toFixed(2)}%
          </div>
          <div>
            <b>Max Combo:</b>
            {IntegerFormatter.format(selectedScore.max_combo)}
          </div>
          <div style="display: flex; flex-direction: row; gap: 8px; align-items: center;">
            <b>Mods:</b>
            {#if selectedScore.mods.length > 0}
              <div class="score-details-mods-list">
                {#each selectedScore.mods as mod (mod.acronym)}
                  <ModDisplay {mod} />
                {/each}
              </div>
            {:else}
              <span style="color: #999; font-style: italic;">None</span>
            {/if}
          </div>
        </div>

        <div class="hit-counts">
          <div class="hit-count-item">
            <span class="misses-label">Misses</span>
            <span class="hit-count-value">
              {IntegerFormatter.format(selectedScore.statistics.miss ?? 0)}
            </span>
          </div>
          <div class="hit-count-item">
            <span class="greats-label">300s</span>
            <span class="hit-count-value">
              {IntegerFormatter.format(selectedScore.statistics.great ?? 0)}
            </span>
          </div>
          <div class="hit-count-item">
            <span class="oks-label">100s</span>
            <span class="hit-count-value">
              {IntegerFormatter.format(selectedScore.statistics.ok ?? 0)}
            </span>
          </div>
          <div class="hit-count-item">
            <span class="mehs-label">50s</span>
            <span class="hit-count-value">
              {IntegerFormatter.format(selectedScore.statistics.meh ?? 0)}
            </span>
          </div>
        </div>

        {#if selectedScore.perf && mode === 0}
          <div class="performance-gauges">
            <PerformanceGauge
              label="Total PP"
              value={selectedScore.perf.earned.pp}
              max={selectedScore.perf.max.pp}
            />
            <PerformanceGauge
              label="Aim PP"
              value={selectedScore.perf.earned.pp_aim}
              max={selectedScore.perf.max.pp_aim}
            />
            <PerformanceGauge
              label="Speed PP"
              value={selectedScore.perf.earned.pp_speed}
              max={selectedScore.perf.max.pp_speed}
            />
            <PerformanceGauge
              label="Acc. PP"
              value={selectedScore.perf.earned.pp_acc}
              max={selectedScore.perf.max.pp_acc}
            />
          </div>
        {/if}
      {:else}
        <p class="no-score-message">Select a score to see details</p>
      {/if}
    </div>
  {/if}
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    width: 350px;
    min-width: 350px;
    padding: 6px;
    overflow-x: hidden;
    position: relative;
    margin-top: -12px;
  }

  .root.collapsed {
    width: 40px;
    min-width: 40px;
  }

  .collapse-btn {
    appearance: none;
    all: unset;
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
    padding: 8px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    height: 16px;
    width: 16px;
  }

  .collapse-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  .no-score-message {
    text-align: center;
    margin-top: 100px;
    color: #666;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 4px;
    margin-top: 16px;
  }

  .beatmap-cover-thumb {
    width: 160px;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 4px;
  }

  .beatmap-details {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    padding-left: 4px;
    gap: 3px;
    overflow: hidden;

    > div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  a {
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .score-stats {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    font-size: 15px;
    padding-left: 8px;
  }

  .score-details-mods-list {
    display: flex;
    flex-direction: row;
    gap: 4px;
    flex-wrap: wrap;
  }

  :global(.score-details-mods-list .mod-acronym) {
    font-size: 15px !important;
  }

  .hit-counts {
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin-top: 14px;
    font-size: 14px;
    justify-content: center;
  }

  .hit-count-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .hit-count-value {
    margin-top: 4px;
  }

  .greats-label {
    font-weight: 600;
    color: #67cbef;
  }

  .oks-label {
    font-weight: 600;
    color: #81a856;
  }

  .mehs-label {
    font-weight: 600;
    color: #fecb78;
  }

  .misses-label {
    font-weight: 600;
    color: #e52943;
  }

  .performance-gauges {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
  }
</style>
