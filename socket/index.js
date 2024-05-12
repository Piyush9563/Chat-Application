// import { Server } from "socket.io";
// import dotenv from "dotenv";

// dotenv.config();

// const port = process.env.PORT || 5000;

// const io = new Server({
  
// });

// let onlineUsers = [];

// io.on("connection", (socket) => {
//   console.log("new connection", socket.id);

//   // listen to a connection
//   socket.on("addNewUser", (userId) => {
//     !onlineUsers.some((user) => user.userId === userId) &&
//       onlineUsers.push({
//         userId,
//         socketId: socket.id,
//       });

//     console.log("onlineUsers", onlineUsers);

//     io.emit("getOnlineUsers", onlineUsers);
//   });

//   // add message
//   socket.on("sendMessage", (message) => {
//     const user = onlineUsers.find(
//       (user) => user.userId === message.recipientId
//     );

//     if (user) {
//       io.to(user.socketId).emit("getMessage", message);
//       io.to(user.socketId).emit("getNotification", {
//         senderId: message.senderId,
//         isRead: false,
//         date: new Date(),
//       });
//     }
//   });

//   socket.on("disconnect", () => {
//     onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

//     io.emit("getOnlineUsers", onlineUsers);
//   });
// });

// io.listen(port);

import { Server } from "socket.io";
import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5173;

const server = http.createServer();
const io = new Server(server);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = mongoose.model("User", userSchema);

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  // listen to a connection
  socket.on("addNewUser", (userId, username) => {
    if (!onlineUsers.some((user) => user.userId === userId)) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
        username,
      });

      console.log("onlineUsers", onlineUsers);

      io.emit("getOnlineUsers", onlineUsers);
    }
  });

  // add message
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );

    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId: message.senderId,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

    io.emit("getOnlineUsers", onlineUsers);
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

