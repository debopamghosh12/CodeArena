const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ek naame dujon thakbe na
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  wins: {
    type: Number,
    default: 0, // Surute 0 win
  },
  matchesPlayed: {
    type: Number,
    default: 0,
  }
});

module.exports = mongoose.model("User", UserSchema);