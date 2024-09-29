import { API_BASE_URL } from './conf';

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

export const fetchUsername = async (fetch: typeof window.fetch, userID: number): Promise<string> =>
  fetch(`${API_BASE_URL}/users/${userID}/username`).then(res => res.json());

export const fetchUserDailyChangeHistory = async (
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

export interface UserDailyChallengeStats {
  total_participation: number;
  total_score_stats: TotalScoreStats;
  score_distribution: ScoreDistribution;
  time_of_day_distribution: TimeOfDayDistribution;
  streaks: Streaks;
  top_10_percent_count: number;
  top_50_percent_count: number;
  best_placement_absolute: BestPlacement;
  best_placement_percentile: BestPlacement;
  best_placement_score: BestPlacement;
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
}

export interface BestPlacement {
  day_id: number;
  score: number;
  rank: number;
  total_rankings: number;
  percentile: number;
}

export const fetchUserDailyChallengeStats = (
  fetch: typeof window.fetch,
  userID: number
): Promise<UserDailyChallengeStats> =>
  fetch(`${API_BASE_URL}/daily-challenge/user/${userID}/stats`).then(res => res.json());
