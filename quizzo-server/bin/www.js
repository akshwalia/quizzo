#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('quizzo-server:server');
var http = require('http');

const { GoogleGenerativeAI } = require("@google/generative-ai");
var dotenv = require('dotenv');
dotenv.config();

const { Server } = require('socket.io');



/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('a user connected');


  socket.on('create_room', ({ roomId, hostName }) => {
    if (rooms.has(roomId)) {
      socket.emit('room_error', { message: 'Room already exists' });
      return;
    }

    // Create new room
    rooms.set(roomId, {
      host: socket.id,
      hostName,
      hasStarted: false,
      players: [{
        id: socket.id,
        name: hostName,
        isHost: true
      }],
      settings: {
        topic: "",
        customTopic: "",
        duration: 2,
        questions: 10,
        difficulty: "",
      }
    });

    // Join the room
    socket.join(roomId);

    console.log('Room created:', roomId, " By: ", hostName);

    // Send confirmation to the host
    const room = rooms.get(roomId);

    socket.emit('room_created', {
      roomId,
      players: room.players,
      settings: room.settings,
      isHost: true
    });
  });

  socket.on('join_room', ({ roomId, playerName }) => {
    const room = rooms.get(roomId);


    if (!room) {
      socket.emit('room_error', { message: 'Room does not exist' });
      return;
    }

    if(room.hasStarted) {
      socket.emit('room_error', { message: 'Game has already started' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      isHost: false
    });

    // Join the socket room
    socket.join(roomId);

    console.log('Player joined:', playerName);
    io.to(roomId).emit('player_joined', {
      players: room.players,
      playerName: playerName
    });

    // Send room data to the joining player
    socket.emit('joined_room', {
      roomId,
      players: room.players,
      settings: room.settings,
      isHost: false
    });

    socket.to(roomId).emit('player_joined', {
      players: room.players,
      playerName: playerName
    });
  });

  socket.on('update_settings', ({ roomId, field, value }) => {
    const room = rooms.get(roomId);
    // Check if user is host


    if (room.host !== socket.id) {
      socket.emit('room_error', { message: 'You are not the host' });
      return;
    };

    const settings = room.settings;
    settings[field] = value;
    room.settings = settings;

    socket.to(roomId).emit('settings_updated', {
      settings
    });
  });

  socket.on("start_quiz", async ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room.host !== socket.id) {
      socket.emit('room_error', { message: 'You are not the host' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('room_error', { message: 'Not enough players' });
      return;
    }

    room.hasStarted = true;

    io.to(roomId).emit('loading');


    const n = room.settings.questions;
    const topic = room.settings.topic==="Other"?room.settings.customTopic:room.settings.topic;
    const difficulty = room.settings.difficulty;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Give me ${n} questions based on ${topic}, each with four options, one correct options, and in string format, the format should be such that I can convert it to json directly in node.js using .json function, do not give any extra explanation text, just the questions, optionss and the correct option for each. And if ${topic} doesn't make sense. Just return a json throwing an error. The output should contains fields named options, correct_option, question. Difficulty level should be ${difficulty}.`;

    let result = await model.generateContent(prompt);

    let responseText = await result.response.text();

    let resString = responseText.slice(8, -3);

    let resJSON = JSON.parse(resString);

    console.log(resJSON);

    io.to(roomId).emit('quiz_started', {
      questions: resJSON
    });

    room.startTime = Date.now();
  });

  socket.on("quiz_completed", ({ roomId, score}) => {
    const room = rooms.get(roomId);

    const playerIndex = room.players.findIndex(player => player.id === socket.id);

    room.leaderboard = room.leaderboard || [];

    room.leaderboard.push({
      name: room.players[playerIndex].name,
      score: score,
      time: (Date.now() - room.startTime)/1000
    });

    room.leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time - b.time;
    });
    

    io.to(roomId).emit('leaderboard_updated', {
      leaderboard: room.leaderboard
    });

    if (room.leaderboard.length === room.players.length) {
      io.to(roomId).emit('quiz_over', {
        leaderboard: room.leaderboard
      })
    };
  })

  socket.on("play_again", ({ roomId }) => {
    const room = rooms.get(roomId);
    room.hasStarted = false;
    room.leaderboard = [];
    io.to(roomId).emit('play_again');
  });

  socket.on('disconnect', () => {
    // Remove player from any room they were in
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(player => player.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        if (room.host === socket.id) {
          io.to(roomId).emit('host_left');
          console.log("Room deleted: ", roomId);
          rooms.delete(roomId);
        } else {
          // Notify remaining players about the disconnection
          io.to(roomId).emit('player_left', {
            players: room.players,
            playerName: player.name
          });
          console.log("Player left: ", player.name);
        }
      }
    });
  });
});