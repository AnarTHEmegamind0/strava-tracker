import Database from 'better-sqlite3';
import path from 'path';
import { 
  DBUser, 
  DBActivity, 
  DBChatMessage, 
  DBGoal, 
  DBAchievement,
  DBUserAchievement,
  DBUserStreak,
  DBSmartAlert,
  DBUserSettings,
  DBTrainingPlan,
  TrainingPlanWithProgress,
  AchievementWithStatus,
  SmartAlert,
  UserSettings,
  StreakType,
  AlertType,
  AlertPriority,
  TrainingPlanStatus,
} from '@/types';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strava_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    firstname TEXT,
    lastname TEXT,
    profile_url TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    strava_id INTEGER UNIQUE NOT NULL,
    name TEXT,
    type TEXT,
    start_date DATETIME,
    distance REAL,
    moving_time INTEGER,
    elevation_gain REAL,
    average_speed REAL,
    calories INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    metric TEXT NOT NULL,
    target_value REAL NOT NULL,
    activity_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

  CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Achievement definitions (all available badges)
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_mn TEXT NOT NULL,
    description TEXT,
    description_mn TEXT,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    threshold REAL,
    activity_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- User's unlocked achievements
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    activity_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
  );

  -- User streaks tracking
  CREATE TABLE IF NOT EXISTS user_streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    streak_type TEXT NOT NULL,
    current_count INTEGER DEFAULT 0,
    best_count INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, streak_type)
  );

  -- User settings & preferences
  CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY,
    notifications_enabled INTEGER DEFAULT 1,
    weekly_report_enabled INTEGER DEFAULT 1,
    weather_location TEXT,
    weather_lat REAL,
    weather_lng REAL,
    preferred_units TEXT DEFAULT 'metric',
    language TEXT DEFAULT 'mn',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Smart alerts
  CREATE TABLE IF NOT EXISTS smart_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    is_read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
  CREATE INDEX IF NOT EXISTS idx_smart_alerts_user ON smart_alerts(user_id, is_read);
  CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);

  -- Training plans
  CREATE TABLE IF NOT EXISTS training_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    duration_type TEXT NOT NULL DEFAULT 'days',
    goal_type TEXT NOT NULL DEFAULT 'general',
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_training_plans_user ON training_plans(user_id, status);
`);

// User operations
export function upsertUser(user: Omit<DBUser, 'id' | 'created_at' | 'updated_at'>): DBUser {
  const stmt = db.prepare(`
    INSERT INTO users (strava_id, username, firstname, lastname, profile_url, access_token, refresh_token, token_expires_at)
    VALUES (@strava_id, @username, @firstname, @lastname, @profile_url, @access_token, @refresh_token, @token_expires_at)
    ON CONFLICT(strava_id) DO UPDATE SET
      username = @username,
      firstname = @firstname,
      lastname = @lastname,
      profile_url = @profile_url,
      access_token = @access_token,
      refresh_token = @refresh_token,
      token_expires_at = @token_expires_at,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `);
  return stmt.get(user) as DBUser;
}

export function getUserByStravaId(stravaId: number): DBUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE strava_id = ?');
  return stmt.get(stravaId) as DBUser | undefined;
}

export function getUserById(id: number): DBUser | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as DBUser | undefined;
}

export function updateUserTokens(stravaId: number, accessToken: string, refreshToken: string, expiresAt: number): void {
  const stmt = db.prepare(`
    UPDATE users 
    SET access_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE strava_id = ?
  `);
  stmt.run(accessToken, refreshToken, expiresAt, stravaId);
}

// Activity operations
export function upsertActivity(activity: Omit<DBActivity, 'id' | 'created_at'>): void {
  const stmt = db.prepare(`
    INSERT INTO activities (user_id, strava_id, name, type, start_date, distance, moving_time, elevation_gain, average_speed, calories)
    VALUES (@user_id, @strava_id, @name, @type, @start_date, @distance, @moving_time, @elevation_gain, @average_speed, @calories)
    ON CONFLICT(strava_id) DO UPDATE SET
      name = @name,
      type = @type,
      distance = @distance,
      moving_time = @moving_time,
      elevation_gain = @elevation_gain,
      average_speed = @average_speed,
      calories = @calories
  `);
  stmt.run(activity);
}

export function getActivitiesByUserId(userId: number, limit = 50): DBActivity[] {
  const stmt = db.prepare('SELECT * FROM activities WHERE user_id = ? ORDER BY start_date DESC LIMIT ?');
  return stmt.all(userId, limit) as DBActivity[];
}

export function getActivityByStravaId(stravaId: number): DBActivity | undefined {
  const stmt = db.prepare('SELECT * FROM activities WHERE strava_id = ?');
  return stmt.get(stravaId) as DBActivity | undefined;
}

// Chat operations
export function saveChatMessage(userId: number, role: 'user' | 'assistant', content: string): void {
  const stmt = db.prepare('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)');
  stmt.run(userId, role, content);
}

export function getChatHistory(userId: number, limit = 20): DBChatMessage[] {
  const stmt = db.prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(userId, limit) as DBChatMessage[];
}

export function clearChatHistory(userId: number): void {
  const stmt = db.prepare('DELETE FROM chat_messages WHERE user_id = ?');
  stmt.run(userId);
}

// Goal operations
export function createGoal(goal: Omit<DBGoal, 'id' | 'created_at'>): DBGoal {
  const stmt = db.prepare(`
    INSERT INTO goals (user_id, title, type, metric, target_value, activity_type)
    VALUES (@user_id, @title, @type, @metric, @target_value, @activity_type)
    RETURNING *
  `);
  return stmt.get(goal) as DBGoal;
}

export function getGoalsByUserId(userId: number): DBGoal[] {
  const stmt = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as DBGoal[];
}

export function getGoalById(id: number): DBGoal | undefined {
  const stmt = db.prepare('SELECT * FROM goals WHERE id = ?');
  return stmt.get(id) as DBGoal | undefined;
}

export function updateGoal(id: number, updates: Partial<Omit<DBGoal, 'id' | 'user_id' | 'created_at'>>): DBGoal | undefined {
  const goal = getGoalById(id);
  if (!goal) return undefined;

  const updatedGoal = { ...goal, ...updates };
  const stmt = db.prepare(`
    UPDATE goals 
    SET title = @title, type = @type, metric = @metric, target_value = @target_value, activity_type = @activity_type
    WHERE id = @id
    RETURNING *
  `);
  return stmt.get(updatedGoal) as DBGoal;
}

export function deleteGoal(id: number): boolean {
  const stmt = db.prepare('DELETE FROM goals WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// Activity queries for statistics
export function getActivitiesByDateRange(userId: number, startDate: string, endDate: string): DBActivity[] {
  const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE user_id = ? AND start_date >= ? AND start_date <= ?
    ORDER BY start_date DESC
  `);
  return stmt.all(userId, startDate, endDate) as DBActivity[];
}

export function getActivitiesByType(userId: number, type: string, limit = 50): DBActivity[] {
  const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE user_id = ? AND type = ?
    ORDER BY start_date DESC
    LIMIT ?
  `);
  return stmt.all(userId, type, limit) as DBActivity[];
}

export function getAllActivityTypes(userId: number): string[] {
  const stmt = db.prepare('SELECT DISTINCT type FROM activities WHERE user_id = ?');
  const results = stmt.all(userId) as { type: string }[];
  return results.map(r => r.type);
}

// App Settings operations
export function getSetting(key: string): string | undefined {
  const stmt = db.prepare('SELECT value FROM app_settings WHERE key = ?');
  const result = stmt.get(key) as { value: string } | undefined;
  return result?.value;
}

export function setSetting(key: string, value: string): void {
  const stmt = db.prepare(`
    INSERT INTO app_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = ?,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(key, value, value);
}

export function deleteSetting(key: string): void {
  const stmt = db.prepare('DELETE FROM app_settings WHERE key = ?');
  stmt.run(key);
}

export function getStravaCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = getSetting('strava_client_id');
  const clientSecret = getSetting('strava_client_secret');
  
  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }
  return null;
}

export function setStravaCredentials(clientId: string, clientSecret: string): void {
  setSetting('strava_client_id', clientId);
  setSetting('strava_client_secret', clientSecret);
}

export function hasStravaCredentials(): boolean {
  return getStravaCredentials() !== null;
}

export function clearStravaCredentials(): void {
  deleteSetting('strava_client_id');
  deleteSetting('strava_client_secret');
}

// ==================== ACHIEVEMENTS ====================

export function getAllAchievements(): DBAchievement[] {
  const stmt = db.prepare('SELECT * FROM achievements ORDER BY category, threshold');
  return stmt.all() as DBAchievement[];
}

export function getAchievementByKey(key: string): DBAchievement | undefined {
  const stmt = db.prepare('SELECT * FROM achievements WHERE key = ?');
  return stmt.get(key) as DBAchievement | undefined;
}

export function insertAchievement(achievement: Omit<DBAchievement, 'id' | 'created_at'>): DBAchievement {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO achievements (key, name, name_mn, description, description_mn, icon, category, threshold, activity_type)
    VALUES (@key, @name, @name_mn, @description, @description_mn, @icon, @category, @threshold, @activity_type)
  `);
  stmt.run(achievement);
  return getAchievementByKey(achievement.key) as DBAchievement;
}

export function getUserAchievements(userId: number): DBUserAchievement[] {
  const stmt = db.prepare('SELECT * FROM user_achievements WHERE user_id = ?');
  return stmt.all(userId) as DBUserAchievement[];
}

export function getAchievementsWithStatus(userId: number): AchievementWithStatus[] {
  const stmt = db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    ORDER BY a.category, a.threshold
  `);
  const results = stmt.all(userId) as (DBAchievement & { unlocked_at: string | null })[];
  return results.map(r => ({
    ...r,
    unlocked: r.unlocked_at !== null,
    unlocked_at: r.unlocked_at || undefined,
  }));
}

export function unlockAchievement(userId: number, achievementId: number, activityId?: number): boolean {
  try {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, activity_id)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(userId, achievementId, activityId || null);
    return result.changes > 0;
  } catch {
    return false;
  }
}

export function hasAchievement(userId: number, achievementKey: string): boolean {
  const stmt = db.prepare(`
    SELECT 1 FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND a.key = ?
  `);
  return stmt.get(userId, achievementKey) !== undefined;
}

// ==================== STREAKS ====================

export function getUserStreaks(userId: number): DBUserStreak[] {
  const stmt = db.prepare('SELECT * FROM user_streaks WHERE user_id = ?');
  return stmt.all(userId) as DBUserStreak[];
}

export function getUserStreak(userId: number, streakType: StreakType): DBUserStreak | undefined {
  const stmt = db.prepare('SELECT * FROM user_streaks WHERE user_id = ? AND streak_type = ?');
  return stmt.get(userId, streakType) as DBUserStreak | undefined;
}

export function upsertUserStreak(userId: number, streakType: StreakType, currentCount: number, bestCount: number, lastActivityDate: string): void {
  const stmt = db.prepare(`
    INSERT INTO user_streaks (user_id, streak_type, current_count, best_count, last_activity_date)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, streak_type) DO UPDATE SET
      current_count = ?,
      best_count = MAX(best_count, ?),
      last_activity_date = ?,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(userId, streakType, currentCount, bestCount, lastActivityDate, currentCount, bestCount, lastActivityDate);
}

// ==================== SMART ALERTS ====================

export function createAlert(alert: Omit<DBSmartAlert, 'id' | 'is_read' | 'created_at'>): DBSmartAlert {
  const stmt = db.prepare(`
    INSERT INTO smart_alerts (user_id, alert_type, title, message, priority, action_url)
    VALUES (@user_id, @alert_type, @title, @message, @priority, @action_url)
    RETURNING *
  `);
  return stmt.get(alert) as DBSmartAlert;
}

export function getUserAlerts(userId: number, limit = 20, unreadOnly = false): SmartAlert[] {
  const whereClause = unreadOnly ? 'AND is_read = 0' : '';
  const stmt = db.prepare(`
    SELECT * FROM smart_alerts 
    WHERE user_id = ? ${whereClause}
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  const results = stmt.all(userId, limit) as DBSmartAlert[];
  return results.map(r => ({ ...r, is_read: r.is_read === 1 }));
}

export function getUnreadAlertCount(userId: number): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM smart_alerts WHERE user_id = ? AND is_read = 0');
  const result = stmt.get(userId) as { count: number };
  return result.count;
}

export function markAlertAsRead(alertId: number): boolean {
  const stmt = db.prepare('UPDATE smart_alerts SET is_read = 1 WHERE id = ?');
  const result = stmt.run(alertId);
  return result.changes > 0;
}

export function markAllAlertsAsRead(userId: number): number {
  const stmt = db.prepare('UPDATE smart_alerts SET is_read = 1 WHERE user_id = ? AND is_read = 0');
  const result = stmt.run(userId);
  return result.changes;
}

export function deleteAlert(alertId: number): boolean {
  const stmt = db.prepare('DELETE FROM smart_alerts WHERE id = ?');
  const result = stmt.run(alertId);
  return result.changes > 0;
}

// ==================== USER SETTINGS ====================

export function getUserSettings(userId: number): UserSettings | undefined {
  const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?');
  const result = stmt.get(userId) as DBUserSettings | undefined;
  if (!result) return undefined;
  return {
    ...result,
    notifications_enabled: result.notifications_enabled === 1,
    weekly_report_enabled: result.weekly_report_enabled === 1,
  };
}

export function upsertUserSettings(settings: Partial<DBUserSettings> & { user_id: number }): UserSettings {
  const existing = getUserSettings(settings.user_id);
  const merged = {
    user_id: settings.user_id,
    notifications_enabled: settings.notifications_enabled ?? existing?.notifications_enabled ?? true,
    weekly_report_enabled: settings.weekly_report_enabled ?? existing?.weekly_report_enabled ?? true,
    weather_location: settings.weather_location ?? existing?.weather_location ?? null,
    weather_lat: settings.weather_lat ?? existing?.weather_lat ?? null,
    weather_lng: settings.weather_lng ?? existing?.weather_lng ?? null,
    preferred_units: settings.preferred_units ?? existing?.preferred_units ?? 'metric',
    language: settings.language ?? existing?.language ?? 'mn',
  };
  
  const stmt = db.prepare(`
    INSERT INTO user_settings (user_id, notifications_enabled, weekly_report_enabled, weather_location, weather_lat, weather_lng, preferred_units, language)
    VALUES (@user_id, @notifications_enabled, @weekly_report_enabled, @weather_location, @weather_lat, @weather_lng, @preferred_units, @language)
    ON CONFLICT(user_id) DO UPDATE SET
      notifications_enabled = @notifications_enabled,
      weekly_report_enabled = @weekly_report_enabled,
      weather_location = @weather_location,
      weather_lat = @weather_lat,
      weather_lng = @weather_lng,
      preferred_units = @preferred_units,
      language = @language,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run({
    ...merged,
    notifications_enabled: merged.notifications_enabled ? 1 : 0,
    weekly_report_enabled: merged.weekly_report_enabled ? 1 : 0,
  });
  return getUserSettings(settings.user_id) as UserSettings;
}

// ==================== TRAINING PLANS ====================

export function createTrainingPlan(plan: Omit<DBTrainingPlan, 'id' | 'created_at' | 'updated_at'>): DBTrainingPlan {
  const stmt = db.prepare(`
    INSERT INTO training_plans (user_id, title, description, duration, duration_type, goal_type, content, status, start_date, end_date)
    VALUES (@user_id, @title, @description, @duration, @duration_type, @goal_type, @content, @status, @start_date, @end_date)
    RETURNING *
  `);
  return stmt.get(plan) as DBTrainingPlan;
}

export function getTrainingPlansByUserId(userId: number, status?: TrainingPlanStatus): DBTrainingPlan[] {
  if (status) {
    const stmt = db.prepare('SELECT * FROM training_plans WHERE user_id = ? AND status = ? ORDER BY created_at DESC');
    return stmt.all(userId, status) as DBTrainingPlan[];
  }
  const stmt = db.prepare('SELECT * FROM training_plans WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as DBTrainingPlan[];
}

export function getTrainingPlanById(id: number): DBTrainingPlan | undefined {
  const stmt = db.prepare('SELECT * FROM training_plans WHERE id = ?');
  return stmt.get(id) as DBTrainingPlan | undefined;
}

export function updateTrainingPlan(id: number, updates: Partial<Omit<DBTrainingPlan, 'id' | 'user_id' | 'created_at'>>): DBTrainingPlan | undefined {
  const plan = getTrainingPlanById(id);
  if (!plan) return undefined;

  const updatedPlan = { ...plan, ...updates, updated_at: new Date().toISOString() };
  const stmt = db.prepare(`
    UPDATE training_plans 
    SET title = @title, description = @description, duration = @duration, duration_type = @duration_type, 
        goal_type = @goal_type, content = @content, status = @status, start_date = @start_date, 
        end_date = @end_date, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
    RETURNING *
  `);
  return stmt.get(updatedPlan) as DBTrainingPlan;
}

export function updateTrainingPlanStatus(id: number, status: TrainingPlanStatus): boolean {
  const stmt = db.prepare('UPDATE training_plans SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const result = stmt.run(status, id);
  return result.changes > 0;
}

export function startTrainingPlan(id: number): DBTrainingPlan | undefined {
  const plan = getTrainingPlanById(id);
  if (!plan) return undefined;

  const startDate = new Date().toISOString().split('T')[0];
  const totalDays = plan.duration_type === 'weeks' ? plan.duration * 7 : plan.duration;
  const endDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const stmt = db.prepare(`
    UPDATE training_plans 
    SET status = 'active', start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `);
  return stmt.get(startDate, endDate, id) as DBTrainingPlan;
}

export function deleteTrainingPlan(id: number): boolean {
  const stmt = db.prepare('DELETE FROM training_plans WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getTrainingPlanWithProgress(id: number): TrainingPlanWithProgress | undefined {
  const plan = getTrainingPlanById(id);
  if (!plan) return undefined;

  const totalDays = plan.duration_type === 'weeks' ? plan.duration * 7 : plan.duration;
  let daysCompleted = 0;

  if (plan.start_date) {
    const startDate = new Date(plan.start_date);
    const now = new Date();
    daysCompleted = Math.min(totalDays, Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
  }

  return {
    ...plan,
    days_completed: Math.max(0, daysCompleted),
    total_days: totalDays,
    progress_percent: totalDays > 0 ? Math.min(100, (daysCompleted / totalDays) * 100) : 0,
  };
}

export default db;
