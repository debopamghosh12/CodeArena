const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"], 
    required: true,
  },
  testCases: [
    {
      input: String,
      output: String,
    },
  ],
});

module.exports = mongoose.model("Question", QuestionSchema);