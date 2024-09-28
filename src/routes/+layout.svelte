<script lang="ts">
  import { onMount } from 'svelte';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
  import 'carbon-components-svelte/css/g100.css';

  import '../reset.css';
  import { initSentry } from '../sentry';

  onMount(initSentry);

  const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
  <div class="root">
    <slot />
  </div></QueryClientProvider
>

<style>
  .root {
    display: flex;
    max-width: 1270px;
    margin: 0 auto;
  }
</style>
