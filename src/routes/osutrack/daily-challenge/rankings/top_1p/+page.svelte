<script lang="ts">
  import type { PageData } from '../$types';
  import { fetchDailyChallengeTopPercentRankings } from '../../../../../api';
  import RankingsPage from '../RankingsPage.svelte';

  export let data: PageData;

  const fetchRankings = async (fetch: typeof window.fetch, page: number) =>
    fetchDailyChallengeTopPercentRankings(fetch, 1, page).then(({ total_rankings, rankings }) => ({
      totalRankings: total_rankings,
      rankings: rankings.map(rank => ({ ...rank, value: rank.top_percent_count })),
    }));
</script>

<div style="display: flex; justify-content: center; text-align: center; flex-direction: column;">
  <h1>Daily Challenge Top 1% Count Rankings</h1>
  <i style="font-style: italic; color: #bdbdbd; margin-top: 4px;">
    Ties broken by sum of total score across all days
  </i>
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
