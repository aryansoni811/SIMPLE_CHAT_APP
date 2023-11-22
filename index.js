
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user joined', (username) => {
    socket.username = username;
    io.emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      console.log(`User ${socket.username} disconnected`);
      io.emit('user left', socket.username);
    }
  });
});

server.listen(4000, () => {
  console.log('Server listening on *:4000');
});
