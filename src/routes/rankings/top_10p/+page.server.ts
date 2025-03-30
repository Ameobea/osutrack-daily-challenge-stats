import { error } from '@sveltejs/kit';

import { fetchDailyChallengeTopPercentRankings } from '../../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url: { searchParams } }) => {
  const rawPageNumber = searchParams.get('page');
  if (rawPageNumber && Number.isNaN(+rawPageNumber)) {
    return error(400, 'Invalid page number');
  }

  const page = Math.max(+(rawPageNumber ?? 1), 1);
  const { rankings, total_rankings: totalRankings } = await fetchDailyChallengeTopPercentRankings(
    fetch,
    10,
    page
  );
  return {
    rankings: rankings.map(rank => ({ ...rank, value: rank.top_percent_count })),
    totalRankings,
  };
};
