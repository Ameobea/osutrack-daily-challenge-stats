<script lang="ts" context="module">
  const RankFormatter = new Intl.NumberFormat(undefined, {
    style: 'decimal',
    maximumFractionDigits: 0,
  });

  const TotalScoreFormatter = new Intl.NumberFormat(undefined, {
    // using suffixes like K and M
    notation: 'compact',
    maximumFractionDigits: 3,
  });
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { useQuery } from '@sveltestack/svelte-query';
  import { queryParam } from 'sveltekit-search-params';
  import { Pagination } from 'carbon-components-svelte';

  import { fetchDailyChallengeRankings } from '../../api';
  import type { PageData } from './$types';

  export let data: PageData;

  const initialPageNumber = Math.max(+($page.url.searchParams.get('page') || '1'), 1);

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

<div class="root">
  <h1>Daily Challenge Rankings</h1>
  <div class="rankings-table">
    <div class="first header">Rank</div>
    <div class="header">Username</div>
    <div class="last header">Total Score</div>
    {#if rankings}
      {#each rankings as { rank, username, total_score, user_id }}
        <div class="first rank">#{RankFormatter.format(rank)}</div>
        <div><a href="/osutrack/daily-challenge/user/{user_id}">{username}</a></div>
        <div class="last" title={RankFormatter.format(total_score)}>
          {TotalScoreFormatter.format(total_score)}
        </div>
      {/each}
    {:else}
      <div>Loading...</div>
    {/if}
  </div>

  <Pagination
    totalItems={data.totalRankings}
    page={$pageNumber ?? 1}
    on:change={evt => pageNumber.set(evt.detail.page ?? 1)}
    pageSize={50}
    pageSizeInputDisabled
    class="pagination"
  />
</div>

<style lang="css">
  .root {
    display: flex;
    flex-direction: column;
  }

  h1 {
    text-align: center;
    margin-top: 16px;
  }

  .rankings-table {
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    max-width: calc(min(440px, 100vw - 20px));
    margin: 0 auto;
    width: 100%;
    font-size: 19px;
    margin-top: 32px;
    margin-bottom: 16px;

    .header {
      font-weight: 500;
      font-size: 20px;
    }

    & > div {
      display: flex;
      padding: 1px 4px;
      background: rgba(255, 255, 255, 0.03);
      margin-bottom: 5px;

      a {
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .first {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      padding-left: 8px;
    }

    .rank {
      font-size: 16px;
      align-items: center;
    }

    .last {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      padding-right: 8px;
    }
  }

  :global(.pagination) {
    max-width: calc(min(600px, 100vw));
    overflow-x: hidden !important;
    margin: 0 auto;
  }

  @media (max-width: 600px) {
    .rankings-table {
      font-size: 16px;

      .header {
        font-size: 18px;
      }
    }

    h1 {
      font-size: 24px;
    }
  }
</style>
