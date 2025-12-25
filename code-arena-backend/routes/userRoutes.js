const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ➤ GET LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find().sort({ wins: -1 }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ➤ UPDATE SCORE (Win Logic)
router.post("/win", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.wins += 1;
    user.matchesPlayed += 1;
    await user.save();

    res.json({ msg: "Score Updated!", wins: user.wins });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;