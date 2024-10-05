<script lang="ts">
  import type { MinimalGlobalChallengeDescriptor } from '../../api';
  import MinimalMapDisplay from './MinimalMapDisplay.svelte';

  export let minMap: MinimalGlobalChallengeDescriptor;
  export let maxMap: MinimalGlobalChallengeDescriptor;
  export let minLabel: string;
  export let maxLabel: string;
  export let formatValue: ((value: MinimalGlobalChallengeDescriptor) => string) | undefined =
    undefined;
</script>

<div class="root">
  <div>
    <h4>{minLabel}</h4>
    <MinimalMapDisplay map={minMap} {formatValue} />
  </div>
  <div>
    <h4>{maxLabel}</h4>
    <MinimalMapDisplay map={maxMap} {formatValue} />
  </div>
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    margin-bottom: 8px;
    gap: 12px;
    padding-left: 8px;
    padding-right: 8px;
    max-width: 100%;

    & > div {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }

  h4 {
    color: hsl(0, 0%, 60%);
    margin-bottom: 8px;
    text-align: center;
  }
</style>
