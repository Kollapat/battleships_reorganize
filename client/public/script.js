

//Change Background
function changeBackground() {
    var caseno = getRandomizer( 1, 3 );
    console.log(caseno);
    switch(caseno){
      case 1: var bgColor = "rgb(" + 178 + "," + 217 + "," + 255  +")";break;
      case 2: var bgColor = "rgb(" + 152 + "," + 252 + "," + 176  +")";break;
      case 3: var bgColor = "rgb(" + 255 + "," + 188 + "," + 247  +")";break;
    }
    
    window.localStorage.setItem("bgColorsave", bgColor);
  
    console.log(bgColor)
    document.body.style.background = bgColor
  }

  function changeBackgroudUpdate(){
    document.body.style.background = window.localStorage.getItem("bgColorsave");
  }

  function getRandomizer(bottom, top) {
        return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;

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



function getchoice0() {
  document.getElementById("choice0").innerHTML = playersArray[0];
  console.log(playersArray[0]);
  return playersArray[0];
}

var playersArray = [];


function getTable() { //dynamically create table according to online users
  for(i=0; i<playersArray.length; i++) {
    var table = document.getElementById("players");
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = playersArray[i];
    if (playersArray[i] != username) {
      cell2.innerHTML = '<a class="btn connect-btn" onclick="connect('+i+')">Connect & Play</a>';
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
    playerTwoName = playersArray[choice];
    window.localStorage.setItem("player2Name", playerTwoName);
    location.href = '/multiplayer.html';
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



