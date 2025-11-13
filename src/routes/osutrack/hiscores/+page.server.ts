import { error } from '@sveltejs/kit';

import {
  fetchUserHiscores,
  type BeatmapDifficulties,
  type HiscoreV2,
  type OsuPerformanceAttributes,
  type OsutrackDbBeatmap,
} from '../../../api';
import type { PageServerLoad } from './$types';

export type RichHiscore = HiscoreV2 & {
  index: number;
  beatmap: OsutrackDbBeatmap;
  difficulty: BeatmapDifficulties;
  perf: { earned: OsuPerformanceAttributes; max: OsuPerformanceAttributes } | null;
  attrs_with_mods: { cs: number; ar: number; od: number; hp: number; clock_rate: number } | null;
};

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

  const { beatmaps, difficulties, hiscores, performance_attrs, attrs_with_mods } =
    await fetchUserHiscores(fetch, userID, mode);
  const data = hiscores.map((hs, i) => {
    hs.mods.sort((a, b) => a.acronym.localeCompare(b.acronym));

    return {
      ...hs,
      index: i + 1,
      beatmap: beatmaps[hs.beatmap_id],
      difficulty: difficulties[hs.beatmap_id],
      perf: performance_attrs[hs.id],
      attrs_with_mods: attrs_with_mods[hs.beatmap_id] ?? null,
    };
  });
  return { hiscores: data, mode };
};
