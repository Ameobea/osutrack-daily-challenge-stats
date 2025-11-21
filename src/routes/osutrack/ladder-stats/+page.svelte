<script lang="ts">
  import LadderStats from './LadderStats.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const { simulationConfig, mode } = data;
</script>

<div class="root">
  <LadderStats {simulationConfig} {mode} />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
