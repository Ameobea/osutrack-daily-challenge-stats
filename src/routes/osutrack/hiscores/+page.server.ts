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

const buildUnknownBeatmap = (beatmapID: number): OsutrackDbBeatmap => ({
  beatmap_id: beatmapID,
  title: 'Unknown Beatmap',
  artist: 'Unknown Artist',
  version: 'Unknown Version',
  creator: 'Unknown Creator',
  total_length: 0,
  hit_length: 0,
  bpm: 0,
  approved: 0,
  approved_date: null,
  last_update: '2000-01-01 00:00:00',
  beatmapset_id: 0,
  diff_approach: 0,
  diff_size: 0,
  diff_overall: 0,
  diff_drain: 0,
  difficultyrating: 0,
  mode: 0,
  source: '',
});

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

    let beatmap = beatmaps[hs.beatmap_id];
    if (!beatmap) {
      console.warn(`Beatmap ID ${hs.beatmap_id} not found in osutrack_db beatmaps`);
      beatmap = buildUnknownBeatmap(hs.beatmap_id);
    }

    return {
      ...hs,
      index: i + 1,
      beatmap,
      difficulty: difficulties[hs.beatmap_id],
      perf: performance_attrs[hs.id],
      attrs_with_mods: attrs_with_mods[hs.beatmap_id] ?? null,
    };
  });
  return { hiscores: data, mode };
};
