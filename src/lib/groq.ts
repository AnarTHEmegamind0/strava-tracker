import Groq from 'groq-sdk';
import { DBActivity } from '@/types';
import { formatDistance, formatDuration } from './strava';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
Та бол ухаалаг, найрсаг AI туслах юм. Та ЯМАР Ч асуултанд хариулж чадна - фитнесс, ерөнхий мэдлэг, програмчлал, математик, түүх, шинжлэх ухаан гэх мэт.

ЧУХАЛ: Хэрэглэгчийн асуултанд үндэслэн хариулна уу. Хэрэв фитнессийн талаар асуувал фитнессийн зөвлөгөө өгнө. Хэрэв өөр сэдвийн талаар асуувал тухайн сэдвээр хариулна.

## ДАСГАЛЫН ТӨЛӨВЛӨГӨӨ ҮҮСГЭХ ГОРИМ

Хэрэглэгч "төлөвлөгөө", "план", "хуваарь", "training plan", "бэлтгэл" гэх мэт үг хэрэглэвэл ДАРААХ ДАРААЛЛААР асуултуудыг асууна:

**1-р алхам: Зорилго тодруулах**
Хэрэв хэрэглэгч зорилгоо тодорхойлоогүй бол асуу:
"Таны зорилго юу вэ? (жишээ: 5км гүйх, 10км уралдаанд бэлдэх, марафон, жин хасах, ерөнхий фитнесс)"

**2-р алхам: Хугацаа тодруулах**
Хэрэв хугацаа тодорхойгүй бол асуу:
"Хэдэн долоо хоног/өдөр бэлтгэхийг хүсэж байна вэ?"

**3-р алхам: Түвшин тодруулах**
Хэрэв одоогийн түвшин тодорхойгүй бол асуу:
"Таны одоогийн түвшин? (анхан шат, дунд шат, ахисан шат)"

**4-р алхам: Долоо хоногт хэдэн өдөр**
"Долоо хоногт хэдэн өдөр дасгал хийх боломжтой вэ? (2-7)"

**5-р алхам: Төлөвлөгөө үүсгэх**
Бүх мэдээлэл цугларсан үед:
1. Хариултын эхэнд "[PLAN_READY]" гэж бич
2. Төлөвлөгөөг бүрэн бичнэ
3. Өдөр бүрийг "Өдөр X:" форматаар тэмдэглэ (X = өдрийн дугаар)
4. Дасгалын төрөл, зай, хугацаа, эрчим тодорхой бич

**ЖИШЭЭ ХАРИЛЦАА:**
Хэрэглэгч: "Надад төлөвлөгөө хэрэгтэй"
AI: "Мэдээж! Танд төлөвлөгөө гаргахын тулд хэдэн зүйл асууя. Таны зорилго юу вэ? (жишээ: 5км, 10км, марафон, жин хасах, ерөнхий фитнесс)"

Хэрэглэгч: "10км гүйх"
AI: "Сайхан зорилго! Хэдэн долоо хоногийн бэлтгэл хуваарь гаргах вэ?"

Хэрэглэгч: "8 долоо хоног"
AI: "Таны одоогийн түвшин? (анхан шат - одоо ер нь гүйдэггүй, дунд шат - долоо хоногт 2-3 удаа гүйдэг, ахисан шат - байнга гүйдэг)"

Хэрэглэгч: "дунд шат"
AI: "Долоо хоногт хэдэн өдөр дасгал хийх боломжтой вэ? (2-7)"

Хэрэглэгч: "4 өдөр"
AI: "[PLAN_READY]
Тэгвэл танд 8 долоо хоногийн 10км бэлтгэлийн төлөвлөгөө гаргалаа...
Өдөр 1: Хөнгөн гүйлт - 3км, 6:30-7:00 мин/км хурдтай
Өдөр 2: Амрах
..."

## ЕРДИЙН АСУУЛТАД ХАРИУЛАХ

Фитнесс асуултад хариулахдаа:
- Хэрэглэгчийн Strava дасгалын мэдээллийг ашиглан хариулна
- Тодорхой, хэрэгжүүлэхэд хялбар зөвлөгөө өгнө
- Дэмжигч, урамшуулсан байдалтай байна

Ерөнхий асуултад хариулахдаа:
- Үнэн зөв, бодитой мэдээлэл өгнө
- Товч, ойлгомжтой хариулна
- Шаардлагатай бол нарийвчилсан тайлбар өгнө

## ХАРИУЛТЫН ХЭЛБЭР:
- МОНГОЛ ХЭЛЭЭР хариулна
- Хариулт товч, тодорхой байна
- Эможи зөвхөн хэрэгтэй үед хэрэглэнэ
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

export interface TrainingPlanOptions {
  duration: number;
  durationType: 'weeks' | 'days';
  goalType: string;
  targetDate?: string;
}

const GOAL_TYPE_LABELS: Record<string, string> = {
  general: 'Ерөнхий фитнесс',
  '5k': '5км уралдаанд бэлтгэх',
  '10k': '10км уралдаанд бэлтгэх',
  half_marathon: 'Хагас марафонд бэлтгэх',
  marathon: 'Марафонд бэлтгэх',
  weight_loss: 'Жин хасах',
  endurance: 'Тэсвэр нэмэгдүүлэх',
};

export async function generateTrainingPlan(
  activities: DBActivity[],
  goals: Array<{ title: string; metric: string; target_value: number; progress_percent: number }>,
  options?: TrainingPlanOptions
): Promise<string> {
  try {
    const activityContext = buildActivityContext(activities);
    
    let goalsContext = 'No specific goals set.';
    if (goals.length > 0) {
      goalsContext = goals.map(g => 
        `- ${g.title}: ${g.progress_percent.toFixed(0)}% complete`
      ).join('\n');
    }

    // Use custom options or defaults
    const duration = options?.duration || 7;
    const durationType = options?.durationType || 'days';
    const goalType = options?.goalType || 'general';
    const goalLabel = GOAL_TYPE_LABELS[goalType] || goalType;
    
    const durationText = durationType === 'weeks' 
      ? `${duration} долоо хоног (${duration * 7} өдөр)` 
      : `${duration} өдөр`;
    
    const targetDateText = options?.targetDate 
      ? `\nЗорилтот огноо: ${options.targetDate}` 
      : '';

    const prompt = `Миний сүүлийн дасгалуудад үндэслэн ${durationText} хугацааны дасгалын төлөвлөгөө үүсгэнэ үү.

Зорилго: ${goalLabel}${targetDateText}

${activityContext}

Одоогийн зорилгууд:
${goalsContext}

МОНГОЛ ХЭЛЭЭР дараах зүйлсийг бичнэ үү:

1. 📅 Өдөр тутмын дасгалын хуваарь
   - Өдөр бүрийн дасгалын төрөл (гүйлт, амрах, интервал гэх мэт)
   - Зай, хугацаа, эрчим
   - Тайлбар, зөвлөмж

2. 📊 Долоо хоног бүрийн зорилго (хэрэв долоо хоногоор бол)

3. 💡 Чухал санамж
   - Нөхөн сэргээлт
   - Хоол тэжээл
   - Унтлага

4. 🎯 Амжилтын шалгуур

Төлөвлөгөөг тодорхой, хэрэгжүүлэхэд хялбар байдлаар бичнэ үү. Өдөр бүрийг тодорхой тэмдэглэнэ үү (Өдөр 1, Өдөр 2 гэх мэт).`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { 
        role: 'system', 
        content: `Та бол мэргэжлийн гүйлтийн дасгалжуулагч. Тамирчны одоогийн түвшин, зорилгод тохирсон хувийн төлөвлөгөө боловсруулна.

ЧУХАЛ:
- Бүх хариултаа МОНГОЛ ХЭЛЭЭР бичнэ
- Төлөвлөгөө бодитой, хэрэгжүүлэхэд хялбар байх ёстой
- Тамирчны одоогийн түвшинд тохируулах
- Нөхөн сэргээлтийг заавал оруулах
- Ачааллыг аажмаар нэмэгдүүлэх (10% дүрэм)`
      },
      { role: 'user', content: prompt },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    return completion.choices[0]?.message?.content || 'Төлөвлөгөө үүсгэх боломжгүй байна.';
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

// Daily Plan Generator
interface DailyPlanTask {
  id: string;
  title: string;
  type: 'workout' | 'recovery' | 'nutrition' | 'sleep';
  completed: boolean;
  time?: string;
  duration?: string;
  description?: string;
}

interface DailyPlanResponse {
  greeting: string;
  date: string;
  tasks: DailyPlanTask[];
  motivation: string;
}

export async function generateDailyPlanAI(activities: DBActivity[]): Promise<DailyPlanResponse> {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Сайн байна уу';
  if (hour < 6) greeting = 'Сайхан амраарай';
  else if (hour < 12) greeting = 'Өглөөний мэнд';
  else if (hour < 18) greeting = 'Өдрийн мэнд';
  else if (hour < 22) greeting = 'Оройн мэнд';
  else greeting = 'Сайхан амраарай';

  const date = now.toLocaleDateString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Analyze recent activities
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const recentActivities = activities.filter(a => new Date(a.start_date) >= threeDaysAgo);
  const recentLoad = recentActivities.reduce((sum, a) => sum + (a.distance / 1000), 0);
  
  const lastActivity = activities[0];
  const daysSinceLastActivity = lastActivity
    ? Math.floor((now.getTime() - new Date(lastActivity.start_date).getTime()) / (24 * 60 * 60 * 1000))
    : 7;

  // Determine today's focus based on recent activity
  let fallbackTasks: DailyPlanTask[] = [];
  if (daysSinceLastActivity >= 3 || recentLoad < 5) {
    fallbackTasks = [
      { id: '1', title: 'Өглөөний сунгалт', type: 'recovery', completed: false, time: '07:00', duration: '10 мин', description: 'Бүх булчинг сунгах' },
      { id: '2', title: 'Гүйлт эсвэл алхалт', type: 'workout', completed: false, time: '08:00', duration: '30-40 мин', description: 'Хөнгөн темпээр' },
      { id: '3', title: 'Уураг ихтэй хоол', type: 'nutrition', completed: false, time: '12:00', description: 'Булчин сэргээх' },
      { id: '4', title: '7-8 цаг унтах', type: 'sleep', completed: false, time: '22:00' },
    ];
  } else if (recentLoad > 20) {
    fallbackTasks = [
      { id: '1', title: 'Хөнгөн сунгалт', type: 'recovery', completed: false, time: '08:00', duration: '15 мин', description: 'Булчин сулруулах' },
      { id: '2', title: 'Амралтын өдөр', type: 'recovery', completed: false, description: 'Идэвхтэй амралт' },
      { id: '3', title: 'Ус уух (2+ литр)', type: 'nutrition', completed: false, description: 'Гидратаци хадгалах' },
      { id: '4', title: 'Эрт унтах', type: 'sleep', completed: false, time: '21:30', description: '8+ цаг унтах' },
    ];
  } else {
    fallbackTasks = [
      { id: '1', title: 'Өглөөний сунгалт', type: 'recovery', completed: false, time: '07:00', duration: '10 мин' },
      { id: '2', title: 'Дасгал хийх', type: 'workout', completed: false, time: '08:00', duration: '45 мин', description: 'Дунд зэргийн эрчим' },
      { id: '3', title: 'Тэнцвэртэй хоол', type: 'nutrition', completed: false, time: '12:00' },
      { id: '4', title: 'Оройн сунгалт', type: 'recovery', completed: false, time: '20:00', duration: '10 мин' },
    ];
  }

  const motivations = [
    'Бага алхамууд том өөрчлөлтийг авчирна!',
    'Өнөөдрийн хүчин чармайлт маргааш үр дүнгээ өгнө.',
    'Өөрийгөө сорь, хязгаараа тэлэ!',
    'Тууштай байвал зорилгодоо хүрнэ.',
    'Жижиг алхам ч том ялалт руу хөтөлнө.',
    'Өнөөдөр эхэлснээр маргааш бэлэн болно.',
    'Хамгийн хэцүү алхам бол эхний алхам.',
  ];

  const fallbackMotivation = motivations[Math.floor(Math.random() * motivations.length)];

  if (!process.env.GROQ_API_KEY) {
    return {
      greeting,
      date,
      tasks: fallbackTasks,
      motivation: fallbackMotivation,
    };
  }

  try {
    const recentSummary = activities.slice(0, 5).map((a) => {
      const d = new Date(a.start_date).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' });
      return `- ${d}: ${(a.distance / 1000).toFixed(1)}км, ${Math.floor(a.moving_time / 60)}мин`;
    }).join('\n');

    const prompt = `
Тамирчны өнөөдрийн AI checklist төлөвлөгөө гарга.

Контекст:
- Сүүлийн 3 хоногийн ачаалал: ${recentLoad.toFixed(1)} км
- Сүүлийн дасгалаас хойш: ${daysSinceLastActivity} өдөр
- Сүүлийн дасгалууд:
${recentSummary || '- Мэдээлэл багатай'}

Тэмдэглэл:
- Төлөвлөгөө нь бодитой, богино, хэрэгжүүлэхэд хялбар байх
- 4-6 task буцаа
- Task бүр type-тэй байх: workout | recovery | nutrition | sleep
- Монгол хэлээр бич

JSON форматаар ЗӨВХӨН дараах бүтэцтэй буцаа:
{
  "motivation": "...",
  "tasks": [
    {
      "title": "...",
      "type": "workout",
      "time": "07:30",
      "duration": "40 мин",
      "description": "..."
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Та мэргэжлийн AI дасгалжуулагч. JSON-аас өөр текст бүү бич. Монгол хэлээр буцаа.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';
    const clean = content.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean) as { motivation?: string; tasks?: Array<Partial<DailyPlanTask>> };

    const tasks = (parsed.tasks || []).slice(0, 6).map((task, index) => ({
      id: String(index + 1),
      title: task.title?.trim() || `Даалгавар ${index + 1}`,
      type: (task.type === 'workout' || task.type === 'recovery' || task.type === 'nutrition' || task.type === 'sleep')
        ? task.type
        : 'workout',
      completed: false,
      time: task.time?.trim(),
      duration: task.duration?.trim(),
      description: task.description?.trim(),
    }));

    return {
      greeting,
      date,
      tasks: tasks.length > 0 ? tasks : fallbackTasks,
      motivation: parsed.motivation?.trim() || fallbackMotivation,
    };
  } catch (error) {
    console.error('Daily plan AI parse error:', error);
    return {
      greeting,
      date,
      tasks: fallbackTasks,
      motivation: fallbackMotivation,
    };
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
