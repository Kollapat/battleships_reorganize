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

io.on('connection', socket => {
  console.log('someone connected')

  socket.on('login', username => {
    let isExist = false;
    for(let each of onlineList) {
        if(each.name === username){
            isExist = true;
            socket.emit('username exists');
            break;
        }
    }
    if(!isExist) {
        onlineList = onlineList.filter(user => {
            if(user.id != socket.id) return true;
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
             if(user.id !== socket.id) return true
         })
         //console.log(onlineList);
  })

  socket.on('connectt', player => {
    let enemyId;
    for(let each of onlineList){
        if(each.name === player[1]) {
            enemyId = each.id;
            break;
        }
    }
    let roomName = player[0] + player[1];
    socket.join(roomName); //I join
    const rand = Boolean(Math.round(Math.random()));
    io.to(enemyId).emit('inform room', roomName, player[0], rand);
    
  })

  socket.on('joinRoom', roomName => {
      socket.join(roomName); // enemy join
      io.to(roomName).emit('start the game', roomName);
  })

  // Handle a socket connection request from web client
  const connections = [null, null]

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // On Ready
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // Check player connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', id => {
    console.log(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    socket.broadcast.emit('fire', id)
  })

  // on Fire Reply
  socket.on('fire-reply', square => {
    console.log(square)

    // Forward the reply to the other player
    socket.broadcast.emit('fire-reply', square)
  })

  // Timeout connection
  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minute limit per player
});