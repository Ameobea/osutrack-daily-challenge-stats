import { fetchGlobalDailyChallengeStats } from '../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  const stats = await fetchGlobalDailyChallengeStats(fetch);
  return { stats };
};
