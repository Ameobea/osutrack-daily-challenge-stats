import { error } from '@sveltejs/kit';
import { fetchUserDailyChallengeStats } from '../../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { user } }) => {
  const userID = parseInt(user, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }
  const stats = await fetchUserDailyChallengeStats(fetch, userID);
  return { stats };
};
