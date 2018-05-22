// Math
let PI = 3.1415926535897932384626433827950488
let TWO_PI = PI * 2
let HALF_PI = PI / 2

// Mouse screen position - thanks to: https://stackoverflow.com/a/7790764/8908827
window.mouse = {
  x: 0,
  y: 0
}

document.onmousemove = handleMouseMove;

function handleMouseMove(event) {
  var dot, eventDoc, doc, body, pageX, pageY;
  event = event || window.event; // IE-ism
  if (event.pageX == null && event.clientX != null) {
    eventDoc = (event.target && event.target.ownerDocument) || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;
    event.pageX = event.clientX +
      (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
      (doc && doc.clientLeft || body && body.clientLeft || 0);
    event.pageY = event.clientY +
      (doc && doc.scrollTop || body && body.scrollTop || 0) -
      (doc && doc.clientTop || body && body.clientTop || 0);
  }
  window.mouse = {
    x: event.pageX,
    y: event.pageY
  }
};


// Mouse Raycaster! - thanks to: https://stackoverflow.com/a/30871007/8908827
// mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
// mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
// raycaster.setFromCamera( mouse.clone(), camera );   

// var objects = raycaster.intersectObjects(scene.children);