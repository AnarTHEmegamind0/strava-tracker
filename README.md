# Strava Tracker

Strava-тай холбогддог, AI зөвлөмжтэй, Next.js дээрх бэлтгэлийн бүртгэл ба аналитикийн dashboard.

## Юу хийдэг вэ?

`strava-tracker` нь тамирчны Strava өгөгдлийг синк хийгээд дараах боломжуудыг өгдөг:
- Дасгалын бүртгэл, шүүлтүүр, дэлгэрэнгүй (streams, laps, zones)
- Долоо/сарын статистик, харьцуулалт, хувийн рекорд
- Зорилго тавих, явц хянах
- Achievement, streak, smart alert
- Цаг агаар дээр суурилсан дасгалын зөвлөмж
- AI coach чат, daily insights, training load/recovery анализ, training plan

UI-ийн үндсэн хэл: **Монгол хэл**

## Гол боломжууд

| Хэсэг | Боломж |
|---|---|
| Authentication | Strava OAuth 2.0 нэвтрэлт |
| Activities | Strava-с синк, жагсаалт, төрөл/хайлт, activity detail |
| Dashboard | Quick stats, weekly overview, recent activities, daily insights |
| Goals | Weekly/monthly зорилго + progress тооцоолол |
| AI | Чат, долоо хоногийн тойм, зорилгын зөвлөгөө, төлөвлөгөө үүсгэх |
| Performance | Race predictions, training load, recovery score |
| Motivation | Achievements, streaks, alerts |
| Weather | OpenWeatherMap + дасгалын хувцас/эрсдэлийн зөвлөмж |
| Export | CSV export endpoint |

## Хурдан эхлэх (Local)

### 1) Шаардлага

- Node.js 20+
- npm
- Strava Developer App (Client ID, Client Secret)

### 2) Суулгах

```bash
npm install
```

### 3) Орчны хувьсагч тохируулах (`.env.local`)

```bash
# Optional fallback (UI-аар хадгалаагүй үед ашиглана)
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/callback

# AI features
GROQ_API_KEY=

# Weather (байхгүй бол mock weather fallback ажиллана)
OPENWEATHERMAP_API_KEY=
```

### 4) Ажиллуулах

```bash
npm run dev
```

Хөтөч дээр нээх:
- `http://localhost:3000`

## Анхны тохиргооны урсгал

1. Нүүр хуудас дээр Strava credential тохиргоо гарна.
2. `Client ID` болон `Client Secret`-ээ UI-аар хадгална (`/api/settings/credentials`).
3. `Connect to Strava` дарж OAuth эхлүүлнэ.
4. Амжилттай бол `strava_user_id` cookie үүсээд dashboard руу орно.
5. `Strava-с татах` товчоор дасгалуудыг локал SQLite руу синк хийнэ.

## Скриптүүд

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Төслийн бүтэц

```text
src/
  app/
    page.tsx                      # Login + credential setup
    (dashboard)/                  # Main UI pages
    api/                          # Route handlers
  components/                     # UI components
  lib/
    db.ts                         # SQLite schema + DB operations
    strava.ts                     # Strava OAuth/API helper
    groq.ts                       # AI prompt + generation
    statistics.ts                 # Stats calculators
    achievements.ts               # Achievement logic
    streaks.ts                    # Streak logic
    weather.ts                    # Weather + recommendation
  types/index.ts                  # Shared types
database.sqlite                   # Local DB (gitignored)
AGENTS.md                         # Agent guidelines
```

## Архитектур (өндөр түвшин)

```mermaid
flowchart LR
  U[User] --> W[Next.js App]
  W --> A[/api/auth/strava]
  A --> S[Strava OAuth]
  S --> C[/api/auth/callback]
  C --> D[(SQLite)]
  W --> API[/api/* routes]
  API --> D
  API --> STRAVA[Strava API v3]
  API --> GROQ[Groq API]
  API --> OWM[OpenWeatherMap API]
```

## API тойм

### Auth

| Method | Path | Auth | Тайлбар |
|---|---|---|---|
| GET | `/api/auth/strava` | No | Strava OAuth эхлүүлнэ |
| GET | `/api/auth/callback` | No | OAuth callback, user/token хадгална |
| POST | `/api/auth/logout` | Yes | `strava_user_id` cookie цэвэрлэнэ |

### Athlete / Activities

| Method | Path | Auth | Тайлбар |
|---|---|---|---|
| GET | `/api/athlete` | Yes | Athlete profile |
| GET | `/api/athlete/stats` | Yes | Athlete stats + zones |
| GET | `/api/activities` | Yes | DB дахь activity list |
| GET | `/api/activities?refresh=true` | Yes | Strava-с татаж DB-д upsert |
| GET | `/api/activities/[id]` | Yes | Detailed activity + streams/laps/zones |

### Goals / Plans

| Method | Path | Auth | Тайлбар |
|---|---|---|---|
| GET/POST/PUT/DELETE | `/api/goals` | Yes | Goal CRUD |
| GET/POST | `/api/training-plans` | Yes | Training plan list/create |
| GET/PUT/DELETE | `/api/training-plans/[id]` | Yes | Training plan detail/update/delete |

### AI

| Method | Path | Auth | Тайлбар |
|---|---|---|---|
| POST | `/api/chat` | Yes | AI coach чат |
| GET | `/api/ai/daily-insights` | Yes | Өдрийн AI дүгнэлт |
| GET | `/api/ai/weekly-summary` | Yes | 7 хоногийн AI тойм |
| GET | `/api/ai/recovery-score` | Yes | Recovery score |
| GET | `/api/ai/training-load` | Yes | Training load analysis |
| GET | `/api/ai/suggest-goals` | Yes | Goal suggestions |
| POST | `/api/ai/goal-advice` | Yes | Goal-specific зөвлөгөө |
| POST | `/api/ai/analyze-activity` | Yes | Activity analysis |
| POST | `/api/ai/training-plan` | Yes | AI training plan үүсгэх |

### Other

| Method | Path | Auth | Тайлбар |
|---|---|---|---|
| GET | `/api/statistics` | Yes | Dashboard/statistics aggregate |
| GET/POST | `/api/achievements` | Yes | Achievement list/check |
| GET/POST | `/api/streaks` | Yes | Streak info/recalculate |
| GET/POST/DELETE | `/api/alerts` | Yes | Alerts read/delete |
| GET/PUT | `/api/user-settings` | Yes | User preferences |
| GET | `/api/weather` | Optional | Weather + recommendation |
| GET | `/api/export` | Yes | CSV export |
| GET/POST | `/api/settings/credentials` | No | Strava credential check/save |

## Өгөгдлийн сан

SQLite хүснэгтүүд:
- `users`
- `activities`
- `chat_messages`
- `goals`
- `app_settings`
- `achievements`
- `user_achievements`
- `user_streaks`
- `smart_alerts`
- `user_settings`
- `training_plans`

Нэгжийн стандарт:
- Distance: meter
- Time: second
- Elevation: meter

## Credential ба auth-ийн онцлог

- Strava credential-ийг UI-аар хадгалах боломжтой (`app_settings` хүснэгтэд).
- Хэрэв DB-д credential байхгүй бол `.env`-ийн `STRAVA_CLIENT_ID/SECRET` fallback ашиглана.
- Session нь энгийн cookie (`strava_user_id`) дээр суурилсан.

## Deployment зөвлөмж

1. `STRAVA_REDIRECT_URI`-г production domain руу зөв тохируул.
2. `database.sqlite` нь локал/ганц instance орчинд тохиромжтой.
3. Serverless ephemeral filesystem дээр SQLite ашиглах бол persistent storage стратеги хэрэгтэй.
4. Production дээр secret-ээ зөвхөн environment variables эсвэл secure secret manager-д хадгал.

## Алдаа засварлах (Troubleshooting)

### OAuth амжилтгүй

- `/?error=auth_denied`: хэрэглэгч Strava дээр зөвшөөрөл цуцалсан.
- `/?error=no_code`: callback дээр code ирээгүй.
- `/?error=token_exchange`: token солилцоо амжилтгүй.

Шалгах зүйлс:
- Strava App callback domain зөв эсэх (`localhost` эсвэл production domain)
- `STRAVA_REDIRECT_URI` Strava app тохиргоотой яг таарч байгаа эсэх
- Client ID/Secret зөв эсэх

### Activity харагдахгүй

- Dashboard дээр `Strava-с татах` дарж refresh sync хий.
- OAuth token expired бол backend автоматаар refresh хийх ёстой.

### AI endpoint алдаа

- `GROQ_API_KEY` тохируулсан эсэхийг шалга.
- Groq rate limit эсвэл network алдааг server log дээр шалга.

### Weather хоосон

- `OPENWEATHERMAP_API_KEY` байхгүй бол mock fallback ажиллана.
- API key байгаа ч алдаа гарвал request limit/invalid key шалга.

## Security анхааруулга

- `.env*`, `database.sqlite` файлуудыг git-д commit хийж болохгүй.
- DB дотор Strava token хадгалагддаг тул хөгжүүлэлтийн орчинд ч хувийн өгөгдөл гэж үз.
- API route дээр user ownership шалгалтыг алгасаж болохгүй.

## Хөгжүүлэгчдэд

- Агент/кодын ажлын стандарт: [AGENTS.md](./AGENTS.md)
- DB schema өөрчлөлт хийх бол `src/lib/db.ts` болон `src/types/index.ts`-г хамтад нь шинэчил.
- Шинэ feature хийхээсээ өмнө одоо байгаа `src/lib/*` helper-уудыг дахин ашигла.

## License

Одоогоор тусдаа license файл тодорхойлоогүй (`private project`).
