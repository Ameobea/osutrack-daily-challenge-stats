<script lang="ts">
  import { onMount } from 'svelte';
  import 'carbon-components-svelte/css/g100.css';

  import '../reset.css';
  import { initSentry } from '../sentry';

  onMount(initSentry);
</script>

<div class="root">
  <slot />
</div>

<style>
  .root {
    display: flex;
    max-width: 1270px;
    margin: 0 auto;
  }
</style>
