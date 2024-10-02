import { error } from '@sveltejs/kit';

import { fetchUserDailyChallengeHistory, fetchLatestChallengeDayID } from '../../../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params: { user: rawUserID } }) => {
  const userID = parseInt(rawUserID, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }

  const [history, latestChallengeDayID] = await Promise.all([
    fetchUserDailyChallengeHistory(fetch, userID),
    fetchLatestChallengeDayID(fetch),
  ]);
  return { history, latestChallengeDayID };
};
