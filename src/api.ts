import { API_BASE_URL, ANALYTICS_SALT } from './conf';

export interface AnalyticsEvent {
  category: string;
  subcategory: string;
  payload?: unknown;
}

export interface DailyChallengeHistoryEntry {
  score: DailyChallengeScore;
  total_rankings: number;
  percentile: number;
}

export interface DailyChallengeScore {
  day_id: number;
  user_id: number;
  score_id: number;
  pp?: number;
  rank: string;
  statistics: Statistics;
  total_score: number;
  started_at: string;
  ended_at: string;
  mods: Mod[];
  max_combo: number;
  accuracy: number;
  user_rank: number;
}

export interface Statistics {
  good: any;
  great: number;
  large_bonus?: number;
  meh?: number;
  miss?: number;
  ok?: number;
  perfect: any;
  small_bonus?: number;
}

export interface Mod {
  acronym: string;
  settings?: Record<string, any>;
}

export interface HiscoreV2 {
  mods: Mod[];
  statistics: Statistics;
  beatmap_id: number;
  best_id: any;
  id: number;
  rank: string;
  user_id: number;
  accuracy: number;
  build_id?: number | null;
  ended_at: string;
  has_replay: boolean;
  is_perfect_combo: boolean;
  legacy_perfect: boolean;
  legacy_score_id?: number | null;
  legacy_total_score?: number | null;
  max_combo: number;
  passed: boolean;
  pp?: number | null;
  ruleset_id: number;
  started_at?: string | null;
  total_score: number;
  replay: boolean;
  // beatmap: Beatmap;
  // user: User;
}

export interface OsutrackDbBeatmap {
  beatmapset_id: number;
  beatmap_id: number;
  approved: number;
  approved_date: string | null;
  last_update: string;
  total_length: number;
  hit_length: number;
  version: string;
  artist: string;
  title: string;
  creator: string;
  bpm: number;
  source: string;
  difficultyrating: number;
  diff_size: number;
  diff_overall: number;
  diff_approach: number;
  diff_drain: number;
  mode: number;
}

export interface BeatmapDifficulties {
  score_id: string;
  difficulty_aim: number;
  difficulty_speed: number;
  difficulty_flashlight: number;
  speed_note_count: number;
  slider_factor: number;
  stars: number;
}

export interface OsuPerformanceAttributes {
  pp: number;
  pp_acc: number;
  pp_aim: number;
  pp_flashlight: number;
  pp_speed: number;
  effective_miss_count: number;
  speed_deviation: number | null;
}

export interface BeatmapAttrs {
  cs: number;
  ar: number;
  od: number;
  hp: number;
  clock_rate: number;
}

export interface FetchHiscoresResponse {
  hiscores: HiscoreV2[];
  beatmaps: Record<number, OsutrackDbBeatmap>;
  difficulties: Record<number, BeatmapDifficulties>;
  performance_attrs: Record<
    number,
    { earned: OsuPerformanceAttributes; max: OsuPerformanceAttributes }
  >;
  attrs_with_mods: Record<number, BeatmapAttrs>;
}

export interface OsutrackUserStats {
  id: number;
  count300: number;
  count100: number;
  count50: number;
  playcount: number;
  ranked_score: number;
  total_score: number;
  pp_rank: number;
  level: number;
  pp_raw: number;
  accuracy: number;
  count_rank_ss: number;
  count_rank_s: number;
  count_rank_a: number;
  timestamp: string;
  mode: number;
  username: string;
}

export const fetchUsername = async (fetch: typeof window.fetch, userID: number): Promise<string> =>
  fetch(`${API_BASE_URL}/users/${userID}/username`).then(res => {
    if (res.status === 404) {
      return '<unknown user>';
    }
    return res.json();
  });

export const fetchUserID = async (fetch: typeof window.fetch, username: string): Promise<number> =>
  fetch(`${API_BASE_URL}/users/${username}/id?mode=0`).then(res => res.json());

export const fetchUserStats = async (
  fetch: typeof window.fetch,
  username: string,
  mode: number
): Promise<OsutrackUserStats> =>
  fetch(`${API_BASE_URL}/users/${username}/stats?mode=${mode}`).then(res => res.json());

export const fetchUserHiscores = async (
  fetch: typeof window.fetch,
  userID: number,
  mode: number,
  limit: number = 200
): Promise<FetchHiscoresResponse> =>
  fetch(`${API_BASE_URL}/users/${userID}/hiscores/v2?mode=${mode}&limit=${limit}`).then(res =>
    res.json()
  );

export const fetchUserDailyChallengeHistory = async (
  fetch: typeof window.fetch,
  userID: number,
  startDayID?: number,
  endDayID?: number
): Promise<DailyChallengeHistoryEntry[]> => {
  const params = new URLSearchParams();
  if (startDayID) {
    params.append('start_day_id', startDayID.toString());
  }
  if (endDayID) {
    params.append('end_day_id', endDayID.toString());
  }
  const builtParams = params.toString();
  const queryString = builtParams ? `?${builtParams}` : '';
  return fetch(`${API_BASE_URL}/daily-challenge/user/${userID}/history${queryString}`).then(res =>
    res.json()
  );
};

export interface DailyChallengeStatsForDay {
  descriptor: DailyChallengeDescriptor;
  total_scores: number;
  histogram: Histogram;
}

export interface DailyChallengeDescriptor {
  day_id: number;
  room_id: number;
  playlist_id: number;
  current_playlist_item: CurrentPlaylistItem;
}

export interface CurrentPlaylistItem {
  id: number;
  room_id: number;
  allowed_mods: Mod[];
  required_mods: Mod[];
  beatmap: Beatmap;
}

export interface Beatmap {
  beatmapset: Beatmapset;
  beatmapset_id: number;
  difficulty_rating: number;
  id: number;
  mode: string;
  status: string;
  total_length: number;
  user_id: number;
  version: string;
}

export interface Beatmapset {
  artist: string;
  artist_unicode: string;
  covers: Covers;
  creator: string;
  favourite_count: number;
  hype: any;
  id: number;
  nsfw: boolean;
  offset: number;
  play_count: number;
  preview_url: string;
  source: string;
  spotlight: boolean;
  status: string;
  title: string;
  title_unicode: string;
  track_id: number;
  user_id: number;
  video: boolean;
}

export interface Covers {
  card: string;
  'card@2x': string;
  cover: string;
  'cover@2x': string;
  list: string;
  'list@2x': string;
  slimcover: string;
  'slimcover@2x': string;
}

export interface Histogram {
  min: number;
  max: number;
  buckets: number[];
}

export const fetchStatsForDay = (
  fetch: typeof window.fetch,
  dayID: number
): Promise<DailyChallengeStatsForDay | null> =>
  fetch(`${API_BASE_URL}/daily-challenge/day/${dayID}/stats`).then(res => {
    if (res.status === 404) {
      return null;
    }
    return res.json();
  });

export const getUserDailyChallengeForDay = (
  fetch: typeof window.fetch,
  userID: number,
  dayID: number
): Promise<DailyChallengeScore> =>
  fetch(`${API_BASE_URL}/daily-challenge/user/${userID}/day/${dayID}`).then(res => res.json());

export interface DailyChallengeUserStats {
  total_participation: number;
  total_challenge_count: number;
  total_score_stats: TotalScoreStats;
  score_distribution: ScoreDistribution;
  time_of_day_distribution: TimeOfDayDistribution;
  streaks: Streaks;
  first_place_count: number;
  first_place_rank: number | null;
  top_1_percent_count: number;
  top_1_percent_rank: number | null;
  top_10_percent_count: number;
  top_10_percent_rank: number | null;
  top_50_percent_count: number;
  top_50_percent_rank: number | null;
  best_placement_absolute: BestPlacement | null;
  best_placement_percentile: BestPlacement | null;
  best_placement_score: BestPlacement | null;
  best_placement_pp: BestPlacement | null;
  most_used_mods: [Mod | null, number][];
  most_used_mod_combo: Mod[];
}

export interface TotalScoreStats {
  total_score_sum: number;
  total_score_rank: number;
  total_score_percentile: number;
}

export interface ScoreDistribution {
  min: number;
  max: number;
  buckets: number[];
}

export interface TimeOfDayDistribution {
  min: number;
  max: number;
  buckets: number[];
}

export interface Streaks {
  cur_daily_streak: number;
  cur_weekly_streak: number;
  best_daily_streak: number;
  best_weekly_streak: number;
  cur_top_1_percent_streak: number;
  best_top_1_percent_streak: number;
  best_top_1_percent_streak_span: [number, number] | null;
  cur_top_10_percent_streak: number;
  best_top_10_percent_streak: number;
  best_top_10_percent_streak_span: [number, number] | null;
  cur_top_50_percent_streak: number;
  best_top_50_percent_streak: number;
  best_top_50_percent_streak_span: [number, number] | null;
}

export interface BestPlacement {
  day_id: number;
  score: number;
  rank: number;
  total_rankings: number;
  percentile: number;
  pp?: number | null;
}

export const fetchUserDailyChallengeStats = (
  fetch: typeof window.fetch,
  userID: number
): Promise<DailyChallengeUserStats> =>
  fetch(`${API_BASE_URL}/daily-challenge/user/${userID}/stats`).then(res => res.json());

export interface DailyChallengeRanking {
  user_id: number;
  username: string;
  rank: number;
  total_score: number;
}

export interface DailyChallengePercentRankingEntry {
  user_id: number;
  username: string;
  rank: number;
  top_percent_count: number;
}

export interface GenericRanking {
  user_id: number;
  username: string;
  rank: number;
  value: number;
}

export const fetchDailyChallengeTotalScoreRankings = (
  fetch: typeof window.fetch,
  page: number
): Promise<{ rankings: DailyChallengeRanking[]; total_rankings: number }> =>
  fetch(`${API_BASE_URL}/daily-challenge/rankings?page=${page}`).then(res => res.json());

export const fetchDailyChallengeTopPercentRankings = (
  fetch: typeof window.fetch,
  percent: 100 | 50 | 10 | 1,
  page: number
): Promise<{ rankings: DailyChallengePercentRankingEntry[]; total_rankings: number }> =>
  fetch(`${API_BASE_URL}/daily-challenge/rankings/percent/${percent}?page=${page}`).then(res =>
    res.json()
  );

export const fetchDailyChallengeTopFirstPlaceCountRankings = (
  fetch: typeof window.fetch,
  page: number
): Promise<{ rankings: DailyChallengePercentRankingEntry[]; total_rankings: number }> =>
  fetch(`${API_BASE_URL}/daily-challenge/rankings/first-place?page=${page}`).then(res =>
    res.json()
  );

export interface MinimalGlobalChallengeDescriptor {
  day_id: number;
  beatmap_id: number;
  title: string;
  difficulty_name: string;
  mapper_user_id: number;
  mapper_username: string;
  stars: number;
  date_ranked: string;
  length_seconds: number;
}

export interface GlobalDailyChallengeStats {
  total_unique_participants: number;
  total_combined_score: number;
  total_rankings: number;
  total_challenges: number;
  map_stats: MapStats;
}

export interface TopPPPlay {
  score: DailyChallengeScore;
  total_scores_for_day: number;
  username: string;
}

export interface MapStats {
  difficulty_distribution: Histogram;
  length_distribution_seconds: Histogram;
  ranked_timestamp_distribution: Histogram;
  ar_distribution: Histogram;
  od_distribution: Histogram;
  cs_distribution: Histogram;
  top_mappers: TopMapper[];
  top_required_mods: [Mod[], number][];
  easiest_map: MinimalGlobalChallengeDescriptor;
  hardest_map: MinimalGlobalChallengeDescriptor;
  shortest_map: MinimalGlobalChallengeDescriptor;
  longest_map: MinimalGlobalChallengeDescriptor;
  oldest_map: MinimalGlobalChallengeDescriptor;
  newest_map: MinimalGlobalChallengeDescriptor;
  top_pp_plays: TopPPPlay[];
}

export interface TopMapper {
  user_id: number;
  username: string;
  map_ids: number[];
}

export const fetchGlobalDailyChallengeStats = (
  fetch: typeof window.fetch
): Promise<GlobalDailyChallengeStats> =>
  fetch(`${API_BASE_URL}/daily-challenge/global-stats`).then(res => res.json());

export const fetchLatestChallengeDayID = (fetch: typeof window.fetch): Promise<number> =>
  fetch(`${API_BASE_URL}/daily-challenge/latest-day-id`).then(res => res.json());

export const fetchRankingsForDay = (
  fetch: typeof window.fetch,
  dayID: number,
  page: number
): Promise<DailyChallengeRanking[]> =>
  fetch(`${API_BASE_URL}/daily-challenge/day/${dayID}/rankings?page=${page}`).then(res =>
    res.json()
  );

const computeAnalyticsVerificationHash = async (events: AnalyticsEvent[]): Promise<string> => {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(events.map(evt => evt.category + evt.subcategory).join('') + ANALYTICS_SALT)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const SubmittedOnceEvents = new Set<string>();

let analyticsSessionID: string | null = null;
const getSessionID = (): string => {
  if (analyticsSessionID) {
    return analyticsSessionID;
  }
  const gen = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };
  try {
    analyticsSessionID = sessionStorage.getItem('analyticsSessionID');
    if (!analyticsSessionID) {
      analyticsSessionID = gen();
      sessionStorage.setItem('analyticsSessionID', analyticsSessionID);
    }
  } catch (_err) {
    analyticsSessionID = gen();
  }
  return analyticsSessionID;
};

// one queue per project since the batch endpoint takes a single project per request
const analyticsQueues = new Map<string, AnalyticsEvent[]>();
let analyticsFlushTimer: ReturnType<typeof setTimeout> | null = null;

const flushAnalyticsEvents = async () => {
  const batches = [...analyticsQueues.entries()];
  analyticsQueues.clear();
  for (const [project, events] of batches) {
    try {
      const verification = await computeAnalyticsVerificationHash(events);
      await fetch(`${API_BASE_URL}/a/z`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events, verification, project, session_id: getSessionID() }),
        keepalive: true,
      });
    } catch (_err) {
      // analytics must never break the app
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (analyticsQueues.size) {
      void flushAnalyticsEvents();
    }
  });
}

export const submitAnalyticsEvent = (
  event: AnalyticsEvent,
  project = 'osu-daily-challenge',
  once = false
): void => {
  if (typeof window === 'undefined') {
    return;
  }
  if (window.location.href.includes('http://localhost')) {
    console.debug('[analytics]', project, event);
    return;
  }

  if (once) {
    const eventID = `${event.category}::${event.subcategory}`;
    if (SubmittedOnceEvents.has(eventID)) {
      return;
    }
    SubmittedOnceEvents.add(eventID);
  }

  let queue = analyticsQueues.get(project);
  if (!queue) {
    queue = [];
    analyticsQueues.set(project, queue);
  }
  queue.push(event);
  if (analyticsFlushTimer === null) {
    analyticsFlushTimer = setTimeout(() => {
      analyticsFlushTimer = null;
      void flushAnalyticsEvents();
    }, 800);
  }
};

export const getEmbedPage = (): string => {
  if (typeof window === 'undefined') {
    return 'ssr';
  }
  const p = window.location.pathname;
  if (p === '/' || p === '') {
    return 'homepage';
  }
  if (p.startsWith('/osutrack/hiscores')) {
    return 'standalone';
  }
  if (p.startsWith('/osutrack/')) {
    return 'osutrack_user';
  }
  return 'other';
};
export interface SimulationConfig {
  rank_to_decay: [number, number][]; // (u32, f32)[]
  rank_to_density: [number, number][]; // (u32, f32)[]
  rank_to_pp: [number, number][]; // (u32, f32)[]
}

export const getLadderSimulationConfig = async (
  mode: number,
  fetch: typeof window.fetch = window.fetch
): Promise<SimulationConfig> =>
  fetch(`${API_BASE_URL}/analysis/simulation-config?mode=${mode}`).then(res => res.json());

export const getCompressedLadderStatsData = async (
  mode: number,
  fetch: typeof window.fetch = window.fetch
): Promise<ArrayBuffer> =>
  fetch(`${API_BASE_URL}/analysis/dataset?mode=${mode}`).then(res => res.arrayBuffer());

// ---- daily challenge stat embeds ----

export type StatKey =
  | 'participation'
  | 'current_daily_streak'
  | 'best_daily_streak'
  | 'current_weekly_streak'
  | 'best_weekly_streak'
  | 'global_rank'
  | 'total_score'
  | 'best_placement_rank'
  | 'best_placement_percentile'
  | 'best_placement_score'
  | 'best_placement_pp'
  | 'top50_count'
  | 'top10_count'
  | 'top1_count'
  | 'first_place_count'
  | 'top1_streak'
  | 'top10_streak'
  | 'top50_streak'
  | 'most_used_mods';

// `none` | `calendar` | `score_histogram` | `time_of_day_histogram`, or `{ hero_stat: StatKey }`.
// matches the backend `Feature` serde shape (snake_case unit variants + a single tagged variant).
export type EmbedFeature =
  | 'none'
  | 'calendar'
  | 'score_histogram'
  | 'time_of_day_histogram'
  | { hero_stat: StatKey };

export interface EmbedColors {
  background: string;
  text: string;
  secondary_text: string;
  border: string;
}

export interface EmbedConfig {
  stats: StatKey[];
  colors: EmbedColors;
  rainbow_full_streak: boolean;
  show_avatar: boolean;
  show_header: boolean;
  scale: number | null;
  feature: EmbedFeature;
}

export const createEmbed = (
  fetch: typeof window.fetch,
  userID: number,
  config: EmbedConfig
): Promise<{ hash: string }> =>
  fetch(`${API_BASE_URL}/daily-challenge/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userID, config }),
  }).then(res => {
    if (!res.ok) {
      throw new Error(`Failed to create embed: ${res.status}`);
    }
    return res.json();
  });

export const embedPngUrl = (userID: number, hash: string): string =>
  `${API_BASE_URL}/daily-challenge/embed/${userID}/${hash}.png`;

export const embedSvgUrl = (userID: number, hash: string): string =>
  `${API_BASE_URL}/daily-challenge/embed/${userID}/${hash}.svg`;
