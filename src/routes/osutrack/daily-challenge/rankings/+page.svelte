<script lang="ts">
  import SvelteSeo from 'svelte-seo';

  import type { PageData } from '../$types';
  import { fetchDailyChallengeTotalScoreRankings } from '../../../../api';
  import RankingsPage from './RankingsPage.svelte';
  import { queryParam } from 'sveltekit-search-params';

  export let data: PageData;

  const fetchRankings = async (fetch: typeof window.fetch, page: number) =>
    fetchDailyChallengeTotalScoreRankings(fetch, page).then(({ total_rankings, rankings }) => ({
      totalRankings: total_rankings,
      rankings: rankings.map(rank => ({ ...rank, value: rank.total_score })),
    }));

  let pageNumber = queryParam<number>('page', {
    encode: v => v.toString(),
    decode: (v): number => (typeof v === 'string' ? +v : 1),
  });
  $: title = `osu!track Daily Challenge Rankings${($pageNumber || 0) > 1 ? ` - Page ${$pageNumber}` : ''}`;
  const description = 'Global rankings for the osu! daily challenge';
</script>

<SvelteSeo {title} {description} openGraph={{ title, description }} />

<div style="display: flex; justify-content: center; text-align:center">
  <h1>Daily Challenge Total Score Rankings</h1>
</div>
<RankingsPage {data} {fetchRankings} valueTitle="Count" />

<style lang="css">
  h1 {
    text-align: center;
    margin-top: 16px;
    height: 100%;
    padding-left: 10px;
    padding-right: 10px;
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
