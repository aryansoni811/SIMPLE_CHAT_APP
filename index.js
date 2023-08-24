
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
    const msg_string = JSON.stringify(msg['message']).slice(1, -1);
    console.log(`message sent is ${msg_string}`);
    if(msg_string.startsWith('/')){
      socket.emit('chat message', msg);
    }
    else 
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
