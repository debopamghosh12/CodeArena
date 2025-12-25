require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth"); 
const compileRoutes = require("./routes/compile");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Allow Vercel to talk to Backend
app.use(cors({ origin: "*" })); 
app.use(express.json());

app.use("/api/auth", authRoutes); 
app.use("/api/compile", compileRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // 🔥 IMPORTANT: ETA CHANGE KORLAM
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

const roomState = {};
const Question = require("./models/Question"); // Ensure Model is imported

io.on("connection", (socket) => {
  
  socket.on("join_room", async ({ room, difficulty }) => {
    socket.join(room);
    
    const level = difficulty || "easy";

    if (!roomState[room]) {
      try {
        const count = await Question.countDocuments({ difficulty: level });
        let randomQ;
        if (count > 0) {
            const random = Math.floor(Math.random() * count);
            randomQ = await Question.findOne({ difficulty: level }).skip(random);
        } else {
            const total = await Question.countDocuments();
            const random = Math.floor(Math.random() * total);
            randomQ = await Question.findOne().skip(random);
        }

        roomState[room] = {
          problem: randomQ,
          startTime: Date.now(),
        };
      } catch (err) {
        console.error("Error fetching question:", err);
      }
    }

    io.to(room).emit("load_question", roomState[room]);
  });

  socket.on("send_code", (data) => socket.to(data.room).emit("receive_code", data));
  socket.on("disconnect", () => console.log("User Disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`);
});