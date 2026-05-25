import type { EmbedColors, EmbedConfig, StatKey } from '../../../../../../api';

// ordered to match the backend `StatKey` enum; this is also the order shown in the picker
export const ALL_STAT_KEYS: StatKey[] = [
  'participation',
  'current_daily_streak',
  'best_daily_streak',
  'current_weekly_streak',
  'best_weekly_streak',
  'global_rank',
  'total_score',
  'best_placement_rank',
  'best_placement_percentile',
  'best_placement_score',
  'best_placement_pp',
  'top50_count',
  'top10_count',
  'top1_count',
  'first_place_count',
  'top1_streak',
  'top10_streak',
  'top50_streak',
  'most_used_mods',
];

export const STAT_LABELS: Record<StatKey, string> = {
  participation: 'Participation',
  current_daily_streak: 'Current Daily Streak',
  best_daily_streak: 'Best Daily Streak',
  current_weekly_streak: 'Current Weekly Streak',
  best_weekly_streak: 'Best Weekly Streak',
  global_rank: 'Global Rank',
  total_score: 'Total Score',
  best_placement_rank: 'Best Placement (Rank)',
  best_placement_percentile: 'Best Placement (Percentile)',
  best_placement_score: 'Highest Score',
  best_placement_pp: 'Highest PP',
  top50_count: 'Top 50% Count',
  top10_count: 'Top 10% Count',
  top1_count: 'Top 1% Count',
  first_place_count: 'First Place Count',
  top1_streak: 'Top 1% Streak',
  top10_streak: 'Top 10% Streak',
  top50_streak: 'Top 50% Streak',
  most_used_mods: 'Top Mod Combo',
};

export const DEFAULT_COLORS: EmbedColors = {
  background: '#161616',
  text: '#fefefe',
  secondary_text: '#b3b3b3',
  border: '#22282a',
};

export const COLOR_FIELDS: { key: keyof EmbedColors; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
  { key: 'secondary_text', label: 'Secondary Text' },
  { key: 'border', label: 'Border' },
];

export const makeDefaultConfig = (): EmbedConfig => ({
  stats: ['current_daily_streak', 'best_daily_streak', 'global_rank', 'participation', 'top1_count'],
  colors: { ...DEFAULT_COLORS },
  rainbow_full_streak: true,
  show_avatar: true,
  show_header: true,
  scale: 2,
  feature: 'calendar',
});

// the four non-hero feature choices; hero is handled separately since it carries a StatKey
export const SIMPLE_FEATURES: { value: 'none' | 'calendar' | 'score_histogram' | 'time_of_day_histogram'; label: string }[] = [
  { value: 'calendar', label: 'Calendar' },
  { value: 'score_histogram', label: 'Score Histogram' },
  { value: 'time_of_day_histogram', label: 'Time of Day Histogram' },
  { value: 'none', label: 'None' },
];
