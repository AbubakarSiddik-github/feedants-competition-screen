const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const Competition = require("../models/Competition");
const Registration = require("../models/Registration");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const { getPhaseInfo, getCtaState } = require("../utils/competitionPhase");

// Rate limiter specifically for registration — cheap protection against double-tap
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many registration attempts. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------------------------------------------------------------
// GET /api/competitions/:id
// Public (anonymous visitors can view). Auth is optional — when present, per-
// user state (isRegistered, hasSubmitted) is folded in.
// ---------------------------------------------------------------------------
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id).lean();
    if (!competition) return res.status(404).json({ error: "Competition not found" });

    const phaseInfo = getPhaseInfo(competition);
    const { registrationOpen, submissionOpen, resultsDeclared, spotsLeft } = phaseInfo;

    let isRegistered = false;
    let hasSubmitted = false;

    if (req.user) {
      isRegistered = !!(await Registration.exists({
        competitionId: competition._id,
        userId: req.user.id,
        status: "confirmed",
      }));
      hasSubmitted = !!(await Submission.exists({
        competitionId: competition._id,
        userId: req.user.id,
      }));
    }

    const cta = getCtaState(
      { registrationOpen, submissionOpen, resultsDeclared, spotsLeft },
      { isRegistered, hasSubmitted },
      competition
    );

    res.json({
      ...competition,
      spotsLeft,
      registrationOpen,
      submissionOpen,
      resultsDeclared,
      isRegistered,
      hasSubmitted,
      cta,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/competitions/:id/register
// The atomic spot-reservation endpoint.
//
// Concurrency safety:
//   findOneAndUpdate with { $expr: { $lt: ["$spotsBooked", "$totalSpots"] } }
//   makes the "spots available?" check and the $inc happen as a single atomic
//   document write.  Two simultaneous requests can't both read spotsLeft > 0
//   and both increment — whichever write lands first wins; the second sees
//   the updated count and gets null back.
//   The unique index on (competitionId, userId) is a second backstop in case
//   the client fires twice before the first response arrives.
// ---------------------------------------------------------------------------
router.post("/:id/register", requireAuth, registerLimiter, async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return res.status(404).json({ error: "Competition not found" });

    const { registrationOpen } = getPhaseInfo(competition);
    if (!registrationOpen) {
      return res.status(400).json({ error: "Registration is closed" });
    }

    // Pre-flight duplicate check (fast path before touching spotsBooked)
    const already = await Registration.exists({
      competitionId: competition._id,
      userId: req.user.id,
    });
    if (already) return res.status(409).json({ error: "Already registered" });

    // Validate referral code if provided
    const { referralCode } = req.body;
    if (referralCode) {
      if (referralCode === req.user.referralCode) {
        return res.status(400).json({ error: "You cannot use your own referral code" });
      }
      const codeOwner = await User.findOne({ referralCode });
      if (!codeOwner) {
        return res.status(400).json({ error: "Referral code does not exist" });
      }
    }

    // Atomic: increment spotsBooked only if a spot is still available
    const updated = await Competition.findOneAndUpdate(
      {
        _id: competition._id,
        $expr: { $lt: ["$spotsBooked", "$totalSpots"] },
      },
      { $inc: { spotsBooked: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ error: "No spots left" });
    }

    try {
      const registration = await Registration.create({
        competitionId: competition._id,
        userId: req.user.id,
        entryFeePaid: competition.entryFee,
        paymentId: `sim_${Date.now()}`, // Simulated — no real Razorpay yet
        referralCodeUsed: referralCode || null,
      });

      return res.status(201).json({
        registration,
        spotsLeft: updated.totalSpots - updated.spotsBooked,
      });
    } catch (err) {
      if (err.code === 11000) {
        // Unique index backstop — race condition caught at DB level
        return res.status(409).json({ error: "Already registered" });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/competitions/:id/submissions
// ---------------------------------------------------------------------------
router.post("/:id/submissions", requireAuth, async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id).lean();
    if (!competition) return res.status(404).json({ error: "Competition not found" });

    const { submissionOpen, submissionStart, submissionEnd } = (() => {
      const p = getPhaseInfo(competition);
      return {
        submissionOpen: p.submissionOpen,
        submissionStart: competition.submissionStart,
        submissionEnd: competition.submissionEnd,
      };
    })();

    if (!submissionOpen) {
      const now = new Date();
      if (now < submissionStart) {
        return res.status(400).json({
          error: `Submission window hasn't opened yet. It opens on ${submissionStart.toISOString()}.`,
        });
      }
      return res.status(400).json({
        error: `Submission window closed on ${submissionEnd.toISOString()}.`,
      });
    }

    // Must be registered
    const isRegistered = !!(await Registration.exists({
      competitionId: competition._id,
      userId: req.user.id,
      status: "confirmed",
    }));
    if (!isRegistered) {
      return res.status(403).json({
        error: "You must be registered to submit",
      });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Submission content is required" });
    }

    // Upsert — allows re-submission within the window
    const submission = await Submission.findOneAndUpdate(
      { competitionId: competition._id, userId: req.user.id },
      { content: content.trim(), submittedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/competitions/:id/winners
// ---------------------------------------------------------------------------
router.get("/:id/winners", async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .select("previousWinners title")
      .lean();
    if (!competition) return res.status(404).json({ error: "Competition not found" });

    res.json({
      competitionId: competition._id,
      title: competition.title,
      winners: competition.previousWinners,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/competitions — list all published competitions (bonus utility)
// ---------------------------------------------------------------------------
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const competitions = await Competition.find({ status: "published" })
      .select("title category type prizePool entryFee totalSpots spotsBooked registrationDeadline")
      .lean();
    res.json(competitions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
