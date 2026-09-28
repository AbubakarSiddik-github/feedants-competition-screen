/**
 * Phase 5 — Prove the concurrency claim
 *
 * Seeds 10 users, sets totalSpots=5, then fires 10 simultaneous POST /register
 * requests and asserts exactly 5 succeed.
 *
 * Usage:
 *   node scripts/loadtest-register.js
 *
 * Requires the server to be running on PORT (default 5000).
 */

require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

const Competition = require("../src/models/Competition");
const User = require("../src/models/User");
const Registration = require("../src/models/Registration");

const jwt = require("jsonwebtoken");

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;
const TEST_SPOTS = 5;
const TEST_USERS = 10;

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        Authorization: `Bearer ${token}`,
      },
    };
    const req = http.request(url, options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("[LoadTest] Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);

  // Create a fresh loadtest competition with only TEST_SPOTS spots
  await Competition.deleteOne({ title: "__loadtest__" });
  const now = new Date();
  const comp = await Competition.create({
    title: "__loadtest__",
    category: ["Test"],
    type: "multi-win",
    certificateForWinners: false,
    prizePool: 0,
    entryFee: 0,
    totalSpots: TEST_SPOTS,
    spotsBooked: 0,
    registrationDeadline: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
    submissionStart: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    submissionEnd: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    resultDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),
    status: "published",
  });
  console.log(`[LoadTest] Created competition with ${TEST_SPOTS} spots: ${comp._id}`);

  // Wipe old loadtest users and registrations
  await User.deleteMany({ email: /loadtest/ });
  await Registration.deleteMany({ competitionId: comp._id });

  // Create TEST_USERS users and generate tokens
  const tokens = [];
  for (let i = 1; i <= TEST_USERS; i++) {
    const user = await User.create({
      name: `LoadTest User ${i}`,
      email: `loadtest${i}@test.com`,
      referralCode: `LT${String(i).padStart(4, "0")}`,
    });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, referralCode: user.referralCode },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    tokens.push(token);
  }
  console.log(`[LoadTest] Created ${TEST_USERS} test users.`);

  await mongoose.disconnect();

  // Fire all requests simultaneously
  const url = `${BASE}/api/competitions/${comp._id}/register`;
  console.log(`\n[LoadTest] Firing ${TEST_USERS} simultaneous POST requests to ${url}`);
  console.log(`[LoadTest] Only ${TEST_SPOTS} should succeed...\n`);

  const results = await Promise.allSettled(
    tokens.map((token, i) => post(url, {}, token).then((r) => ({ ...r, userIndex: i + 1 })))
  );

  let succeeded = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { status, body, userIndex } = result.value;
      if (status === 201) {
        succeeded++;
        console.log(`  ✅ User ${userIndex}: registered (spotsLeft=${body.spotsLeft})`);
      } else {
        failed++;
        console.log(`  ❌ User ${userIndex}: ${status} — ${body.error}`);
      }
    } else {
      failed++;
      console.log(`  💥 Network error: ${result.reason}`);
    }
  }

  console.log(`\n[LoadTest] ════════════════════════════════`);
  console.log(`[LoadTest]  Total requests : ${TEST_USERS}`);
  console.log(`[LoadTest]  Succeeded      : ${succeeded}  (expected: ${TEST_SPOTS})`);
  console.log(`[LoadTest]  Failed/rejected: ${failed}`);

  if (succeeded === TEST_SPOTS) {
    console.log(`[LoadTest] ✅ PASS — atomic update held: exactly ${TEST_SPOTS} registrations accepted`);
  } else {
    console.log(`[LoadTest] ❌ FAIL — expected ${TEST_SPOTS}, got ${succeeded}`);
    process.exit(1);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("[LoadTest] Fatal:", err);
  process.exit(1);
});
