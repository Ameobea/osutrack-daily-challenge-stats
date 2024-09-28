import { error } from '@sveltejs/kit';

import { fetchUserDailyChangeHistory } from '../../../api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params: { user: rawUserID } }) => {
  const userID = parseInt(rawUserID, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }

  const stats = await fetchUserDailyChangeHistory(userID);
  return { stats };
};
