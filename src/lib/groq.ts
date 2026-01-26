import Groq from 'groq-sdk';
import { DBActivity } from '@/types';
import { formatDistance, formatDuration } from './strava';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Та бол хөгжилтэй, дэмжигч байдалтай фитнесс дасгалжуулагч AI туслах хүн юм.
Та тамирчдад Strava апп дээрхи үйл ажиллагаагаа шинжлэнэ: гүйлт, дугуйлт, бусад спортын талаар зөвлөгөө өгнө.

Хариулт өгөхдөө дараах зүйлсийг анхаарна уу:
- Үйл ажиллагааны үр дүнг бодитой, барагдуулалтгүй шинжлэнэ.
- Тодорхой, хэрэгжүүлэхэд хялбар зөвлөгөө өгнө.
- Амжилтыг магтан, хөгжилд дэвшүүлнэ.
- Дэмжигч, урамшуулсан байдалтай байна.
- Хариулт богино, тодорхой, ашигтай байна.
- Эможи хэрэгтэй газар л хэрэглэнэ.

Хэрэв тамирчин үйл ажиллагааны талаар асуувал:
- Түүнийг бодитой шинжлэнэ.
- Сүүлийн үйл ажиллагааны үндсэн дээр зөвлөгөө өгнө.
- Хөгжилд тусална.
- Хэрэв амжилт гарсан бол магтан, урамшуулна.
`;

export function buildActivityContext(activities: DBActivity[]): string {
  if (activities.length === 0) {
    return 'No recent activities found.';
  }

  const summary = activities.slice(0, 10).map((a, i) => {
    const date = new Date(a.start_date).toLocaleDateString();
    return `${i + 1}. ${a.name} (${a.type}) - ${date}
   Distance: ${formatDistance(a.distance)}, Duration: ${formatDuration(a.moving_time)}, Elevation: ${a.elevation_gain}m`;
  }).join('\n');

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = activities.reduce((sum, a) => sum + a.moving_time, 0);
  const totalActivities = activities.length;

  return `Recent Activities (last ${totalActivities}):
${summary}

Summary Stats:
- Total Distance: ${formatDistance(totalDistance)}
- Total Time: ${formatDuration(totalTime)}
- Activities: ${totalActivities}`;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export async function chat(
  userMessage: string,
  activities: DBActivity[],
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponse> {
  try {
    const activityContext = buildActivityContext(activities);
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Here is the athlete's activity data:\n\n${activityContext}` },
      ...chatHistory.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return { message: responseMessage };
  } catch (error) {
    console.error('Groq API error:', error);
    return { 
      message: '',
      error: error instanceof Error ? error.message : 'Failed to get AI response'
    };
  }
}

export async function getTrainingSuggestions(activities: DBActivity[]): Promise<string> {
  const activityContext = buildActivityContext(activities);
  
  const response = await chat(
    'Based on my recent activities, what training suggestions do you have for me? Please be specific and actionable.',
    activities
  );
  
  return response.message;
}

export async function getWeeklySummary(activities: DBActivity[]): Promise<string> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weekActivities = activities.filter(a => new Date(a.start_date) >= oneWeekAgo);
  
  const response = await chat(
    'Please give me a summary of my training this week. Include total distance, time, and any notable achievements or areas for improvement.',
    weekActivities
  );
  
  return response.message;
}

export async function analyzeActivity(
  activity: DBActivity,
  recentActivities: DBActivity[]
): Promise<string> {
  try {
    const activityDate = new Date(activity.start_date).toLocaleDateString('mn-MN');
    const distance = (activity.distance / 1000).toFixed(2);
    const duration = Math.floor(activity.moving_time / 60);
    const pace = activity.average_speed > 0 
      ? `${Math.floor(1000 / activity.average_speed / 60)}:${Math.round((1000 / activity.average_speed) % 60).toString().padStart(2, '0')} /км`
      : 'Мэдээлэл байхгүй';
    
    const activityTypes: Record<string, string> = {
      Run: 'Гүйлт',
      Ride: 'Дугуй',
      Swim: 'Усанд сэлэлт',
      Walk: 'Алхалт',
      Hike: 'Уулын аялал',
      Workout: 'Дасгал',
    };
    const activityTypeMn = activityTypes[activity.type] || activity.type;
    
    const activityDetails = `
Шинжлэх дасгал:
- Нэр: ${activity.name}
- Төрөл: ${activityTypeMn}
- Огноо: ${activityDate}
- Зай: ${distance} км
- Хугацаа: ${duration} минут
- Дундаж хурд: ${pace}
- Өндөрлөг: ${activity.elevation_gain}м
- Калори: ${activity.calories || 0} kcal
`;

    // Find similar activities for comparison
    const similarActivities = recentActivities
      .filter(a => a.type === activity.type && a.strava_id !== activity.strava_id)
      .slice(0, 5);
    
    let comparisonContext = '';
    if (similarActivities.length > 0) {
      const avgDistance = similarActivities.reduce((sum, a) => sum + a.distance, 0) / similarActivities.length / 1000;
      const avgDuration = similarActivities.reduce((sum, a) => sum + a.moving_time, 0) / similarActivities.length / 60;
      const avgElevation = similarActivities.reduce((sum, a) => sum + a.elevation_gain, 0) / similarActivities.length;
      comparisonContext = `
Сүүлийн ${similarActivities.length} ${activityTypeMn.toLowerCase()}-ийн дундаж:
- Дундаж зай: ${avgDistance.toFixed(2)} км
- Дундаж хугацаа: ${avgDuration.toFixed(0)} минут
- Дундаж өндөрлөг: ${avgElevation.toFixed(0)} м
`;
    }

    const prompt = `${activityDetails}${comparisonContext}

Энэ дасгалыг шинжилж, дараах зүйлсийг МОНГОЛ ХЭЛЭЭР хариулна уу:

1. 📊 Гүйцэтгэлийн үнэлгээ (сүүлийн дасгалуудтай харьцуулахад хэр байв?)
2. ✅ Сайн тал (юу сайн болсон бэ?)
3. 📈 Сайжруулах зүйл (юуг анхаарах хэрэгтэй вэ?)
4. 💡 Дараагийн дасгалд зориулсан зөвлөгөө (нэг тодорхой зөвлөгөө)

Хариултаа товч, тодорхой, урамшуулсан байдлаар бичнэ үү. Эможи хэрэглэж болно.`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: `Та бол мэргэжлийн фитнесс дасгалжуулагч. Тамирчдын дасгалыг шинжилж, тодорхой, хэрэгжүүлэхэд хялбар зөвлөгөө өгнө.

ЧУХАЛ: Бүх хариултаа МОНГОЛ ХЭЛЭЭР бичнэ үү. Англи хэл огт хэрэглэхгүй.

Шинжилгээндээ:
- Өгөгдөлд суурилсан дүгнэлт хийнэ
- Эерэг, урамшуулсан байдалтай байна
- Тодорхой, хэрэгжүүлэхэд хялбар зөвлөгөө өгнө
- Сайжруулах зүйлийг зөөлөн хэлнэ`
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content || 'Дасгалыг шинжлэх боломжгүй байна.';
  } catch (error) {
    console.error('Activity analysis error:', error);
    throw error;
  }
}

export async function generateTrainingPlan(
  activities: DBActivity[],
  goals: Array<{ title: string; metric: string; target_value: number; progress_percent: number }>
): Promise<string> {
  try {
    const activityContext = buildActivityContext(activities);
    
    let goalsContext = 'No specific goals set.';
    if (goals.length > 0) {
      goalsContext = goals.map(g => 
        `- ${g.title}: ${g.progress_percent.toFixed(0)}% complete`
      ).join('\n');
    }

    const prompt = `Based on my recent training history and goals, please create a 7-day training plan.

${activityContext}

Current Goals:
${goalsContext}

Please provide:
1. A day-by-day training schedule for the next 7 days
2. Specific workout details (distance, pace, type)
3. Rest day recommendations
4. Tips for achieving my goals

Format the plan clearly with each day on a new line.`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: 'You are an expert running coach creating personalized training plans. Consider the athlete\'s recent activity patterns, recovery needs, and goals. Provide specific, actionable workouts.'
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate training plan.';
  } catch (error) {
    console.error('Training plan generation error:', error);
    throw error;
  }
}

export async function getGoalAdvice(
  goal: { title: string; metric: string; target_value: number; current_value: number; progress_percent: number; days_left: number },
  activities: DBActivity[]
): Promise<string> {
  try {
    const recentActivities = activities.slice(0, 10);
    const activityContext = buildActivityContext(recentActivities);

    const prompt = `I need advice on achieving my fitness goal.

Goal: ${goal.title}
Target: ${goal.target_value} ${goal.metric}
Current Progress: ${goal.current_value} (${goal.progress_percent.toFixed(0)}%)
Days Remaining: ${goal.days_left}

${activityContext}

Please provide:
1. Assessment of whether this goal is achievable
2. What I need to do daily/weekly to reach it
3. Specific workout recommendations
4. Motivation and encouragement

Keep your response focused and actionable (max 200 words).`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: 'You are an encouraging fitness coach helping athletes achieve their goals. Be realistic but motivating. Provide specific, actionable advice.'
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    return completion.choices[0]?.message?.content || 'Unable to provide goal advice.';
  } catch (error) {
    console.error('Goal advice error:', error);
    throw error;
  }
}

// ==================== NEW AI FEATURES ====================

interface DailyInsightsContext {
  lastWeekDistance: number;
  lastWeekTime: number;
  lastWeekCount: number;
  prevWeekDistance: number;
  prevWeekCount: number;
  daysSinceLastActivity: number | null;
}

export async function generateDailyInsights(
  activities: DBActivity[],
  context: DailyInsightsContext
): Promise<string> {
  try {
    const today = new Date().toLocaleDateString('mn-MN', { weekday: 'long', month: 'long', day: 'numeric' });
    const recentActivities = activities.slice(0, 5);
    
    const activitySummary = recentActivities.map(a => {
      const date = new Date(a.start_date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
      return `- ${date}: ${a.name} (${(a.distance/1000).toFixed(1)}км, ${Math.floor(a.moving_time/60)}мин)`;
    }).join('\n');

    const prompt = `Өнөөдөр: ${today}

Сүүлийн 7 хоногийн статистик:
- Нийт зай: ${context.lastWeekDistance.toFixed(1)} км
- Нийт хугацаа: ${Math.floor(context.lastWeekTime/3600)}ц ${Math.floor((context.lastWeekTime%3600)/60)}м
- Дасгалын тоо: ${context.lastWeekCount}
- Өмнөх 7 хоногтой харьцуулахад: ${context.prevWeekDistance > 0 ? ((context.lastWeekDistance - context.prevWeekDistance) / context.prevWeekDistance * 100).toFixed(0) : 0}%

${context.daysSinceLastActivity !== null ? `Сүүлийн дасгалаас хойш: ${context.daysSinceLastActivity} өдөр` : ''}

Сүүлийн дасгалууд:
${activitySummary}

Дараах зүйлсийг МОНГОЛ ХЭЛЭЭР бичнэ үү:

1. 🎯 Өнөөдрийн зөвлөмж (юу хийх вэ? - 1 өгүүлбэр)
2. 📊 Долоо хоногийн дүгнэлт (1-2 өгүүлбэр)
3. ⚡ Анхааруулга/Урамшуулал (шаардлагатай бол)

Хариултаа товч, тодорхой бичнэ үү (100 үгээс бага).`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: `Та бол фитнесс дасгалжуулагч AI. Тамирчинд өдөр бүрийн зөвлөмж өгнө.

ЧУХАЛ:
- Бүх хариултаа МОНГОЛ ХЭЛЭЭР бичнэ
- Товч, тодорхой байх
- Эерэг, урамшуулсан өнгө аястай байх
- Хэрэв олон өдөр амарсан бол зөөлөн сануулах
- Хэрэв хэт их дасгал хийсэн бол амрахыг зөвлөх`
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'Зөвлөмж үүсгэх боломжгүй байна.';
  } catch (error) {
    console.error('Daily insights error:', error);
    throw error;
  }
}

// Training Load Analysis
export async function analyzeTrainingLoad(
  activities: DBActivity[]
): Promise<{ analysis: string; atl: number; ctl: number; tsb: number; status: string }> {
  try {
    const now = new Date();
    
    // Calculate ATL (Acute Training Load) - last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const atlActivities = activities.filter(a => new Date(a.start_date) >= sevenDaysAgo);
    const atl = atlActivities.reduce((sum, a) => sum + (a.distance / 1000) * (a.moving_time / 3600), 0) / 7;
    
    // Calculate CTL (Chronic Training Load) - last 28 days
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const ctlActivities = activities.filter(a => new Date(a.start_date) >= twentyEightDaysAgo);
    const ctl = ctlActivities.reduce((sum, a) => sum + (a.distance / 1000) * (a.moving_time / 3600), 0) / 28;
    
    // TSB (Training Stress Balance) = CTL - ATL
    const tsb = ctl - atl;
    
    // Determine status
    let status: string;
    if (tsb > 10) status = 'fresh'; // Сэргэсэн
    else if (tsb > 0) status = 'optimal'; // Хамгийн тохиромжтой
    else if (tsb > -10) status = 'tired'; // Ядарсан
    else status = 'overreached'; // Хэт ачаалалтай

    const prompt = `Дасгалын ачааллын шинжилгээ:

ATL (7 хоногийн ачаалал): ${atl.toFixed(1)}
CTL (28 хоногийн ачаалал): ${ctl.toFixed(1)}
TSB (Тэнцвэр): ${tsb.toFixed(1)}
Төлөв: ${status === 'fresh' ? 'Сэргэсэн' : status === 'optimal' ? 'Тохиромжтой' : status === 'tired' ? 'Ядарсан' : 'Хэт ачаалалтай'}

Сүүлийн 7 хоногт: ${atlActivities.length} дасгал, ${(atlActivities.reduce((s,a)=>s+a.distance,0)/1000).toFixed(1)}км
Сүүлийн 28 хоногт: ${ctlActivities.length} дасгал, ${(ctlActivities.reduce((s,a)=>s+a.distance,0)/1000).toFixed(1)}км

МОНГОЛ ХЭЛЭЭР дараах зүйлсийг бичнэ үү:
1. Одоогийн ачааллын түвшний тайлбар
2. Дараагийн 3-5 өдрийн зөвлөмж
3. Анхааруулга (хэрэгтэй бол)

Товч бичнэ үү (80 үгээс бага).`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: 'Та бол спортын шинжлэх ухааны мэргэжилтэн. Дасгалын ачааллыг шинжилж, overtraining-ээс урьдчилан сэргийлэх зөвлөмж өгнө. МОНГОЛ ХЭЛЭЭР хариулна.'
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 250,
    });

    return {
      analysis: completion.choices[0]?.message?.content || '',
      atl: Math.round(atl * 10) / 10,
      ctl: Math.round(ctl * 10) / 10,
      tsb: Math.round(tsb * 10) / 10,
      status,
    };
  } catch (error) {
    console.error('Training load analysis error:', error);
    throw error;
  }
}

// Workout Classification
export type WorkoutType = 'recovery' | 'easy' | 'long' | 'tempo' | 'interval' | 'race';

export function classifyWorkout(activity: DBActivity, recentActivities: DBActivity[]): WorkoutType {
  const distance = activity.distance / 1000; // km
  const duration = activity.moving_time / 60; // minutes
  const pace = duration / distance; // min/km
  
  // Get average stats for comparison
  const sameTypeActivities = recentActivities.filter(a => a.type === activity.type);
  const avgDistance = sameTypeActivities.length > 0 
    ? sameTypeActivities.reduce((s, a) => s + a.distance, 0) / sameTypeActivities.length / 1000
    : distance;
  const avgPace = sameTypeActivities.length > 0
    ? sameTypeActivities.reduce((s, a) => s + (a.moving_time / 60) / (a.distance / 1000), 0) / sameTypeActivities.length
    : pace;

  // Classification logic
  if (pace > avgPace * 1.15 || duration < 25) {
    return 'recovery'; // Slow pace or short duration
  }
  if (distance > avgDistance * 1.4 && pace > avgPace * 0.95) {
    return 'long'; // Long run, easy pace
  }
  if (pace < avgPace * 0.9 && distance < avgDistance * 0.7) {
    return 'interval'; // Fast pace, shorter distance
  }
  if (pace < avgPace * 0.95 && distance >= avgDistance * 0.8) {
    return 'tempo'; // Fast pace, normal distance
  }
  if (pace < avgPace * 0.85) {
    return 'race'; // Very fast pace
  }
  return 'easy'; // Default
}

export function getWorkoutTypeInfo(type: WorkoutType): { name: string; nameMn: string; color: string; description: string } {
  const types: Record<WorkoutType, { name: string; nameMn: string; color: string; description: string }> = {
    recovery: { name: 'Recovery', nameMn: 'Сэргээлт', color: 'bg-blue-500', description: 'Хөнгөн, сэргээх зорилготой' },
    easy: { name: 'Easy', nameMn: 'Хөнгөн', color: 'bg-green-500', description: 'Суурь тэсвэр бэхжүүлэх' },
    long: { name: 'Long Run', nameMn: 'Урт гүйлт', color: 'bg-purple-500', description: 'Тэсвэр, аэроб хүчин чадал' },
    tempo: { name: 'Tempo', nameMn: 'Темп', color: 'bg-yellow-500', description: 'Босго хурд сайжруулах' },
    interval: { name: 'Interval', nameMn: 'Интервал', color: 'bg-orange-500', description: 'Хурд, VO2max сайжруулах' },
    race: { name: 'Race', nameMn: 'Уралдаан', color: 'bg-red-500', description: 'Бүх хүчээ дайчилсан' },
  };
  return types[type];
}

// Recovery Score
export async function calculateRecoveryScore(
  activities: DBActivity[]
): Promise<{ score: number; status: string; recommendation: string }> {
  try {
    const now = new Date();
    
    // Last 3 days activities
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => new Date(a.start_date) >= threeDaysAgo);
    
    // Calculate load
    const recentLoad = recentActivities.reduce((sum, a) => {
      const intensity = (a.distance / 1000) * (a.moving_time / 3600);
      return sum + intensity;
    }, 0);
    
    // Days since last activity
    const lastActivity = activities[0];
    const daysSinceLastActivity = lastActivity 
      ? Math.floor((now.getTime() - new Date(lastActivity.start_date).getTime()) / (24 * 60 * 60 * 1000))
      : 7;
    
    // Calculate base score
    let score = 100;
    
    // Reduce score based on recent load
    score -= recentLoad * 5;
    
    // Increase score based on rest days
    score += daysSinceLastActivity * 10;
    
    // Clamp score
    score = Math.max(0, Math.min(100, score));
    
    // Determine status
    let status: string;
    let recommendation: string;
    
    if (score >= 80) {
      status = 'excellent';
      recommendation = 'Бүрэн сэргэсэн! Хүнд дасгал хийх боломжтой.';
    } else if (score >= 60) {
      status = 'good';
      recommendation = 'Сайн сэргэсэн. Дунд зэргийн ачаалалтай дасгал тохиромжтой.';
    } else if (score >= 40) {
      status = 'moderate';
      recommendation = 'Дунд зэргийн сэргэлт. Хөнгөн дасгал эсвэл амралт зөвлөж байна.';
    } else {
      status = 'low';
      recommendation = 'Ядарсан байна. Амрах эсвэл маш хөнгөн дасгал хийхийг зөвлөж байна.';
    }

    return { score: Math.round(score), status, recommendation };
  } catch (error) {
    console.error('Recovery score error:', error);
    return { score: 50, status: 'moderate', recommendation: 'Тооцоолох боломжгүй байна.' };
  }
}

// Smart Goal Suggestions
export async function suggestGoals(activities: DBActivity[]): Promise<string> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => new Date(a.start_date) >= thirtyDaysAgo);
    
    // Calculate current stats
    const totalDistance = recentActivities.reduce((s, a) => s + a.distance, 0) / 1000;
    const totalTime = recentActivities.reduce((s, a) => s + a.moving_time, 0);
    const avgDistance = recentActivities.length > 0 ? totalDistance / recentActivities.length : 0;
    const avgPace = recentActivities.length > 0
      ? recentActivities.reduce((s, a) => s + (a.moving_time / 60) / (a.distance / 1000), 0) / recentActivities.length
      : 0;
    
    // Find best performances
    const longestRun = recentActivities.reduce((max, a) => a.distance > max.distance ? a : max, recentActivities[0] || { distance: 0 });
    const fastestPace = recentActivities.reduce((min, a) => {
      const pace = (a.moving_time / 60) / (a.distance / 1000);
      const minPace = (min.moving_time / 60) / (min.distance / 1000);
      return pace < minPace ? a : min;
    }, recentActivities[0] || { moving_time: 0, distance: 1 });

    const prompt = `Сүүлийн 30 хоногийн статистик:
- Нийт дасгал: ${recentActivities.length}
- Нийт зай: ${totalDistance.toFixed(1)} км
- Нийт хугацаа: ${Math.floor(totalTime/3600)}ц ${Math.floor((totalTime%3600)/60)}м
- Дундаж зай: ${avgDistance.toFixed(1)} км/дасгал
- Дундаж хурд: ${avgPace.toFixed(1)} мин/км
- Хамгийн урт: ${(longestRun?.distance/1000 || 0).toFixed(1)} км
- Хамгийн хурдан: ${avgPace > 0 ? ((fastestPace?.moving_time/60) / (fastestPace?.distance/1000)).toFixed(1) : 0} мин/км

Энэ өгөгдөлд үндэслэн 3-4 БОДИТ зорилго санал болгоно уу. МОНГОЛ ХЭЛЭЭР бичнэ үү.

Зорилго бүрт:
- 🎯 Зорилго (тодорхой тоотой)
- 📅 Хугацаа (долоо хоног/сар)
- 💪 Яагаад бодитой гэж үзэж байгаа

Жишээ: "Долоо хоногт 30км гүйх" эсвэл "5км-ийг 25 минутад гүйх"`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: `Та бол туршлагатай гүйлтийн дасгалжуулагч. Тамирчны одоогийн түвшинд тохирсон БОДИТ, ХҮРЧ БОЛОХУЙЦ зорилго санал болгоно.

ЧУХАЛ:
- МОНГОЛ ХЭЛЭЭР бичнэ
- Зорилго хэт хялбар ч, хэт хэцүү ч байж болохгүй
- Одоогийн түвшингээс 10-20% өсөлттэй байх
- Тодорхой тоо, хугацаатай байх`
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'Зорилго санал болгох боломжгүй байна.';
  } catch (error) {
    console.error('Suggest goals error:', error);
    throw error;
  }
}
