//Change Background
function changeBackground() {
  var caseno = getRandomizer( 1, 3 );
  switch(caseno){
    case 1: var bgColor = "rgb(" + 178 + "," + 217 + "," + 255  +")";break;
    case 2: var bgColor = "rgb(" + 152 + "," + 252 + "," + 176  +")";break;
    case 3: var bgColor = "rgb(" + 255 + "," + 188 + "," + 247  +")";break;
  }
  window.localStorage.setItem("bgColorsave", bgColor);
  document.body.style.background = bgColor
}

function changeBackgroudUpdate(){
  document.body.style.background = window.localStorage.getItem("bgColorsave");
}

function getRandomizer(bottom, top) {
  return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
}
