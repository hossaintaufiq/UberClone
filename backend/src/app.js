require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const { connectDb } = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST", "PATCH", "PUT"] } });
app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join:ride", (rideId) => socket.join(`ride:${rideId}`));
  socket.on("driver:location", ({ rideId, lat, lng, driverId }) => {
    io.to(`ride:${rideId}`).emit("driver:location", { lat, lng, driverId });
  });
  socket.on("ride:status", ({ rideId, status }) => {
    io.to(`ride:${rideId}`).emit("ride:status", { status });
  });
});

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api", (_, res) => res.json({ app: "Transitely API", stack: "MERN", status: "running" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/riders", require("./routes/riders"));
app.use("/api/users", require("./routes/riders"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/rides", require("./routes/rides"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/admin", require("./routes/admin"));

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` }));

const port = Number(process.env.PORT || 5000);
connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`Backend running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

module.exports = { app, server, io };
