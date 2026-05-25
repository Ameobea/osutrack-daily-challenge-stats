import { error } from '@sveltejs/kit';

import { fetchUserDailyChallengeStats } from '../../../../../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { user } }) => {
  const userID = parseInt(user, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }

  // only used to decide whether to surface the "rainbow on full streak" toggle
  const stats = await fetchUserDailyChallengeStats(fetch, userID);
  const isFullStreak =
    stats.total_challenge_count > 0 &&
    stats.total_participation === stats.total_challenge_count;

  return { isFullStreak };
};
