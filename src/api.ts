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

export const fetchUserDailyChangeHistory = async (
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
  return fetch(`${API_BASE_URL}/daily-challenge/${userID}/history${queryString}`).then(res =>
    res.json()
  );
};
