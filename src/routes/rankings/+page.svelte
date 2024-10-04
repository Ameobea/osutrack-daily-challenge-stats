<script lang="ts">
  import { useQuery } from '@sveltestack/svelte-query';
  import { queryParam } from 'sveltekit-search-params';
  import SvelteSeo from 'svelte-seo';
  import { page } from '$app/stores';

  import { fetchDailyChallengeRankings } from '../../api';
  import type { PageData } from './$types';
  import RankingsTable from './RankingsTable.svelte';

  export let data: PageData;

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
  $: res = useQuery(
    ['rankings', $pageNumber],
    () => fetchDailyChallengeRankings(fetch, $pageNumber ?? 1),
    { keepPreviousData: true }
  );

  $: rankings = $pageNumber === initialPageNumber ? data.rankings : $res.data?.rankings;
</script>

<SvelteSeo
  title="osu!track Daily Challenge Rankings"
  description="Global rankings for the osu! daily challenge"
  openGraph={{
    title: 'osu!track Daily Challenge Rankings',
    description: 'Global rankings for the osu! daily challenge',
  }}
/>

<div class="root">
  <h1>Daily Challenge Rankings</h1>
  <RankingsTable {rankings} {highlightedUsername} {pageNumber} totalRankings={data.totalRankings} />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }

  h1 {
    text-align: center;
    margin-top: 16px;
    height: 100%;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 24px;
    }
  }

  @media (max-width: 700px) {
    h1 {
      margin-top: 64px;
    }
  }
</style>
