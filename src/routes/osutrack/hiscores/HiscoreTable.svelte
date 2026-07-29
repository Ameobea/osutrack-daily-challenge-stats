<script lang="ts">
  import { onMount } from 'svelte';
  import { formatDateDiff } from '../../../components/dateFormat';
  import ModDisplay from '../../../components/ModDisplay.svelte';
  import { OsuColors } from '../../../conf';
  import { FloatFormatter } from '../../../util';
  import type { RichHiscore } from './+page.server';
  import { browser } from '$app/environment';
  import { getEmbedPage, submitAnalyticsEvent } from '../../../api';

  let {
    hiscores,
    selectedScore,
    setSelectedScore,
    showAdvancedStats = $bindable(),
    mode,
  }: {
    hiscores: RichHiscore[];
    selectedScore: RichHiscore | null;
    setSelectedScore: (score: RichHiscore | null) => void;
    showAdvancedStats: boolean;
    mode: number;
  } = $props();

  const hasFlashlightPP = $derived(hiscores.some(h => !!h.perf?.earned.pp_flashlight));
  const showPerSkillStats = $derived(mode === 0);

  const embedPage = getEmbedPage();

  type SortColumn =
    | 'index'
    | 'beatmap'
    | 'pp'
    | 'aim_pp'
    | 'speed_pp'
    | 'acc_pp'
    | 'fl_pp'
    | 'difficulty_aim'
    | 'difficulty_speed'
    | 'difficulty_flashlight'
    | 'date'
    | 'stars'
    | 'accuracy'
    | 'rank'
    | 'cs'
    | 'ar'
    | 'od'
    | 'hp'
    | 'clock_rate'
    | 'bpm';
  let sortColumn = $state<SortColumn>('pp');
  let sortAscending = $state(false);

  type Hiscore = (typeof hiscores)[number];
  const sortGetters: Record<SortColumn, (h: Hiscore) => number | string> = {
    index: h => h.index,
    beatmap: h => h.beatmap.title,
    pp: h => h.pp ?? -Infinity,
    aim_pp: h => h.perf?.earned.pp_aim ?? -Infinity,
    speed_pp: h => h.perf?.earned.pp_speed ?? -Infinity,
    acc_pp: h => h.perf?.earned.pp_acc ?? -Infinity,
    fl_pp: h => h.perf?.earned.pp_flashlight ?? -Infinity,
    difficulty_aim: h => h.difficulty?.difficulty_aim ?? -Infinity,
    difficulty_speed: h => h.difficulty?.difficulty_speed ?? -Infinity,
    difficulty_flashlight: h => h.difficulty?.difficulty_flashlight ?? -Infinity,
    date: h => new Date(h.ended_at).getTime(),
    stars: h => h.difficulty?.stars ?? h.beatmap.difficultyrating,
    accuracy: h => h.accuracy,
    rank: h => h.rank,
    cs: h => h.attrs_with_mods?.cs ?? h.beatmap.diff_size,
    ar: h => h.attrs_with_mods?.ar ?? h.beatmap.diff_approach,
    od: h => h.attrs_with_mods?.od ?? h.beatmap.diff_overall,
    hp: h => h.attrs_with_mods?.hp ?? h.beatmap.diff_drain,
    clock_rate: h => h.attrs_with_mods?.clock_rate ?? 1,
    bpm: h => h.beatmap.bpm * (h.attrs_with_mods?.clock_rate ?? 1),
  };

  const sortedHiscores = $derived.by(() => {
    const sorted = [...hiscores];
    const getter = sortGetters[sortColumn];

    sorted.sort((a, b) => {
      const aVal = getter(a);
      const bVal = getter(b);

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAscending ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
    return sorted;
  });

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      sortAscending = !sortAscending;
    } else {
      sortColumn = column;
      sortAscending = false;
    }

    submitAnalyticsEvent(
      {
        category: 'hiscores_table',
        subcategory: 'sort_column',
        payload: { column: sortColumn, direction: sortAscending ? 'asc' : 'desc', mode, page: embedPage },
      },
      'osutrack'
    );
  };

  let now = $state(new Date());
  let intervalHandle: number | null = null;
  onMount(() => {
    if (!browser) {
      return;
    }

    intervalHandle = setInterval(() => {
      now = new Date();
    }, 30 * 1000);
    return () => {
      if (intervalHandle !== null) {
        clearInterval(intervalHandle);
      }
    };
  });
</script>

{#snippet sortIcon(key: string)}
  {#if sortColumn === key}
    <div class="sort-icon">{sortAscending ? '↑' : '↓'}</div>
  {:else}
    <div class="sort-icon"></div>
  {/if}
{/snippet}

<div class="root">
  <table>
    <thead>
      <tr>
        <th class="sortable index-column" onclick={() => handleSort('index')}>
          # {@render sortIcon('index')}
        </th>
        <th class="sortable title-column" onclick={() => handleSort('beatmap')}>
          Beatmap {@render sortIcon('beatmap')}
        </th>
        <th class="sortable rank-column" onclick={() => handleSort('rank')}>
          Rank {@render sortIcon('rank')}
        </th>
        <th>Mods</th>
        <th class="sortable pp-column" onclick={() => handleSort('pp')}>
          PP {@render sortIcon('pp')}
        </th>
        {#if showAdvancedStats && showPerSkillStats}
          <th class="sortable pp-column" onclick={() => handleSort('aim_pp')}>
            Aim PP {@render sortIcon('aim_pp')}
          </th>
          <th class="sortable pp-column" onclick={() => handleSort('speed_pp')}>
            Tap PP {@render sortIcon('speed_pp')}
          </th>
          <th class="sortable pp-column" onclick={() => handleSort('acc_pp')}>
            Acc PP {@render sortIcon('acc_pp')}
          </th>
          {#if hasFlashlightPP}
            <th class="sortable pp-column" onclick={() => handleSort('fl_pp')}>
              FL PP {@render sortIcon('fl_pp')}
            </th>
          {/if}
          <th class="sortable" onclick={() => handleSort('difficulty_aim')}>
            Diff Aim {@render sortIcon('difficulty_aim')}
          </th>
          <th class="sortable" onclick={() => handleSort('difficulty_speed')}>
            Diff Speed {@render sortIcon('difficulty_speed')}
          </th>
          {#if hasFlashlightPP}
            <th class="sortable" onclick={() => handleSort('difficulty_flashlight')}>
              Diff FL {@render sortIcon('difficulty_flashlight')}
            </th>
          {/if}
        {/if}
        {#if showAdvancedStats}
          <th class="sortable bpm-column" onclick={() => handleSort('bpm')}>
            BPM {@render sortIcon('bpm')}
          </th>
          <th class="sortable" onclick={() => handleSort('cs')}>
            CS {@render sortIcon('cs')}
          </th>
          <th class="sortable" onclick={() => handleSort('ar')}>
            AR {@render sortIcon('ar')}
          </th>
          <th class="sortable" onclick={() => handleSort('od')}>
            OD {@render sortIcon('od')}
          </th>
          <th class="sortable" onclick={() => handleSort('hp')}>
            HP {@render sortIcon('hp')}
          </th>
        {/if}
        <th class="sortable date-column" onclick={() => handleSort('date')}>
          {showAdvancedStats ? 'Submitted' : 'Date Submitted'}
          {@render sortIcon('date')}
        </th>
        <th class="sortable stars-column" onclick={() => handleSort('stars')}>
          Stars {@render sortIcon('stars')}
        </th>
        <th class="sortable acc-column" onclick={() => handleSort('accuracy')}>
          Accuracy {@render sortIcon('accuracy')}
        </th>
      </tr>
    </thead>
    <tbody>
      {#each sortedHiscores as hiscore (hiscore.id)}
        {@const endedAt = new Date(hiscore.ended_at)}
        {@const isRecent = now.getTime() - endedAt.getTime() < 2 * 24 * 60 * 60 * 1000}
        <tr
          onclick={() => setSelectedScore(hiscore)}
          class:selected={hiscore.id === selectedScore?.id}
          class:recent={isRecent}
        >
          <td>
            <a
              href={`https://osu.ppy.sh/scores/${hiscore.id}`}
              target="_blank"
              onclick={() =>
                submitAnalyticsEvent(
                  {
                    category: 'hiscores_table',
                    subcategory: 'open_beatmap_link',
                    payload: { target: 'score', beatmap_id: hiscore.beatmap.beatmap_id, mode, page: embedPage },
                  },
                  'osutrack'
                )}>{hiscore.index}</a
            >
          </td>
          <td class="title-column" title={`${hiscore.beatmap.title} [${hiscore.beatmap.version}]`}>
            <a
              href={`https://osu.ppy.sh/b/${hiscore.beatmap.beatmap_id}`}
              target="_blank"
              onclick={() =>
                submitAnalyticsEvent(
                  {
                    category: 'hiscores_table',
                    subcategory: 'open_beatmap_link',
                    payload: { target: 'beatmap', beatmap_id: hiscore.beatmap.beatmap_id, mode, page: embedPage },
                  },
                  'osutrack'
                )}
            >
              {hiscore.beatmap.title}
              <span class="beatmap-version">[{hiscore.beatmap.version}]</span>
            </a>
          </td>
          <td>
            <span class="rank" style="color: {OsuColors[hiscore.rank as keyof typeof OsuColors]}">
              {hiscore.rank}
            </span>
          </td>
          <td>
            <div style="display: flex; flex-direction: row; gap: 4px">
              {#each hiscore.mods as mod}
                <ModDisplay {mod} />
              {/each}
            </div>
          </td>
          <td class="pp-column">
            {typeof hiscore.pp === 'number' ? FloatFormatter.format(hiscore.pp) : '-'}
          </td>
          {#if showAdvancedStats && showPerSkillStats}
            <td class="pp-column">
              {typeof hiscore.perf?.earned.pp_aim === 'number'
                ? FloatFormatter.format(hiscore.perf.earned.pp_aim)
                : '-'}
            </td>
            <td class="pp-column">
              {typeof hiscore.perf?.earned.pp_speed === 'number'
                ? FloatFormatter.format(hiscore.perf.earned.pp_speed)
                : '-'}
            </td>
            <td class="pp-column">
              {typeof hiscore.perf?.earned.pp_acc === 'number'
                ? FloatFormatter.format(hiscore.perf.earned.pp_acc)
                : '-'}
            </td>
            {#if hasFlashlightPP}
              <td class="pp-column">
                {typeof hiscore.perf?.earned.pp_flashlight === 'number'
                  ? FloatFormatter.format(hiscore.perf.earned.pp_flashlight)
                  : '-'}
              </td>
            {/if}
            <td>
              {hiscore.difficulty ? hiscore.difficulty.difficulty_aim.toFixed(4) : '-'}
            </td>
            <td>
              {hiscore.difficulty ? hiscore.difficulty.difficulty_speed.toFixed(4) : '-'}
            </td>
            {#if hasFlashlightPP}
              <td>
                {hiscore.difficulty ? hiscore.difficulty.difficulty_flashlight.toFixed(4) : '-'}
              </td>
            {/if}
          {/if}
          {#if showAdvancedStats}
            <td>
              {hiscore.beatmap.bpm * (hiscore.attrs_with_mods?.clock_rate ?? 1)}
            </td>
            <td>
              {FloatFormatter.format(hiscore.attrs_with_mods?.cs ?? hiscore.beatmap.diff_size)}
            </td>
            <td>
              {FloatFormatter.format(hiscore.attrs_with_mods?.ar ?? hiscore.beatmap.diff_approach)}
            </td>
            <td>
              {FloatFormatter.format(hiscore.attrs_with_mods?.od ?? hiscore.beatmap.diff_overall)}
            </td>
            <td
              >{FloatFormatter.format(hiscore.attrs_with_mods?.hp ?? hiscore.beatmap.diff_drain)}
            </td>
          {/if}
          <td>
            <span class="date-diff" title={hiscore.ended_at}>
              {formatDateDiff(endedAt, now)}
            </span>
          </td>
          <td>
            {hiscore.difficulty
              ? hiscore.difficulty.stars.toFixed(2)
              : hiscore.beatmap.difficultyrating.toFixed(2)}
          </td>
          <td>{(hiscore.accuracy * 100).toFixed(2)}%</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="css">
  .root {
    display: flex;
    flex: 1;
    flex-direction: column;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: auto;
    height: 100%;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tbody tr {
    cursor: pointer;
  }

  tr.selected {
    background-color: #d0e0ff !important;
  }

  tbody tr:nth-child(odd) {
    background-color: #f2f2f2;
  }

  tbody tr:hover {
    background-color: #ecf4f5 !important;
  }

  th {
    padding: 6px;
    border: none;
    text-align: left;
    font-size: 15px;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    white-space: nowrap;
  }

  .sort-icon {
    display: inline-block;
    margin-left: -3px;
    width: 8px;
  }

  th.sortable:hover {
    background-color: #e0e0e0;
  }

  th.sortable:hover::after {
    content: '⇅';
    color: #999;
    position: absolute;
    right: 2px;
    top: 9px;
    font-size: 0.8em;
  }

  td {
    padding: 10px 6px;
    border: none;
    text-align: left;
    font-size: 15px;
  }

  :global(td .mod-acronym) {
    font-size: 14px !important;
  }

  a:hover {
    text-decoration: underline;
  }

  .index-column {
    width: 24px;
    min-width: 24px;
    max-width: 24px;
  }

  .pp-column {
    width: 70px;
    min-width: 70px;
    max-width: 70px;
  }

  .rank-column {
    width: 54px;
    min-width: 54px;
    max-width: 54px;
  }

  .title-column {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 280px;
    max-width: 280px;
  }

  .beatmap-version {
    color: #797979;
  }

  .date-column {
    min-width: 124px;
    width: 124px;
  }

  .stars-column {
    width: 54px;
    min-width: 54px;
    max-width: 54px;
  }

  .acc-column {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
  }

  .date-diff {
    text-decoration-line: underline;
    text-decoration-style: dotted;
    cursor: default;
  }

  .rank {
    font-weight: bold;
  }

  a {
    color: rgb(85, 85, 85);
  }

  tr.recent > td {
    background-color: rgba(80, 247, 95, 0.24) !important;
  }

  tr.recent:hover > td {
    background-color: rgba(80, 247, 95, 0.5) !important;
  }
</style>
