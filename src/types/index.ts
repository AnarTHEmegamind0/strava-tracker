// Strava Types
export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  country: string;
  profile: string;
  profile_medium: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  kudos_count: number;
  achievement_count: number;
  map?: {
    summary_polyline: string;
  };
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: StravaAthlete;
}

// Database Types
export interface DBUser {
  id: number;
  strava_id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_url: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: number;
  created_at: string;
  updated_at: string;
}

export interface DBActivity {
  id: number;
  user_id: number;
  strava_id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elevation_gain: number;
  average_speed: number;
  calories: number;
  created_at: string;
}

export interface DBChatMessage {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Goal Types
export type GoalType = 'weekly' | 'monthly';
export type GoalMetric = 'distance' | 'time' | 'count' | 'elevation';

export interface DBGoal {
  id: number;
  user_id: number;
  title: string;
  type: GoalType;
  metric: GoalMetric;
  target_value: number;
  activity_type: string | null; // 'Run' | 'Ride' | 'all' | null
  created_at: string;
}

export interface GoalWithProgress extends DBGoal {
  current_value: number;
  progress_percent: number;
  days_left: number;
}

// Statistics Types
export interface WeeklyStats {
  week_start: string;
  total_distance: number;
  total_time: number;
  total_elevation: number;
  activity_count: number;
  avg_pace: number;
}

export interface ActivityTypeBreakdown {
  type: string;
  count: number;
  distance: number;
  time: number;
  percentage: number;
}

export interface PersonalRecord {
  type: string;
  value: number;
  activity_name: string;
  date: string;
}

// Strava Streams Types
export interface ActivityStream {
  time?: number[];
  distance?: number[];
  latlng?: [number, number][];
  altitude?: number[];
  heartrate?: number[];
  cadence?: number[];
  watts?: number[];
  velocity_smooth?: number[];
  grade_smooth?: number[];
}

// Strava Laps Types
export interface ActivityLap {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  distance: number;
  start_index: number;
  end_index: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  average_watts?: number;
  lap_index: number;
}

// Strava Athlete Stats Types
export interface AthleteStats {
  biggest_ride_distance: number;
  biggest_climb_elevation_gain: number;
  recent_ride_totals: ActivityTotal;
  recent_run_totals: ActivityTotal;
  recent_swim_totals: ActivityTotal;
  ytd_ride_totals: ActivityTotal;
  ytd_run_totals: ActivityTotal;
  ytd_swim_totals: ActivityTotal;
  all_ride_totals: ActivityTotal;
  all_run_totals: ActivityTotal;
  all_swim_totals: ActivityTotal;
}

export interface ActivityTotal {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

// Heart Rate Zones Types
export interface HeartRateZones {
  custom_zones: boolean;
  zones: ZoneRange[];
}

export interface ZoneRange {
  min: number;
  max: number;
}

export interface ActivityZone {
  score?: number;
  distribution_buckets: ZoneBucket[];
  type: 'heartrate' | 'power';
  sensor_based: boolean;
  points?: number;
  custom_zones?: boolean;
  max?: number;
}

export interface ZoneBucket {
  min: number;
  max: number;
  time: number;
}

// Segment Effort Types
export interface SegmentEffort {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  distance: number;
  start_index: number;
  end_index: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  pr_rank?: number | null;
  kom_rank?: number | null;
  achievements: Achievement[];
  segment: Segment;
}

export interface Segment {
  id: number;
  name: string;
  activity_type: string;
  distance: number;
  average_grade: number;
  maximum_grade: number;
  elevation_high: number;
  elevation_low: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  climb_category: number;
  city: string;
  state: string;
  country: string;
  private: boolean;
  starred: boolean;
}

export interface Achievement {
  type_id: number;
  type: string;
  rank: number;
}

// Detailed Activity (full response from Strava)
export interface DetailedStravaActivity extends StravaActivity {
  description?: string;
  calories?: number;
  segment_efforts?: SegmentEffort[];
  splits_metric?: Split[];
  laps?: ActivityLap[];
  gear?: {
    id: string;
    name: string;
    distance: number;
  };
  device_name?: string;
  average_watts?: number;
  max_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  average_cadence?: number;
  average_temp?: number;
  has_heartrate: boolean;
  pr_count: number;
}

export interface Split {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_heartrate?: number;
  pace_zone: number;
}

// ==================== ACHIEVEMENTS ====================

export type AchievementCategory = 'distance' | 'total_distance' | 'streak' | 'elevation' | 'special' | 'milestone' | 'speed';

export interface DBAchievement {
  id: number;
  key: string;
  name: string;
  name_mn: string;
  description?: string;
  description_mn?: string;
  icon: string;
  category: AchievementCategory;
  threshold: number;
  activity_type?: string;
  created_at: string;
}

export interface DBUserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  unlocked_at: string;
  activity_id?: number;
}

export interface AchievementWithStatus extends DBAchievement {
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number; // 0-100
}

// ==================== STREAKS ====================

export type StreakType = 'daily' | 'weekly';

export interface DBUserStreak {
  id: number;
  user_id: number;
  streak_type: StreakType;
  current_count: number;
  best_count: number;
  last_activity_date: string;
  updated_at: string;
}

// ==================== SMART ALERTS ====================

export type AlertType = 'overtraining' | 'recovery' | 'goal_deadline' | 'streak_risk' | 'achievement' | 'weather';
export type AlertPriority = 'low' | 'normal' | 'high';

export interface DBSmartAlert {
  id: number;
  user_id: number;
  alert_type: AlertType;
  title: string;
  message: string;
  priority: AlertPriority;
  is_read: number; // SQLite uses 0/1 for boolean
  action_url?: string;
  created_at: string;
}

export interface SmartAlert extends Omit<DBSmartAlert, 'is_read'> {
  is_read: boolean;
}

// ==================== USER SETTINGS ====================

export type PreferredUnits = 'metric' | 'imperial';
export type Language = 'mn' | 'en';

export interface DBUserSettings {
  user_id: number;
  notifications_enabled: number;
  weekly_report_enabled: number;
  weather_location?: string;
  weather_lat?: number;
  weather_lng?: number;
  preferred_units: PreferredUnits;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface UserSettings extends Omit<DBUserSettings, 'notifications_enabled' | 'weekly_report_enabled'> {
  notifications_enabled: boolean;
  weekly_report_enabled: boolean;
}

// ==================== TRAINING PLANS ====================

export type TrainingPlanStatus = 'active' | 'completed' | 'archived';

export interface DBTrainingPlan {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  duration: number;
  duration_type: 'weeks' | 'days';
  goal_type: string;
  content: string;
  status: TrainingPlanStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TrainingPlanWithProgress extends DBTrainingPlan {
  days_completed: number;
  total_days: number;
  progress_percent: number;
}

// ==================== WEATHER ====================

export interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  visibility: number;
  description: string;
  description_mn: string;
  icon: string;
  main: string; // 'Clear', 'Clouds', 'Rain', etc.
  sunrise: number;
  sunset: number;
}

export interface WeatherRecommendation {
  canWorkoutOutdoor: boolean;
  recommendation: string;
  clothing: string[];
  warnings: string[];
  bestTimeToWorkout?: string;
}

export interface WeatherWithRecommendation extends WeatherData {
  recommendation: WeatherRecommendation;
  location: string;
}
