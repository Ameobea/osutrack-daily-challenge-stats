<script lang="ts">
  import type { DailyChallengeScore, TopPPPlay } from '../../api';
  import ModDisplay from '../../components/ModDisplay.svelte';
  import { formatDayID } from '../../util';

  export let topPPPlays: TopPPPlay[];
</script>

<div class="root">
  <div class="header">PP</div>
  <div class="header">User</div>
  <div class="header">Mods</div>
  <div class="header">Challenge</div>
  {#each topPPPlays as play}
    <div class="pp">{typeof play.score.pp === 'number' ? play.score.pp.toFixed(2) : '-'}</div>
    <div>
      <a target="_blank" href={`https://osu.ppy.sh/u/${play.score.user_id}`}>{play.username}</a>
    </div>
    <div class="mods">
      {#each play.score.mods as mod}
        <ModDisplay {mod} />
      {/each}
    </div>
    <div>{formatDayID(play.score.day_id)}</div>
  {/each}
</div>

<style lang="css">
  .root {
    display: grid;
    grid-template-columns: max-content 1fr 1fr max-content;
    padding: 16px;
    gap: 8px;
    font-size: 16px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;

    .header {
      color: hsl(0, 0%, 60%);
      font-size: 18px;
    }

    .pp {
      padding-right: 8px;
    }

    .mods {
      display: flex;
      flex-direction: row;
      gap: 6px;
    }
  }

  @media (max-width: 900px) {
    .root {
      font-size: 13px;
      gap: 4px;
      padding: 8px;
    }
  }
</style>
