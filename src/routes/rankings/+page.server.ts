import { error } from '@sveltejs/kit';
import { fetchDailyChallengeRankings } from '../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url: { searchParams } }) => {
  const rawPageNumber = searchParams.get('page');
  if (rawPageNumber && Number.isNaN(+rawPageNumber)) {
    return error(400, 'Invalid page number');
  }

  const page = Math.max(+(rawPageNumber ?? 1), 1);
  const { rankings, total_rankings: totalRankings } = await fetchDailyChallengeRankings(
    fetch,
    page
  );
  return { rankings, totalRankings };
};
