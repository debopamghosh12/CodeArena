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

app.use("/api/auth", authRoutes);
app.use("/api/compile", compileRoutes);
app.use("/api/users", userRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ DB Error:", err));

const roomState = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_room", async ({ room, difficulty }) => {
    socket.join(room);
    
    if (!roomState[room]) {
      try {
        const count = await Question.countDocuments();
        const random = Math.floor(Math.random() * count);
        let randomQ = await Question.findOne().skip(random);

        if (!randomQ) {
            randomQ = {
                title: "Emergency Mission",
                description: "Database is empty.",
                testCases: [{input: "", output: "Hello World"}]
            };
        }
        roomState[room] = { problem: randomQ };
      } catch (err) {
        console.error("❌ Error fetching question:", err);
      }
    }
    io.to(room).emit("load_question", roomState[room]);
  });

  // ➤ CHAT LOGIC START
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
  // ➤ CHAT LOGIC END

  socket.on("send_code", (data) => socket.to(data.room).emit("receive_code", data));
  socket.on("disconnect", () => console.log("User Disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`));