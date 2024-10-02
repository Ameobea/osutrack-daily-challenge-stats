import { error } from '@sveltejs/kit';

import { fetchUserDailyChallengeHistory } from '../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { user: rawUserID } }) => {
  const userID = parseInt(rawUserID, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }

  const stats = await fetchUserDailyChallengeHistory(fetch, userID);
  return { stats };
};
