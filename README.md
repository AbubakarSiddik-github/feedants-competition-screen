# Feedants — Competition Details Screen

A fully dynamic, backend-driven implementation of the Feedants Competition Details screen.  
Built for the Full Stack Development Internship technical assignment.

**Stack**: React Native (Expo) · Node.js + Express.js · MongoDB Atlas

---

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env          # Fill in MONGO_URI and JWT_SECRET
npm install
node scripts/seed.js          # Seeds DB: 1 competition + 20 users
npm run dev                   # Starts server on PORT 5000
```

**Required env vars** (see `backend/.env.example`):

| Variable     | Description |
|---|---|
| `MONGO_URI`  | MongoDB Atlas connection string |
| `JWT_SECRET` | Any random string for signing JWTs |
| `PORT`       | Default: 5000 |

### 2. Mobile

```bash
cd mobile
cp .env.example .env          # Set EXPO_PUBLIC_API_URL to your machine's LAN IP
                               # e.g. http://192.168.1.100:5000
npm install
npx expo start                # Scan QR code with Expo Go on your phone
```

**Required env vars** (see `mobile/.env.example`):

| Variable                    | Description |
|---|---|
| `EXPO_PUBLIC_API_URL`       | Base URL of the backend (LAN IP, not localhost) |
| `EXPO_PUBLIC_COMPETITION_ID`| ID printed by `seed.js` |

### 3. Login (for demo)

The seed creates 20 users with no passwords (email-only auth):
- `user1@test.com` — pre-registered (spots = 1/20)
- `user2@test.com` – `user20@test.com` — not yet registered

Use the **Login** button (top-right overlay) in the app to switch users and observe per-user state changes in real time.

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Returns JWT |
| GET | `/api/competitions/:id` | Optional | Full competition + computed user state |
| POST | `/api/competitions/:id/register` | Required | Atomic spot reservation |
| POST | `/api/competitions/:id/submissions` | Required | Submit entry |
| GET | `/api/competitions/:id/winners` | — | Previous winners |

---

## Concurrency Load Test

Proves the atomic `spotsBooked` reservation handles simultaneous requests correctly:

```bash
cd backend
# Server must be running: npm run dev
npm run loadtest
```

Output: `10 requests, 5 spots → exactly 5 succeed`. Remaining 5 get `409 No spots left`.

---

## Assumptions

1. **No real payment integration** — entry fee is recorded as `entryFeePaid` and a simulated `paymentId` is stored. A real implementation would use Razorpay Orders API with webhook confirmation.
2. **Email-only auth** — no password or OTP. Two seeded users are enough to demonstrate per-user registration state across the same competition.
3. **Submission = a text/URL string** — no file upload; for this assignment scope a video URL or text content proves the flow. A production version would use pre-signed S3/GCS URLs.
4. **Single competition schema** — covers both `single-win` and `multi-win` types from the design.
5. **Registration window and submission window are intentionally independent** — the design shows submission opening Aug 6 while registration closes Aug 10. These overlap for 4 days. I model them as two independent date pairs, not a single linear phase enum.

---

## Technical Decisions

### Atomic spot reservation (`findOneAndUpdate` with `$expr`)

The most critical correctness requirement: multiple users must not both "see" a spot and both book it.

```js
Competition.findOneAndUpdate(
  { _id: id, $expr: { $lt: ["$spotsBooked", "$totalSpots"] } },
  { $inc: { spotsBooked: 1 } },
  { new: true }
)
```

The `$expr` check and the `$inc` are a **single atomic document write** in MongoDB. Two simultaneous requests cannot both satisfy the condition — whichever write lands first wins; the second gets `null` back and returns `409 No spots left`.

The unique compound index on `(competitionId, userId)` in the `Registration` collection is a **second backstop** — even if a client fires the same request twice before the first response arrives (double-tap), the second insert is rejected at the database level with a duplicate key error.

### Independent phase booleans vs. linear enum

```js
const registrationOpen = now < competition.registrationDeadline;
const submissionOpen   = now >= competition.submissionStart && now < competition.submissionEnd;
```

A linear enum like `OPEN → SUBMISSION → DONE` would silently misrepresent the 4-day overlap where both registration and submission are open simultaneously. Two independent booleans correctly represent all valid states.

### `getCtaState` — single source of truth for CTA

Both the API response and the mobile `StickyCTABar` call the same pure function. The label and the `enabled` flag are derived together from the same inputs, so they can never drift apart.

### Server clock offset correction

On every API fetch, the mobile app stores `clockOffset = serverTime - Date.now()`. The countdown timer ticks off `Date.now() + clockOffset`, so a phone with a wrong clock still shows the right remaining time.

### Foreground refetch (Phase 8 edge case)

`AppState` listener triggers a refetch whenever the app returns from background. If a phase transition happened while the app was backgrounded (e.g. registration deadline passed), the UI updates immediately on foreground — not just on the next 15-second interval.

### Expo + NativeWind

Expo Go allows running on a physical phone in minutes without Xcode/Android Studio. NativeWind reuses Tailwind muscle memory while writing standard React Native `StyleSheet` objects for components that need precise control.

---

## Trade-offs

| Decision | Trade-off |
|---|---|
| Single-document atomic write | Simple and correct for this scale. A full multi-document transaction (MongoDB sessions) would be needed if registration also deducted from a separate inventory collection. Atlas gives you a replica set for free, so transactions are available if needed. |
| No Redis cache | The `GET /competitions/:id` endpoint hits MongoDB on every request. With thousands of concurrent users, a short-TTL Redis cache (e.g. 5s) in front of the read endpoint would reduce DB load dramatically. |
| Simulated payment | A real implementation needs a Razorpay Orders API flow: create order → client pays → webhook confirms → then create Registration. Without it, a user could register without actually paying. |
| Email-only auth | Production needs password + OTP. Kept minimal here to focus on competition logic. |
| No WebSocket in baseline | `refetchInterval: 15000` keeps spot counts reasonably fresh. Socket.io is included in the backend and wired up (`emitSpotsUpdate`) — it just needs the client-side listener to complete the stretch goal. |

---

## Given More Time

- **Razorpay webhook flow** — create order, short-lived hold on spot, confirm on webhook, expire hold if payment not completed in 10 minutes
- **WebSocket live spot updates** — Socket.io is already installed and the server emits `spots_update`; the mobile client needs to join the room and update the query cache
- **Redis cache** — 5-second TTL on `GET /competitions/:id`, invalidated on any write
- **Admin panel** — CRUD for competitions, live stats dashboard
- **Push notifications** — notify registered users when submission window opens or results are declared
- **File upload for submissions** — pre-signed S3 URL flow instead of text content
- **Pagination + competition listing** — `GET /api/competitions` with filters by category, status, date

---

## Project Structure

```
feedants-competition-screen/
├── backend/
│   ├── src/
│   │   ├── models/          Competition, Registration, Submission, User
│   │   ├── routes/          auth.js, competitions.js
│   │   ├── middleware/       auth.js (requireAuth/optionalAuth), errorHandler.js
│   │   ├── utils/           competitionPhase.js (pure logic, no I/O)
│   │   └── app.js           Express + Socket.io server
│   ├── scripts/
│   │   ├── seed.js           Seeds DB with competition + 20 users
│   │   └── loadtest-register.js  Proves atomic concurrency (10 req, 5 spots)
│   └── .env.example
└── mobile/
    ├── src/
    │   ├── api/             client.js, auth.js, competitions.js
    │   ├── components/      HeaderCard, JudgeCard, CountdownTimer,
    │   │                    DatesGrid, WinnersCarousel, InfoTabs,
    │   │                    RewardsTable, ReferralCard, StickyCTABar,
    │   │                    LoadingSkeleton, ErrorState
    │   ├── hooks/           useCompetition.js (React Query + clock drift)
    │   ├── screens/         CompetitionDetailsScreen.jsx, LoginScreen.jsx
    │   └── utils/           competitionPhase.js (mirrors backend logic)
    ├── App.js
    └── .env.example
```
#   f e e d a n t s - c o m p e t i t i o n - s c r e e n  
 