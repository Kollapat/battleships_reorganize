var socket = io.connect('localhost:7000')

socket.on('update list', onlineList => {
  console.log("updated list");
  var playersArray = [];
  for(i=0; i<onlineList.length; i++) {
    var x = onlineList[i].name;
    playersArray.push(x);

  }
  console.log(playersArray);
  getTable(playersArray);
  
})

socket.on('inform room', (roomName, enemyName, start1st) => {
  console.log("informed");
  window.localStorage.setItem("player2Name", enemyName);
  socket.emit('joinRoom', roomName);
})

socket.on('start the game', roomName => {
  location.href = "/multiplayer.html";
})

var isDupluicated = false;
socket.on('username exists', () => {
  isDupluicated = true;
})

//SOUND EFFECTS
  
function playBoomSound() {
  var boomaudio =  document.getElementById("boomSound");
  boomaudio.volume = 0.2;
  boomaudio.play();
}

function playMissSound() {
  var missaudio =  document.getElementById("missSound");
  missaudio.volume = 0.5;
  missaudio.play();
}

//LOBBY NAME LOGIC
var username = "";

function saveUsername() {
  username = document.getElementById('username-input').value;
  window.localStorage.setItem("player1Name", username);
  socket.emit('login', localStorage.getItem("player1Name"));

  if (username == "") {
    alert("Please enter a valid username");
    document.getElementById("welcomeMessage").innerHTML = "Please enter a valid username";
  } else if(isDupluicated) {
    alert("Username alreay taken!");
    document.getElementById("welcomeMessage").innerHTML = "Please enter a valid username";
  } else {
    var nameMessage = "Welcome to Battleship, " + username +"!";
    document.getElementById("welcomeMessage").innerHTML = nameMessage;
    socket.emit('login', localStorage.getItem("player1Name"));
  }  
}

function changeBoard()
{ var s = document.getElementById("foo").className;
  if(s=='battleship-grid grid-user'){
    document.getElementById('foo').setAttribute("class", "battleship-grid1 grid-user1");
    document.getElementById('foo1').setAttribute("class", "battleship-grid1 grid-computer1");
  }else{
    document.getElementById('foo').setAttribute("class", "battleship-grid grid-user");
    document.getElementById('foo1').setAttribute("class", "battleship-grid grid-computer");
  }
  
}

//DYNAMIC PLAYER LOBBY TABLE

function getTable(input) { 
  var table = document.getElementById("players");

  while(table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }

  for(i=0; i<input.length; i++) {
    console.log(input[i]);
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = input[i];
    if (input[i] != username) {
        var connectParameter = input[i];
        cell2.innerHTML = '<a class="btn connect-btn" onclick="connect(\''+connectParameter+'\')">Connect & Play</a>';
    } else {
        cell2.innerHTML = "This is you!"
    }
  }
}

//CONNECT AND PLAY

function connect(choice) {
  if (username == "") {
    alert("Please enter a username first!");
  } else {
    window.localStorage.setItem("player2Name", choice);
    console.log(window.localStorage.getItem("player1Name"));
    let pair  = [window.localStorage.getItem("player1Name"), choice];
    console.log(pair);
    socket.emit('connectt', pair);
  } 
}

function getPlayerOneName() {
  playerOneName = window.localStorage.getItem("player1Name");
  document.getElementById("playerOneName").innerHTML = playerOneName;  
}

function getPlayerTwoName() {
    playerTwoName = window.localStorage.getItem("player2Name")
document.getElementById("playerTwoName").innerHTML = playerTwoName;  
}

function disconnect() {
  location.href= '/lobby.html'
  window.localStorage.removeItem("player1Name");
  username = "";
}

// Background Music
function playMusic() {
  let audio = document.getElementById("backgroundMusic");

  if(audio.paused) {
    audio.play();
    audio.value = 0.5;
    document.getElementById("playMusicButton").innerHTML = "Pause Background Music";
  } else {
    audio.pause();
    document.getElementById("playMusicButton").innerHTML = "Play Background Music";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const destroyer = document.querySelector('.destroyer-container')
  const submarine = document.querySelector('.submarine-container')
  const cruiser = document.querySelector('.cruiser-container')
  const battleship = document.querySelector('.battleship-container')
  const startButton = document.querySelector('#start')
  const playagainButton = document.querySelector('#playagain')
  const rotateButton = document.querySelector('#rotate')
  const turnDisplay = document.querySelector('#whose-go')
  const infoDisplay = document.querySelector('#info')
  const player1ScoreDisplay = document.querySelector('#scorePlayer1')
  const player2ScoreDisplay = document.querySelector('#scorePlayer2')
  const setupButtons = document.getElementById('setup-buttons')
  const userSquares = []
  const computerSquares = []
  let isHorizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  const width = 8
  let playerNum = 0
  let ready = false
  let enemyReady = false
  let allShipsPlaced = false
  let shotFired = -1
  let score1 = 0
  let score2 = 0
  let notAllowedHorizontal = [0,1,2,8,9,10,16,17,18,24,25,26,32,33,34,40,41,42,48,49,50,56,57,58,64]
  let notAllowedVertical = [43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66]

  //Ships
  const shipArray = [
    {
      name: 'destroyer',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'submarine',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'cruiser',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'battleship',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
  ]

  createBoard(userGrid, userSquares)
  createBoard(computerGrid, computerSquares)

  test();

  // Select Player Mode
  if (gameMode === 'singlePlayer') {
    startSinglePlayer()
  } else {
    startMultiPlayer()
  }

  
  function startMultiPlayer() {
    if (window.localStorage.getItem("Player 1 score") != null) {
      score1 = window.localStorage.getItem("Player 1 score");
      score2 = window.localStorage.getItem("Player 2 score");
    }
    player1ScoreDisplay.innerHTML = score1
    player2ScoreDisplay.innerHTML = score2

    if(!enemyReady) turnDisplay.style.display = 'none' // Hide 'your go' message

    // Get your player number
    socket.on('player-number', num => {
      if (num === -1) {
        infoDisplay.innerHTML = "Sorry, the server is full"
      } else {
        playerNum = parseInt(num)
        if(playerNum === 1) currentPlayer = "enemy"

        console.log(playerNum)

        // Get other player status
        socket.emit('check-players')
      }
    })

    // Another player has connected or disconnected
    socket.on('player-connection', num => {
      console.log(`Player number ${num} has connected or disconnected`)
      playerConnectedOrDisconnected(num)
    })

    // On enemy ready
    socket.on('enemy-ready', num => {
      enemyReady = true
      playerReady(num)
      if (ready) {
        playGameMulti(socket)
        setupButtons.style.display = 'none'
      }
    })

    // Check player status
    socket.on('check-players', players => {
      players.forEach((p, i) => {
        if(p.connected) playerConnectedOrDisconnected(i)
        if(p.ready) {
          playerReady(i)
          if(i !== playerReady) enemyReady = true
        }
      })
    })

    // On Timeout
    socket.on('timeout', () => {
      infoDisplay.innerHTML = 'You have reached the 10 minute limit'
    })

    // Ready button click
    startButton.addEventListener('click', () => {
      if(allShipsPlaced) playGameMulti(socket)
      else infoDisplay.innerHTML = "Please place all ships"
    })

    // Setup event listeners for firing
    computerSquares.forEach(square => {
      square.addEventListener('click', () => {
        if(currentPlayer === 'user' && ready && enemyReady) {
          shotFired = square.dataset.id
          socket.emit('fire', shotFired)
        }
      })
    })

    // On Fire Received
    socket.on('fire', id => {
      enemyGo(id)
      const square = userSquares[id]
      socket.emit('fire-reply', square.classList)
      playGameMulti(socket)
    })

    // On Fire Reply Received
    socket.on('fire-reply', classList => {
      revealSquare(classList)
      playGameMulti(socket)
    })

    function playerConnectedOrDisconnected(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .connected`).classList.toggle('active')
      if(parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
    }
  }

  // Single Player
  function startSinglePlayer() {
    generate(shipArray[0])
    generate(shipArray[1])
    generate(shipArray[2])
    generate(shipArray[3])

    if(!allShipsPlaced) turnDisplay.style.display = 'none'

    startButton.addEventListener('click', () => {
      if(allShipsPlaced) {
        setupButtons.style.display = 'none'
        infoDisplay.innerHTML = ""
        turnDisplay.style.display = 'initial'
        playGameSingle()
      } else {
        infoDisplay.innerHTML = "Please place all ships"
      } 
    })

    /* startButton.addEventListener('click', () => {
      if(allShipsPlaced) {
        playGameSingle(socket)
        setupButtons.style.display = 'none'
        infoDisplay.style.display = 'none'
      } 
      else {
        infoDisplay.innerHTML = "Please place all ships"
      }
    }) */
  }

  //Create Board
  function createBoard(grid, squares) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }

  //Draw the computers ships in random locations
  function generate(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    if (randomDirection === 0) direction = 1
    if (randomDirection === 1) direction = 10
    let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

    const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))
    const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
    const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))

    else generate(ship)
  }
  

  //Rotate the ships
  function rotate() {
    if (isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      isHorizontal = false
      // console.log(isHorizontal)
      return
    }
    if (!isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      isHorizontal = true
      // console.log(isHorizontal)
      return
    }
  }
  rotateButton.addEventListener('click', rotate)

  //move around user ship
  ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragover', dragOver))
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
  userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
  userSquares.forEach(square => square.addEventListener('drop', dragDrop))
  userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
    // console.log(selectedShipNameWithIndex)
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
    // console.log(draggedShip)
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
    // console.log('drag leave')
  }

  function dragDrop() {
    let newNotAllowedHorizontal= notAllowedHorizontal.slice()
    let newNotAllowedVertical= notAllowedVertical.slice()
    console.log(newNotAllowedHorizontal)
    let shipNameWithLastId = draggedShip.lastChild.id
    let shipClass = shipNameWithLastId.slice(0, -2)
    console.log(shipClass)
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
    let shipLastId = lastShipIndex + parseInt(this.dataset.id)
    console.log(shipLastId)
    console.log(lastShipIndex) //3 is default since th length is 4

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))
    if(!isHorizontal) shipLastId = shipLastId - 8*selectedShipIndex
    if (isHorizontal) shipLastId = shipLastId - selectedShipIndex
    console.log(shipLastId)

    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) { //obj.indexOf(geoObject.id) > -1
      for (let i=0; i < 4; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === 3) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
      }
      notAllowedHorizontal.push(shipLastId)
      notAllowedHorizontal.push(shipLastId+1)
      notAllowedHorizontal.push(shipLastId+2)
      notAllowedHorizontal.push(shipLastId+3)
      console.dir(newNotAllowedHorizontal)
    //As long as the index of the ship you are dragging is not in the newNotAllowedVertical array! This means that sometimes if you drag the ship by its
    //index-1 , index-2 and so on, the ship will rebound back to the displayGrid.
    } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i=0; i < 4; i++) {
        let directionClass
        if (i === 0) directionClass = 'start'
        if (i === 3) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - 8*selectedShipIndex + width*i].classList.add('taken', 'vertical', directionClass, shipClass)
      }
      notAllowedVertical.push(shipLastId)
      notAllowedVertical.push(shipLastId-8)
      notAllowedVertical.push(shipLastId-16)
      notAllowedVertical.push(shipLastId-24)
    } else return

    displayGrid.removeChild(draggedShip)
    if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
  }

  function dragEnd() {
    // console.log('dragend')
  }
  var t = null;
  var deadline;
  // Game Logic for MultiPlayer
  function playGameMulti(socket) {
    setupButtons.style.display = 'none'
    turnDisplay.style.display = 'initial' // Turn display on
    if(isGameOver) return
    if(!isGameOver){
      if(!ready) {
        socket.emit('player-ready')
        ready = true
        playerReady(playerNum)
      }

      if(enemyReady && allShipsPlaced) {
        if(currentPlayer === 'user') {
          turnDisplay.innerHTML = 'Your Go'
          if (t == null) {
            deadline = new Date(Date.parse(new Date()) + 10 * 1000);
            initializeClock('clockdiv');
          } else {
            resetSeconds();
          }
          
        }
        if(currentPlayer === 'enemy') {
          turnDisplay.innerHTML = "Enemy's Go"
          if (t == null) {
            deadline = new Date(Date.parse(new Date()) + 10 * 1000);
            initializeClock('clockdiv');
          } else {
            resetSeconds();
          }
        }
      }
    }
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready`).classList.toggle('active')
  }

  // SINGLEPLAYER
  function playGameSingle() {
    if (isGameOver) return
    if (currentPlayer === 'user') {
      turnDisplay.innerHTML = 'Your Go'
      computerSquares.forEach(square => square.addEventListener('click', function(e) {
        shotFired = square.dataset.id
        revealSquare(square.classList)
      }))
    }
    if (currentPlayer === 'enemy') {
      turnDisplay.innerHTML = 'Computers Go'
      setTimeout(enemyGo, 1000)
    }
  }

  let destroyerCount = 0
  let submarineCount = 0
  let cruiserCount = 0
  let battleshipCount = 0

  function revealSquare(classList) {
    const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`)
    const obj = Object.values(classList)
    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('cruiser')) cruiserCount++
      if (obj.includes('battleship')) battleshipCount++
      checkForWins();
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
      playBoomSound();
    } else {
      enemySquare.classList.add('miss')
      playMissSound();
    }
    checkForWins()
    currentPlayer = 'enemy'
    if(gameMode === 'singlePlayer') playGameSingle()
  }

  let cpuDestroyerCount = 0
  let cpuSubmarineCount = 0
  let cpuCruiserCount = 0
  let cpuBattleshipCount = 0

  function enemyGo(square) {
    if (gameMode === 'singlePlayer') square = Math.floor(Math.random() * userSquares.length)
    if (!userSquares[square].classList.contains('boom')) {
      const hit = userSquares[square].classList.contains('taken')
      userSquares[square].classList.add(hit ? 'boom' : 'miss')
      if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++
      if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++
      if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++
      if (userSquares[square].classList.contains('battleship')) cpuBattleshipCount++
      if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++
      checkForWins()
    } else if (gameMode === 'singlePlayer') enemyGo()
    currentPlayer = 'user'
    if(!isGameOver) turnDisplay.innerHTML = 'Your Go'
  }

  function checkForWins() {
    if (isGameOver) return;
    let enemy = 'computer'
    if(gameMode === 'multiPlayer') enemy = 'enemy'
    if (destroyerCount === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s destroyer`
      destroyerCount = 10
    }
    if (submarineCount === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s submarine`
      submarineCount = 10
    }
    if (cruiserCount === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s cruiser`
      cruiserCount = 10
    }
    if (battleshipCount === 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}'s battleship`
      battleshipCount = 10
    }
    if (cpuDestroyerCount === 4) {
      infoDisplay.innerHTML = `${enemy.toUpperCase().substring(0,1)+enemy.substring(1)} sunk your destroyer`
      cpuDestroyerCount = 10
    }
    if (cpuSubmarineCount === 4) {
      infoDisplay.innerHTML = `${enemy.toUpperCase().substring(0,1)+enemy.substring(1)} sunk your submarine`
      cpuSubmarineCount = 10
    }
    if (cpuCruiserCount === 4) {
      infoDisplay.innerHTML = `${enemy.toUpperCase().substring(0,1)+enemy.substring(1)} sunk your cruiser`
      cpuCruiserCount = 10
    }
    if (cpuBattleshipCount === 4) {
      infoDisplay.innerHTML = `${enemy.toUpperCase().substring(0,1)+enemy.substring(1)} sunk your battleship`
      cpuBattleshipCount = 10
    }

    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount) === 40) {
      isGameOver = true
      turnDisplay.innerHTML = ''
      infoDisplay.innerHTML = "YOU WIN"
      score1 = score1 + 1;
      player1ScoreDisplay.innerHTML = score1;
      window.localStorage.setItem('Player 1 score', score1);
      gameOver()
    }
    if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount) === 40) {
      isGameOver = true
      xxx=888
      console.log(xxx)
      turnDisplay.innerHTML = ''
      //turnDisplay.style.display = 'none'
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      score2 = score2 + 1;
      player2ScoreDisplay.innerHTML = score2
      window.localStorage.setItem('Player 2 score', score2);
      gameOver()
    }
  }

  function gameOver() {
    document.getElementById('playagain').style.visibility='visible';
    isGameOver = true
    deadline = new Date(Date.parse(new Date()));

    //startButton.removeEventListener('click', playGameSingle)
    //startButton.removeEventListener('click', playGameMulti)
    playagainButton.addEventListener('click', playAgain)
  }

  function test() {
    console.log('work')
  }

  function getTimeRemaining() {
    const total = Date.parse(deadline) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds
    };
  }

  

  function initializeClock(id) {
    //clearInterval(timeinterval);
    const clock = document.getElementById(id);
    const secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
      t = getTimeRemaining();
  
      
      secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
  
      if (t.total <= 0) {
        clearInterval(timeinterval);
        if(currentPlayer === 'user'){
          currentPlayer= 'enemy'
          t = null;
          playGameMulti(socket);
        }
        else if(currentPlayer === 'enemy'){
          currentPlayer= 'user'
          t = null;
          playGameMulti(socket);
        }
      }
    }

    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
  }

  //const deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);
  //const deadline = new Date(Date.parse(new Date()) + 20 * 1000);
  //initializeClock('clockdiv', deadline);

  function playAgain(){
    window.location.reload();
  }

  function resetSeconds() {
    deadline = new Date(Date.parse(new Date()) + 10 * 1000);
  }
})