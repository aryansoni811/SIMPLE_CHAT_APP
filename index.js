const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { createCipheriv, randomBytes, createDecipheriv } = require("crypto");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const key = () => {
  return randomBytes(32);
};
const iv = () => {
  return randomBytes(16);
};

const encryptMessage = (normalMesage) => {
  const cipher = createCipheriv("aes256", key(), iv());
  const newMessage =
    cipher.update(normalMesage, "utf8", "hex") + cipher.final("hex");

  return newMessage;
};

mongoose.connect(
  "mongodb+srv://arpitsoni811:mern_chat1234@cluster0.gcrpcuk.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  encryptedMessage: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("user joined", (username) => {
    socket.username = username;
    io.emit("user joined", username);
  });

  socket.on("chat message", (msg) => {
    const message = {
      username: socket.username,
      message: msg.message,
      encryptedMessage: encryptMessage(msg.message),
    };

    const newMessage = new Message(message);

    let msg_string = JSON.stringify(msg["message"]).slice(1, -1);
    if (msg_string.startsWith("/")) {
      socket.emit("chat message", msg);
    } else {
      io.emit("chat message", message);
    }

    // Use the promise returned by save
    newMessage
      .save()
      .then((savedMessage) => {
        console.log("Message saved to MongoDB:", savedMessage);
      })
      .catch((error) => {
        console.error("Error saving message to MongoDB:", error);
      });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      console.log(`User ${socket.username} disconnected`);
      io.emit("user left", socket.username);
    }
  });
});

server.listen(4000, () => {
  console.log("Server listening on *:4000");
});
