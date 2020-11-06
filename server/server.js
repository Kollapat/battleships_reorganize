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
  console.log('someone connect')

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
            if(user.id != socket.id) return true
        })
        let userData = {
            id: socket.id,
            name: username
        }
        onlineList.push(userData);
        console.log(onlineList)
        io.emit('update list', onlineList)
      }
  })

  socket.on('disconnecting', () => {
         onlineList = onlineList.filter(user => {
             if(user.id !== socket.id) return true
         })
         console.log(onlineList);
  })

  socket.on('connect', player => { //I choose enemy
      let enemyId;
      for(let each of onlineList){
          if(each.name === player[1]) {
              enemyId = each.id;
              break;
          }
      }
      let roomName = player[0] + player[1];
      socket.join(roomName); //I join
      io.to(enemyId).emit('informRoom', roomName); //tell enemy to join
  })

  socket.on('joinRoom', roomName => {
      socket.join(roomName); // enemy join

      io.to(roomName).emit('start the game', roomName);
  })
});