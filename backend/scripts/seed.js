require("dotenv").config();
const mongoose = require("mongoose");
const Competition = require("../src/models/Competition");
const User = require("../src/models/User");
const Registration = require("../src/models/Registration");
const Submission = require("../src/models/Submission");

async function seed() {
  console.log("[Seed] Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[Seed] Connected.");

  // Wipe existing data
  await Competition.deleteMany({});
  await User.deleteMany({});
  await Registration.deleteMany({});
  await Submission.deleteMany({});
  console.log("[Seed] Cleared existing data.");

  // Seed competition (dates updated to future relative to current system time)
  const now = new Date();
  const competition = await Competition.create({
    title: "Feedants Classical Dance",
    category: ["Dance"],
    type: "multi-win",
    certificateForWinners: true,
    prizePool: 1500,
    entryFee: 99,
    totalSpots: 20,
    spotsBooked: 1,
    // Registration closes ~10 days from now
    registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    // Submission opens 4 days from now (overlaps registration by 6 days)
    submissionStart: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    // Submission ends 32 days from now
    submissionEnd: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
    // Results 34 days from now
    resultDate: new Date(now.getTime() + 34 * 24 * 60 * 60 * 1000),
    judge: {
      name: "Manju Dubey",
      title: "Professional Kathak Dancer",
      experience: "12+ Years of Experience",
      photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      introVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    description: {
      short: "An online classical dance competition open for all age groups.",
      full: "Participate from anywhere and showcase your talent. Express your passion through traditional dance forms like Bharatanatyam, Kathak, Odissi, and more. All skill levels are welcome. Submit a 3-5 minute video of your performance.",
    },
    judgingParameters:
      "Participants will be judged on: (1) Technical accuracy — footwork, hand gestures (mudras), posture. (2) Expressiveness — ability to convey emotion (abhinaya). (3) Rhythm — synchronisation with the music. (4) Costume & presentation — traditional attire appropriate to the dance form.",
    rulesAndEligibility:
      "1. Open to all age groups worldwide.\n2. Solo performances only.\n3. Video must be 3–5 minutes long.\n4. Only pre-recorded videos accepted.\n5. Background music must be original or royalty-free.\n6. Each participant may submit only one entry.\n7. Plagiarised or previously submitted entries will be disqualified.\n8. Results announced on the result date; decision of judges is final.",
    rewards: [
      { position: 1, label: "1st Winner", amount: 550 },
      { position: 2, label: "2nd Winner", amount: 300 },
      { position: 3, label: "3rd Winner", amount: 240 },
      { position: 4, label: "4th Winner", amount: 200 },
      { position: 5, label: "5th Winner", amount: 130 },
      { position: 6, label: "6th Winner", amount: 80 },
    ],
    previousWinners: [
      {
        name: "Riya Shah",
        photoUrl: "https://randomuser.me/api/portraits/women/65.jpg",
        position: 1,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        name: "Aarav Mehta",
        photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        position: 1,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        name: "Neha Verma",
        photoUrl: "https://randomuser.me/api/portraits/women/21.jpg",
        position: 2,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        name: "Ishita Chopra",
        photoUrl: "https://randomuser.me/api/portraits/women/83.jpg",
        position: 3,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
    disclaimers: [
      "Only contributions from paid participants will be considered for judging.",
      "Prize amounts are subject to TDS deductions as per applicable law.",
    ],
    status: "published",
  });
  console.log("[Seed] Competition created:", competition._id.toString());

  // Seed 20 users (more than totalSpots — good for load test)
  const users = [];
  for (let i = 1; i <= 20; i++) {
    users.push({
      name: `Test User ${i}`,
      email: `user${i}@test.com`,
      referralCode: `REF${String(i).padStart(4, "0")}`,
    });
  }
  const createdUsers = await User.create(users);
  console.log(`[Seed] Created ${createdUsers.length} users.`);

  // Pre-register User 1 (so one spot is already booked, matching spotsBooked: 1)
  await Registration.create({
    competitionId: competition._id,
    userId: createdUsers[0]._id,
    entryFeePaid: competition.entryFee,
    paymentId: "seed_payment_001",
  });
  console.log(`[Seed] Pre-registered user: ${createdUsers[0].email}`);

  console.log("\n=== Seed complete ===");
  console.log("Competition ID:", competition._id.toString());
  console.log("Login emails:  user1@test.com .. user20@test.com");
  console.log("Referral codes: REF0001 .. REF0020");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Error:", err);
  process.exit(1);
});
