const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const db = require("./config/db");

// Core tables must exist before advanced schema / foreign keys
require("./models/user");
require("./models/post");
require("./models/advanced");

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for dev
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Pass io to routes via req.app.get('io')
app.set("io", io);

app.use(cors());
app.use(express.json());
// Expose uploads directory
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", require("./routes/messages"));
app.use("/api/eco-assistant", require("./routes/ecoAssistant"));
app.use("/api/sustainability", require("./routes/sustainability"));
app.use("/api/checkout", require("./routes/checkout"));

app.get("/", (req, res) => {
  res.send("SocialHub API with WebSockets is running");
});

// Real-time connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Register the user to a private room based on their DB ID
  socket.on("register", (userId) => {
    if (userId) {
        socket.join(userId.toString());
        socket.broadcast.emit("user_status", { userId, status: "online" });
    }
  });

  // Handle direct messages
  socket.on("send_message", (data) => {
     const { sender_id, receiver_id, content } = data;
     if (!sender_id || !receiver_id || !content) return;
     
     // Persist asynchronously
     db.run(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
        [sender_id, receiver_id, content],
        function(err) {
           if (err) return console.error("Message save error:", err);
           
           const newMsg = { 
              id: this.lastID, sender_id, receiver_id, content, 
              created_at: new Date().toISOString() 
           };
           
           // Emit to the receiver if online
           io.to(receiver_id.toString()).emit("receive_message", newMsg);
           // Emit back to sender (useful for syncing multiple tabs of same user)
           io.to(sender_id.toString()).emit("receive_message", newMsg);
        }
     );
  });

  // Broadcast when a user types
  socket.on("typing", (data) => {
    if (data.receiver_id) {
        io.to(data.receiver_id.toString()).emit("user_typing", data);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
