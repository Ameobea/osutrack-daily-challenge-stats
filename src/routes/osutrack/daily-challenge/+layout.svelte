<script lang="ts">
  import { onMount } from 'svelte';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
  import 'carbon-components-svelte/css/g100.css';

  import '../../../reset.css';
  import { initSentry } from '../../../sentry';
  import { page } from '$app/stores';

  onMount(initSentry);

  const queryClient = new QueryClient();
</script>

<svelte:head>
  <title>osu!track Daily Challenge Stats</title>
</svelte:head>

{#if $page.url.pathname !== '/osutrack/daily-challenge' && $page.url.pathname !== '/osutrack/daily-challenge/'}
  <a class="back-to-home" href="/osutrack/daily-challenge/"> Back to home </a>
{/if}

<QueryClientProvider client={queryClient}>
  <div class="content">
    <slot />
  </div>
</QueryClientProvider>

<style>
  :global(body, html) {
    background: #121212;
  }

  :global(#app) {
    width: 1240px;
    max-width: 1240px;
    min-width: 1240px;
    margin-left: auto;
    margin-right: auto;
  }

  :global(body, table) {
    font-family: 'Oxygen', sans-serif;
    color: rgb(85, 85, 85);
  }

  .content {
    max-width: 1270px;
    margin: 0 auto;
    background: #161616;
  }

  :global(a) {
    color: rgb(244, 244, 244);
  }

  :global(:root) {
    color-scheme: dark;
  }

  .back-to-home {
    position: absolute;
    top: 8px;
    right: 8px;
    border: 1px solid hsl(200, 10%, 15%);
    border-radius: 4px;
    padding: 3px 6px;
    text-decoration: none;

    &:hover {
      background: hsl(200, 10%, 15%);
    }
  }
</style>
