require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const competitionRoutes = require("./routes/competitions");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// Socket.io — stretch goal: real-time spotsLeft push
// ---------------------------------------------------------------------------
const io = new Server(server, {
  cors: { origin: "*" },
});

// Attach io to app so routes can emit events
app.set("io", io);

io.on("connection", (socket) => {
  console.log("[Socket.io] Client connected:", socket.id);

  socket.on("join_competition", (competitionId) => {
    socket.join(`competition:${competitionId}`);
  });

  socket.on("disconnect", () => {
    console.log("[Socket.io] Client disconnected:", socket.id);
  });
});

// Export emitter helper for use in route handlers
function emitSpotsUpdate(competitionId, spotsLeft) {
  io.to(`competition:${competitionId}`).emit("spots_update", {
    competitionId,
    spotsLeft,
  });
}
app.set("emitSpotsUpdate", emitSpotsUpdate);

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);

// Centralized error handler — must be last
app.use(errorHandler);

// ---------------------------------------------------------------------------
// DB + server boot
// ---------------------------------------------------------------------------
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[MongoDB] Connected to Atlas");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`[Server] Listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[Startup] Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

start();

module.exports = { app, server };
