import { error } from '@sveltejs/kit';

import { fetchUsername } from '../../../api';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, params: { user: rawUserID } }) => {
  const userID = parseInt(rawUserID, 10);
  if (isNaN(userID)) {
    return error(400, 'Invalid user ID');
  }

  const username = await fetchUsername(fetch, userID);
  return { username };
};
