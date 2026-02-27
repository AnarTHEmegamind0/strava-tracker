# AGENTS.md

Энэ файл нь энэ репод ажиллах хүн болон AI агентуудад зориулсан **төслийн тайлбар + ажиллах стандарт** юм.

## 1. Төслийн тухай

`strava-tracker` нь **Next.js 16 + TypeScript** дээр бичигдсэн Strava холболттой бэлтгэлийн самбар (dashboard) вэб апп.

Гол боломжууд:
- Strava-аас дасгал синк хийх
- Дасгалын жагсаалт, шүүлтүүр, дэлгэрэнгүй мэдээлэл
- Статистик, хувийн рекорд, долоо/сарын дүн
- Зорилго (goals) үүсгэх, явц хянах
- Амжилт (achievements), streak, alert
- Цаг агаарын зөвлөмж
- AI дасгалжуулагч (чат, дүн шинжилгээ, долоо хоногийн тойм, training plan)

UI-ийн үндсэн хэл: **Монгол хэл**.

## 2. Хэрэглэгчийн үндсэн урсгал

1. Хэрэглэгч `/` рүү орно.
2. Strava credential байхгүй бол `Client ID`, `Client Secret`-ээ UI-аар хадгална.
3. `Connect` дарж Strava OAuth хийж нэвтэрнэ.
4. Апп `strava_user_id` cookie тохируулна.
5. Dashboard athlete/profile, activities, goals, AI виджетүүдээ ачаална.
6. Хэрэглэгч Strava синк хийж, статистик/AI функцууд ашиглана.

## 3. Технологийн стек

- Framework: `next@16` (App Router)
- Frontend: React 19 + TypeScript
- Styling: Tailwind CSS v4
- DB: SQLite (`better-sqlite3`)
- Chart: Recharts
- Calendar: FullCalendar
- Map: Leaflet / React-Leaflet
- AI: Groq SDK (`llama-3.3-70b-versatile`)
- External API: Strava, OpenWeatherMap

## 4. Архитектур

### Frontend
- Dashboard page-үүд: `src/app/(dashboard)/*`
- Нийт төлөв/өгөгдлийн контекст: `src/lib/context.tsx`
- Компонентууд: `src/components/*`

### Backend API
- Route handler-ууд: `src/app/api/**/route.ts`
- Ихэнх endpoint auth шалгалттай (`strava_user_id` cookie)

### Data layer
- Бүх DB үйлдэл: `src/lib/db.ts`
- Schema/table үүсэлт: `db.exec(...)` дотор төвлөрсөн
- DB файл: `database.sqlite` (git-д ордоггүй)

### Гадаад интеграц
- Strava OAuth + API: `src/lib/strava.ts`
- LLM prompt + AI logic: `src/lib/groq.ts`
- Weather + recommendation: `src/lib/weather.ts`

## 5. Гол файл/замууд

- `src/app/page.tsx`: Нүүр + credential setup + auth эхлэл
- `src/app/(dashboard)/layout.tsx`: Dashboard shell
- `src/lib/context.tsx`: Athlete/activity/goal fetch + refresh flow
- `src/lib/db.ts`: SQLite schema + CRUD
- `src/lib/strava.ts`: OAuth, token refresh, Strava API helper
- `src/lib/groq.ts`: AI system prompt, чат, зөвлөмжүүд
- `src/lib/statistics.ts`: Статистикийн тооцоолол
- `src/lib/achievements.ts`: Achievement seed + unlock logic
- `src/lib/streaks.ts`: Daily/weekly streak тооцоо

## 6. API зураглал (өндөр түвшин)

- Auth:
  - `GET /api/auth/strava`
  - `GET /api/auth/callback`
  - `POST /api/auth/logout`
- Athlete/Activities:
  - `GET /api/athlete`
  - `GET /api/athlete/stats`
  - `GET /api/activities?refresh=true|false`
  - `GET /api/activities/[id]`
- Goals/Training plans:
  - `GET/POST/PUT/DELETE /api/goals`
  - `GET/POST /api/training-plans`
  - `GET/PUT/DELETE /api/training-plans/[id]`
- AI:
  - `POST /api/chat`
  - `GET /api/ai/daily-insights`
  - `GET /api/ai/weekly-summary`
  - `GET /api/ai/recovery-score`
  - `GET /api/ai/training-load`
  - `GET /api/ai/suggest-goals`
  - `POST /api/ai/goal-advice`
  - `POST /api/ai/analyze-activity`
  - `POST /api/ai/training-plan`
- Бусад:
  - `GET /api/statistics`
  - `GET/POST /api/achievements`
  - `GET/POST /api/streaks`
  - `GET/POST/DELETE /api/alerts`
  - `GET/PUT /api/user-settings`
  - `GET /api/weather`
  - `GET /api/export`
  - `GET/POST /api/settings/credentials`

## 7. Орчны хувьсагч (env)

Ашиглагддаг түлхүүрүүд:
- `STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI`
- `GROQ_API_KEY`
- `OPENWEATHERMAP_API_KEY`

Strava credential ашиглах дараалал:
1. SQLite `app_settings` (`strava_client_id`, `strava_client_secret`)
2. `.env` fallback

## 8. Өгөгдлийн загвар (DB)

Гол хүснэгтүүд:
- `users`
- `activities`
- `chat_messages`
- `goals`
- `achievements`
- `user_achievements`
- `user_streaks`
- `smart_alerts`
- `user_settings`
- `training_plans`
- `app_settings`

Нэгжийн стандарт:
- Distance: meter
- Time: second
- Elevation: meter

## 9. Агент ажиллах дүрэм

1. Хэрэглэгчид харагдах текстэд Монгол хэлний хэв маягийг хадгал.
2. Давхардсан логик шинээр бичихгүй, эхлээд одоо байгаа `lib` helper-уудыг ашигла.
3. Auth шаарддаг endpoint дээр заавал:
   - `strava_user_id` cookie унших
   - `getUserByStravaId`-аар user шалгах
   - Зөв HTTP код буцаах (`401/404/403`)
4. Ownership шалгалт алгасахгүй (`/api/training-plans/[id]` гэх мэт).
5. Schema өөрчлөх бол:
   - `src/lib/db.ts`-д төвлөрүүл
   - `src/types/index.ts`-ийг зэрэг шинэчил
6. Secret/token-ийг log, response, UI дээр ил гаргахгүй.
7. Алдаа/fallback-ийг эвдэхгүй:
   - Weather API key байхгүй үед mock өгөгдөл ажиллах ёстой
   - AI алдаа JSON хэлбэртэй буцах ёстой
8. Дараах файлуудыг commit хийхгүй: `.next`, `node_modules`, `database.sqlite`, `.env*`.

## 10. Түгээмэл өөрчлөлтийн playbook

### A. Шинэ dashboard виджет нэмэх
1. `src/components/dashboard/*` дотор компонент үүсгэ.
2. Шаардлагатай бол API endpoint нэм (`src/app/api/*`).
3. `src/app/(dashboard)/dashboard/page.tsx` дээр холбо.
4. Loading/error/empty төлөвийг заавал тусга.

### B. Шинэ AI feature нэмэх
1. Prompt/logic-оо `src/lib/groq.ts`-д нэм.
2. Түүнд тохирох `api/ai/*` route үүсгэ.
3. Frontend дээр fetch + error UI нэм.
4. Хариултын хэл Монгол эсэхийг шалга.

### C. Шинэ DB entity нэмэх
1. `db.exec` дотор table/index-оо нэм.
2. `src/types/index.ts` дээр interface/type нэм.
3. `src/lib/db.ts` дээр CRUD функц нэм.
4. API/UI хэрэглээг холбо.

## 11. Локал хөгжүүлэлт

```bash
npm install
npm run dev
```

Хаяг: `http://localhost:3000`

Lint:

```bash
npm run lint
```

## 12. Мэдэх ёстой хязгаарлалт

- `README.md` нь одоогоор default Next.js template шинжтэй; энэ файл илүү бодит гарын авлага.
- Session нь энгийн cookie суурьтай, full auth framework биш.
- Strava token SQLite-д хадгалагддаг тул локал DB-г мэдрэмтгий өгөгдөл гэж үз.

## 13. Агентын өөрчлөлтийн Done шалгуур

- Хийсэн өөрчлөлт target page/API дээрээ ажиллаж байх
- Auth/ownership regression үүсээгүй байх
- Secret ил гараагүй байх
- `npm run lint` амжилттай (эсвэл яагаад ажиллуулаагүйгээ тодорхой тайлагнасан байх)
- Өөрчлөлт ойлгомжтой, шаардлагатай хүрээнд хязгаарлагдсан байх
