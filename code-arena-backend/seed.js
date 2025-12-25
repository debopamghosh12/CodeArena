require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");
const fs = require("fs");

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected for Seeding..."))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// Read JSON file
const importData = async () => {
  try {
    // Read the file
    const data = fs.readFileSync("./questions.json", "utf-8");
    const questions = JSON.parse(data);

    // Delete old questions (Optional: Jodi clear kore notun dite chas)
    // await Question.deleteMany(); 
    // console.log("🧹 Old Questions Removed...");

    // Insert new questions
    await Question.insertMany(questions);
    console.log(`🎉 Successfully Imported ${questions.length} Questions!`);

    process.exit(); // Kaj sesh, script bondho
  } catch (error) {
    console.error("❌ Error with Data Import:", error);
    process.exit(1);
  }
};

importData();