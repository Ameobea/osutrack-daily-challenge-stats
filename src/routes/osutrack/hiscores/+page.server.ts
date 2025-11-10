import { error } from '@sveltejs/kit';

import { fetchUserHiscores } from '../../../api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
  const rawUserID = url.searchParams.get('user');
  const userID = Number(rawUserID);
  if (!rawUserID || isNaN(userID)) {
    return error(400, 'Invalid or missing user ID');
  }
  const modeParam = url.searchParams.get('mode');
  const mode = modeParam ? Number(modeParam) : 0;
  if (modeParam && isNaN(mode)) {
    return error(400, 'Invalid mode parameter');
  }

  const { beatmaps, difficulties, hiscores, performance_attrs } = await fetchUserHiscores(
    fetch,
    userID,
    mode
  );
  const data = hiscores.map(hs => {
    hs.mods.sort((a, b) => a.acronym.localeCompare(b.acronym));

    return {
      ...hs,
      beatmap: beatmaps[hs.beatmap_id],
      difficulty: difficulties[hs.beatmap_id],
      perf: performance_attrs[hs.id],
    };
  });
  return { hiscores: data };
};
