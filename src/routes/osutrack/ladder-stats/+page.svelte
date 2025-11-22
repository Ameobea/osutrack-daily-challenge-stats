<script lang="ts">
  import LadderStats from './LadderStats.svelte';
  import type { PageData } from './$types';
  import Header from './components/Header.svelte';

  let { data }: { data: PageData } = $props();

  const { simulationConfig, mode } = data;
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://ameobea.b-cdn.net/sources/bootstrap/css/bootstrap2.min.css"
  />
  <link rel="stylesheet" href="https://ameobea.b-cdn.net/osutrack/style.css" />
  <title>osu! Ladder Stats</title>
</svelte:head>

<Header />

<div class="root">
  <LadderStats {simulationConfig} {mode} />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
    padding: 0 6px;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
