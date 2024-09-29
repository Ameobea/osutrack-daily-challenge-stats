import { error } from '@sveltejs/kit';

import { fetchUserDailyChangeHistory, fetchUsername } from '../../../api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params: { user: rawUserID } }) => {
  const userID = parseInt(rawUserID, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }

  const [history, username] = await Promise.all([
    fetchUserDailyChangeHistory(fetch, userID),
    fetchUsername(fetch, userID),
  ]);
  return { history, username };
};
