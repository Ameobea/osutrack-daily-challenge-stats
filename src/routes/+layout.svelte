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
  <div class="content">
    <slot />
  </div>
</QueryClientProvider>

<style>
  .content {
    max-width: 1270px;
    margin: 0 auto;
  }

  :global(a) {
    color: rgb(244, 244, 244);
  }
</style>
