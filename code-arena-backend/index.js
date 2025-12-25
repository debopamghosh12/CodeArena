require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const compileRoutes = require("./routes/compile");
const userRoutes = require("./routes/userRoutes");
const Question = require("./models/Question");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// ➤ KEEP-ALIVE ROUTE (For Cron-job.org)
app.get("/ping", (req, res) => {
  res.status(200).send("PONG! I am awake! 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/compile", compileRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*", methods: ["GET", "POST"] } 
});

// ➤ DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Error:", err));

const roomState = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // ➤ JOIN ROOM & LOAD QUESTION
  socket.on("join_room", async ({ room, difficulty }) => {
    socket.join(room);
    
    if (!roomState[room]) {
      console.log(`🔎 Finding ${difficulty} question for Room: ${room}`);
      try {
        // Find question based on difficulty
        const count = await Question.countDocuments({ difficulty: difficulty });
        
        let randomQ;
        if (count > 0) {
          const random = Math.floor(Math.random() * count);
          randomQ = await Question.findOne({ difficulty: difficulty }).skip(random);
        } else {
          // Fallback if that difficulty has no questions
          randomQ = await Question.findOne(); 
        }

        roomState[room] = { 
          problem: randomQ, 
          startTime: Date.now() 
        };
      } catch (err) {
        console.error("❌ Error fetching question:", err);
      }
    }

    // Send question to everyone in the room
    io.to(room).emit("load_question", roomState[room]);
  });

  // ➤ LIVE CHAT LOGIC
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // ➤ CODE SYNC LOGIC
  socket.on("send_code", (data) => {
    socket.to(data.room).emit("receive_code", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`);
});