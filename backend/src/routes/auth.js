const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/auth/login
// Accepts { email } — no password needed for this minimal auth demo.
// Returns a JWT with { id, name, email, referralCode }.
router.post("/login", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
