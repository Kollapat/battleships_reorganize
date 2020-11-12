const { timeStamp } = require('console');

let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.send(req.headers['x-forwarded-for']);
})

app.get('/test', (req, res) => {
  console.log(req.headers['x-forwarded-for']);
  res.send('OK');
})

http.listen(process.env.PORT || 7000, '0.0.0.0', () => {
  console.log('Listening on localhost:7000');
});

let onlineList = [];
let roomList = [];

io.on('connection', socket => {
  console.log('someone connected')

  socket.on('login', username => {
    let isExist = false;
    for (let each of onlineList) {
      if (each.name === username) {
        isExist = true;
        socket.emit('username exists');
        break;
      }
    }
    if (!isExist) {
      onlineList = onlineList.filter(user => {
        if (user.id != socket.id) return true;
      })
      let userData = {
        id: socket.id,
        name: username
      }
      onlineList.push(userData);
      console.log(onlineList)
      io.emit('update list', onlineList);
    }
  })

  socket.on('disconnecting', () => {
    onlineList = onlineList.filter(user => {
      if (user.id !== socket.id) return true
    })

    //let currentRoom = getRoom(socket.id);
    //socket.broadcast.to(currentRoom).emit('enemy disconnect');
    //console.log(onlineList);
  })

  socket.on('connectt', player => {
    let enemyId;
    for (let each of onlineList) {
      if (each.name === player[1]) {
        enemyId = each.id;
        break;
      }
    }
    let roomName = player[0] + player[1];
    socket.join(roomName); //I join
    //const rand = Boolean(Math.round(Math.random()));
    roomList.push({
      roomName: roomName,
      player: [player[0]],
      LastWinner: ''
    })
    //console.log(roomList);
    io.to(enemyId).emit('inform room', roomName, player[0]);

  })

  socket.on('joinRoom', data => {
    socket.join(data.room); // enemy join
    for (let each of roomList) {
      if (each.roomName === data.room) {
        each.player.push(data.name);
      }
      break;
    }
    console.log(roomList);
    io.to(data.room).emit('start the game', data.room);
  })

  socket.on('check connection', roomName => {
    var clientList = io.sockets.clients(roomName);
    var numOfClients = clientList.length;



  })

  // Handle a socket connection request from web client
  //const connections = [null, null]

  // Find an available player number
  /*let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }*/

  //socket.emit('player-number', playerIndex)
  function getRoom(name) {
    let result = '';
    for (let each of roomList) {
      if (each['player'].includes(name)) {
        result += each.roomName;
      }
    }
    return result
  }



  // On Ready
  socket.on('player-ready', name => {
    let currentRoom = getRoom(name);
    //console.log(io.sockets.adapter.rooms)
    for (let each of roomList) {
      if (each.roomName === currentRoom) {
        if (Object.keys(each).length === 3) {
          each[name] = 0;
          console.log(each);
        } else {
          each[name] = 0;
          console.log(each);
          if (each.LastWinner === '') {
            let rand = Math.round(Math.random());
            if (rand === 1) {
              socket.emit('start-game', 'first');
              socket.broadcast.to(currentRoom).emit('start-game', 'wait');
            } else {
              socket.emit('start-game', 'wait');
              socket.broadcast.to(currentRoom).emit('start-game', 'first');
            }
          } else {
            io.to(currentRoom).emit('start-game again', each.LastWinner);
          }
        }
      }
      break;
    }
  })

  socket.on('play again', name => {
    socket.join()
    let currentRoom = getRoom(name);
    for (let each of roomList) {
      if (each.roomName === currentRoom) {
        for (let key of Object.keys(each)) {
          if (key !== 'roomName' && key !== 'player' && key !== 'LastWinner') {
            delete each[key];
          }
        }
      }
      break;
    }
    console.log(roomList);
    io.to(currentRoom).emit('play again');
  })

  socket.on('disconnect request', name => {
    let currentRoom = getRoom(name);
    roomList = roomList.filter(each => {
      if (each.roomName === currentRoom) {
        return false;
      } else {
        return true;
      }
    })
    console.log(roomList);
    socket.emit('leave game');
    socket.broadcast.to(currentRoom).emit('leave game');
  })

  // Check player connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({ connected: false, ready: false }) : players.push({ connected: true, ready: connections[i] })
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', data => {
    //console.log(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    console.log('send to other in room ' + getRoom(data.name) + 'that i fired')
    socket.broadcast.to(getRoom(data.name)).emit('fired', data.pos)
  })

  // on Fire Reply
  socket.on('fire-reply', data => {
    //console.log(square)

    // Forward the reply to the other player
    socket.broadcast.to(getRoom(data.name)).emit('fire-reply', data.square)
  })

  socket.on('update score', name => {
    let currentRoom = getRoom(name);
    for (let each of roomList) {
      if (each.roomName === currentRoom) {
        each[name] += 1;
        each.LastWinner = name;
      }
      break;
    }
    console.log(roomList);
    io.to(currentRoom).emit('update score', name);
  })

  socket.on('connect again', name => {
    let currentRoom = getRoom(name);
    socket.join(currentRoom);
  })

  // Timeout connection
  setTimeout(() => {
    //connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minute limit per player
});