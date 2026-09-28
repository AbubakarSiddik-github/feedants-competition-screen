# Feedants — Competition Details Screen

A fully dynamic, backend-driven implementation of the Feedants Competition Details screen.
Built for the Full Stack Development Internship technical assignment.

**Stack**: React Native (Expo SDK 58) · Node.js + Express.js · MongoDB Atlas

**Repo**: [github.com/AbubakarSiddik-github/feedants-competition-screen](https://github.com/AbubakarSiddik-github/feedants-competition-screen)

---

## Project Structure

```
feedants-competition-screen/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Competition.js       # Full schema with indexes
│   │   │   ├── Registration.js      # Unique (competitionId, userId) index
│   │   │   ├── Submission.js        # Per-user submission
│   │   │   └── User.js              # Name, email, referralCode
│   │   ├── routes/
│   │   │   ├── auth.js              # POST /api/auth/login
│   │   │   └── competitions.js      # All competition endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js              # requireAuth + optionalAuth
│   │   │   └── errorHandler.js      # Centralised error responses
│   │   ├── utils/
│   │   │   └── competitionPhase.js  # Pure getPhaseInfo + getCtaState
│   │   └── app.js                   # Express + Socket.io server entry
│   ├── scripts/
│   │   ├── seed.js                  # Seeds 20 users + 1 competition
│   │   └── loadtest-register.js     # Concurrency proof (10 req, 5 spots)
│   ├── .env.example
│   └── package.json
└── mobile/
    ├── src/
    │   ├── api/
    │   │   ├── client.js            # Axios with JWT interceptor
    │   │   ├── auth.js              # login(), logout(), getStoredUser()
    │   │   └── competitions.js      # fetchCompetition(), registerForCompetition(), submitEntry()
    │   ├── components/
    │   │   ├── CompetitionHeaderCard.jsx  # Title, tags, prize pool, spots bar
    │   │   ├── JudgeCard.jsx              # Judge photo, name, intro video
    │   │   ├── CountdownTimer.jsx         # Server clock-corrected live countdown
    │   │   ├── ImportantDatesGrid.jsx     # 2×2 dates grid
    │   │   ├── WinnersCarousel.jsx        # Horizontal scroll + play overlay
    │   │   ├── InfoTabs.jsx               # 3-tab panel (About, Rules, FAQ)
    │   │   ├── RewardsTable.jsx           # Trophy icons + disclaimer
    │   │   ├── ReferralCard.jsx           # Referral link + copy button
    │   │   ├── StickyCTABar.jsx           # CTA bar driven by getCtaState()
    │   │   ├── LoadingSkeleton.jsx        # Skeleton while loading
    │   │   └── ErrorState.jsx             # Error + retry button
    │   ├── hooks/
    │   │   └── useCompetition.js    # React Query + clock drift + foreground refetch
    │   ├── screens/
    │   │   ├── CompetitionDetailsScreen.jsx  # Main screen assembling all components
    │   │   └── LoginScreen.jsx               # Email login screen
    │   └── utils/
    │       └── competitionPhase.js  # Same pure logic as backend (mirrored)
    ├── App.js                       # QueryClient + Navigation + session restore
    ├── babel.config.js
    ├── metro.config.js
    ├── tailwind.config.js
    ├── global.css
    └── .env.example
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or use the provided URI)
- Expo Go app on your phone (SDK 58)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm install
node scripts/seed.js          # Seeds DB: 1 competition + 20 users
npm run dev                   # Starts server on PORT 5000
```

**`.env` variables:**

| Variable    | Value |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET`| `feedants_super_secret_jwt_key_2026` |
| `PORT`      | `5000` |

> **Note on DNS**: If your ISP blocks MongoDB SRV DNS lookups, use a direct connection string instead of `mongodb+srv://`. The direct format is:
> ```
> mongodb://user:pass@host1:27017,host2:27017,host3:27017/dbname?ssl=true&authSource=admin
> ```

### 2. Mobile

```bash
cd mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your machine's LAN IP (not localhost)
npm install
npx expo start --lan --clear  # Scan QR with Expo Go
```

**`.env` variables:**

| Variable                     | Value |
|---|---|
| `EXPO_PUBLIC_API_URL`        | `http://<YOUR_LAN_IP>:5000` |
| `EXPO_PUBLIC_COMPETITION_ID` | Competition ID printed by seed.js |

> **Finding your LAN IP (Windows):**
> ```powershell
> Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.*" }
> ```

### 3. Test users (seeded)

| Email | Status |
|---|---|
| `user1@test.com` | Pre-registered (1 spot used) |
| `user2@test.com` – `user20@test.com` | Available to register |

Password: none — email-only auth for this assignment.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Server health check |
| POST | `/api/auth/login` | — | Login by email → returns JWT |
| GET | `/api/competitions` | Optional | List all published competitions |
| GET | `/api/competitions/:id` | Optional | Full competition + per-user state + CTA |
| POST | `/api/competitions/:id/register` | Required | Atomic spot reservation |
| POST | `/api/competitions/:id/submissions` | Required | Submit competition entry |
| GET | `/api/competitions/:id/winners` | — | Previous winners list |

### Example — Full flow via PowerShell

```powershell
# 1. Login
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST -ContentType "application/json" -Body '{"email":"user2@test.com"}'
$token = $login.token

# 2. View competition
$comp = Invoke-RestMethod -Uri "http://localhost:5000/api/competitions/<ID>" `
  -Headers @{Authorization="Bearer $token"}
Write-Host "$($comp.title) | Spots left: $($comp.spotsLeft) | CTA: $($comp.cta.label)"

# 3. Register
Invoke-RestMethod -Uri "http://localhost:5000/api/competitions/<ID>/register" `
  -Method POST -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" -Body '{}'

# 4. Try registering again → 409 Already registered
# 5. Try when spots full → 409 No spots left
# 6. Try after deadline → 400 Registration is closed
```

---

## Concurrency Load Test

Proves the atomic `spotsBooked` reservation is race-condition-safe:

```bash
cd backend
# Server must be running: npm run dev
node scripts/loadtest-register.js
```

**Expected output:**
```
[LoadTest] Firing 10 simultaneous POST requests
[LoadTest] Only 5 should succeed...

  ✅ User 1: registered (spotsLeft=4)
  ✅ User 2: registered (spotsLeft=3)
  ✅ User 3: registered (spotsLeft=2)
  ✅ User 4: registered (spotsLeft=1)
  ✅ User 5: registered (spotsLeft=0)
  ❌ User 6: 409 — No spots left
  ...
  ❌ User 10: 409 — No spots left

✅ PASS — atomic update held: exactly 5 registrations accepted
```

---

## Key Technical Decisions

### 1. Atomic spot reservation

The most critical correctness requirement. Uses a single atomic MongoDB write:

```js
Competition.findOneAndUpdate(
  {
    _id: competitionId,
    $expr: { $lt: ["$spotsBooked", "$totalSpots"] }  // check + reserve in one op
  },
  { $inc: { spotsBooked: 1 } },
  { new: true }
)
```

This is a **single atomic document operation** at the MongoDB storage engine level. Two simultaneous requests cannot both pass the `$expr` condition — whichever write lands first wins, the second gets `null` and returns `409 No spots left`.

A unique compound index on `Registration(competitionId, userId)` is a **second backstop** against duplicate registrations.

### 2. Two independent phase booleans (not a linear enum)

```js
const registrationOpen = now < competition.registrationDeadline;
const submissionOpen   = now >= competition.submissionStart && now < competition.submissionEnd;
```

A linear enum (`OPEN → SUBMISSION → DONE`) would misrepresent the 4-day overlap in the seed data where both windows are open simultaneously. Two independent booleans correctly model all valid states.

### 3. `getCtaState` — single source of truth

A pure function used by both the API response and the mobile `StickyCTABar`. The CTA label, enabled state, and action string are always derived together from the same inputs and can never drift apart.

### 4. Server clock offset correction

```js
// On every API fetch:
clockOffset = serverTime - Date.now();

// In CountdownTimer:
const now = Date.now() + clockOffset;
```

A phone with a wrong system clock still shows the correct remaining time.

### 5. Foreground refetch on AppState change

```js
AppState.addEventListener("change", (state) => {
  if (state === "active") refetch();
});
```

If a phase transition (e.g. registration deadline) occurs while the app is backgrounded, the UI updates immediately on foreground — not just on the next 15-second poll interval.

### 6. Rate limiter keyed by userId

```js
keyGenerator: (req) => String(req.user?.id || req.ip),
validate: { keyGeneratorIpFallback: false },
```

Limits are per-user, not per-IP. This means multiple users on the same network (office WiFi, load test) each get their own 5-per-minute budget, and a single bad actor cannot block others by exhausting the shared IP limit.

---

## Assumptions

| Assumption | Rationale |
|---|---|
| **Email-only auth** | No password/OTP. Two seeded users are enough to demonstrate per-user registration state. Production would use OTP or OAuth. |
| **Simulated payment** | Entry fee is recorded but no real payment gateway. Production needs Razorpay Orders API → webhook confirmation before creating Registration. |
| **Submission = URL/text string** | No file upload. A production version would use pre-signed S3/GCS URLs. |
| **Single competition seeded** | Schema supports unlimited competitions. The `GET /api/competitions` list endpoint is implemented. |
| **Registration and submission windows are independent** | Correctly models a 4-day overlap period where both are open. |

---

## Trade-offs

| Decision | Trade-off |
|---|---|
| Single-document atomic write | Simple and correct for this scale. Multi-document transactions (MongoDB sessions) would be needed if registration also deducted from a separate inventory. Transactions are available — Atlas gives you a replica set for free. |
| No Redis cache | `GET /competitions/:id` hits MongoDB on every request. At scale, a 5-second Redis TTL would reduce DB load. Straightforward to add. |
| No real payment flow | A Razorpay integration needs: create order → short-lived spot hold → webhook confirms → create Registration → release hold if payment times out. |
| Polling (15s) instead of WebSocket default | Safe fallback. Socket.io is already wired up on the backend (`emitSpotsUpdate`). The client just needs to join the room. |

---

## Given More Time

- **Razorpay webhook flow** — spot hold with 10-minute expiry if payment not completed
- **WebSocket live spot counter** — Socket.io is installed and server emits `spots_update` events
- **Redis cache** — 5s TTL on `GET /competitions/:id`, invalidated on any write
- **File upload for submissions** — pre-signed URL flow (S3 or GCS)
- **Admin panel** — CRUD for competitions, live participant dashboard
- **Push notifications** — FCM alerts when submission window opens or results posted
- **OTP / OAuth auth** — replace email-only login
- **Pagination** — `GET /api/competitions` with filter by category, status, date range

---

## npm Scripts

### Backend
```bash
npm run dev        # nodemon src/app.js
npm run start      # node src/app.js
npm run seed       # node scripts/seed.js
npm run loadtest   # node scripts/loadtest-register.js
```

### Mobile
```bash
npm start          # expo start
npm run android    # expo start --android
npm run ios        # expo start --ios
```