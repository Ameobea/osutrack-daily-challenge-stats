<script lang="ts">
  import type { MinimalGlobalChallengeDescriptor } from '../../api';
  import { formatDayID } from '../../util';

  export let map: MinimalGlobalChallengeDescriptor;
  export let formatValue: ((value: MinimalGlobalChallengeDescriptor) => string) | undefined =
    undefined;
</script>

<div class="root">
  <div class="title">
    <a target="_blank" href="https://osu.ppy.sh/b/{map.beatmap_id}">
      {map.title} [{map.difficulty_name}]
    </a>
  </div>
  <div>
    <span>{map.stars.toFixed(2)}★</span> By
    <a target="_blank" href="https://osu.ppy.sh/u/{map.mapper_user_id}">{map.mapper_username}</a>
  </div>
  {#if formatValue}
    <div>{formatValue(map)}</div>
  {/if}
  <div>On {formatDayID(map.day_id)}</div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 18px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 600px) {
    .title {
      font-size: 16px;
      white-space: normal;
    }
  }
</style>
