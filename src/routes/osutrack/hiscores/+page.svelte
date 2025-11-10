<script lang="ts">
  import { formatDateDiff } from '../../../components/dateFormat';
  import ModDisplay from '../../../components/ModDisplay.svelte';
  import { OsuColors } from '../../../conf';
  import { FloatFormatter } from '../../../util';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // TODO: always hide flashlight pp if all user hiscores have no flashlight pp
  // TODO: click-to-sort headers for all columns
  // TODO: toggle for advanced stats
  // TODO: click to expand beatmap details
  // TODO: aggregate stats (distributions for all stats (CS, PP, time map ranked, score time, etc.))
  // TODO: table styling.  Should horizontal scroll on smaller screens and be passably working on mobile
</script>

<div class="root">
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Beatmap</th>
        <th>PP</th>
        <th>Aim PP</th>
        <th>Speed PP</th>
        <th>Acc PP</th>
        <th>FL PP</th>
        <th>Date Submitted</th>
        <th>Stars</th>
        <th>Accuracy</th>
        <th>Rank</th>
        <th>Mods</th>
      </tr>
    </thead>
    <tbody>
      {#each data.hiscores as hiscore, i (hiscore.id)}
        <tr>
          <td>{i + 1}</td>
          <td>
            <a href={`https://osu.ppy.sh/b/${hiscore.beatmap.beatmap_id}`} target="_blank">
              {hiscore.beatmap.title}
              <span class="beatmap-version">[{hiscore.beatmap.version}]</span>
            </a>
          </td>
          <td>{typeof hiscore.pp === 'number' ? FloatFormatter.format(hiscore.pp) : '-'}</td>
          <td>
            {typeof hiscore.perf?.pp_aim === 'number'
              ? FloatFormatter.format(hiscore.perf.pp_aim)
              : '-'}
          </td>
          <td>
            {typeof hiscore.perf?.pp_speed === 'number'
              ? FloatFormatter.format(hiscore.perf.pp_speed)
              : '-'}
          </td>
          <td>
            {typeof hiscore.perf?.pp_acc === 'number'
              ? FloatFormatter.format(hiscore.perf.pp_acc)
              : '-'}
          </td>
          <td>
            {typeof hiscore.perf?.pp_flashlight === 'number'
              ? FloatFormatter.format(hiscore.perf.pp_flashlight)
              : '-'}
          </td>
          <td>
            <span class="date-diff" title={hiscore.ended_at}>
              {formatDateDiff(new Date(hiscore.ended_at))}
            </span>
          </td>
          <td
            >{hiscore.difficulty
              ? hiscore.difficulty.stars.toFixed(2)
              : hiscore.beatmap.difficultyrating.toFixed(2)}</td
          >
          <td>{(hiscore.accuracy * 100).toFixed(2)}%</td>
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
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  /* alternate row colors */
  tr:nth-child(odd) {
    background-color: #f2f2f2;
  }

  td {
    padding: 8px;
    border: none;
    text-align: left;
  }

  .beatmap-version {
    color: #797979;
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
</style>
