<script lang="ts">
  import { useQuery } from '@sveltestack/svelte-query';
  import { queryParam } from 'sveltekit-search-params';
  import { page } from '$app/stores';

  import { type GenericRanking } from '../../api';
  import type { PageData } from './$types';
  import RankingsTable from './RankingsTable.svelte';

  export let data: PageData;
  export let valueTitle: string;
  export let fetchRankings: (
    fetch: typeof window.fetch,
    page: number
  ) => Promise<{ rankings: GenericRanking[]; totalRankings: number }>;

  const initialPageNumber = Math.max(+($page.url.searchParams.get('page') || '1'), 1);
  let didScrollIntoView = false;
  let highlightedUsername: string | null = null;
  $: if (!didScrollIntoView) {
    const hash = $page.url.hash;
    // we have to implement our own scrolling logic because the default hash-based scrolling
    // doesn't work with Sveltekit's client-side navigation
    if (hash.startsWith('#username=')) {
      highlightedUsername = decodeURIComponent(hash.slice(10));
      didScrollIntoView = true;
      setTimeout(
        () =>
          void document
            .querySelector(`[data-username="${highlightedUsername}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
        100
      );
    }
  }

  let pageNumber = queryParam<number>('page', {
    encode: v => v.toString(),
    decode: (v): number => (typeof v === 'string' ? +v : 1),
  });
  $: res = useQuery(['rankings', $pageNumber], () => fetchRankings(fetch, $pageNumber ?? 1), {
    keepPreviousData: true,
  });
  let lastRankings: GenericRanking[] | undefined;
  $: if ($res.data) {
    lastRankings = $res.data.rankings;
  }

  $: rankings =
    $pageNumber === initialPageNumber ? data.rankings : ($res.data?.rankings ?? lastRankings);
</script>

<div class="root">
  <RankingsTable
    {rankings}
    {highlightedUsername}
    {pageNumber}
    totalRankings={data.totalRankings}
    {valueTitle}
  />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }
</style>
