// Init Three.js
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

let renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight, false)
document.body.appendChild(renderer.domElement)

// Creates a cube
let geometry = new THREE.BoxGeometry(1, 1, 1)
let material = new THREE.MeshBasicMaterial({
  color: 0x00ff00
})

let cube = new THREE.Mesh(geometry, material)
scene.add(cube)
camera.position.z = 5


// Render loop
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.z = -window.mouse.x * PI / window.innerWidth;
  cube.rotation.x = window.mouse.y * PI / window.innerHeight;

  renderer.render(scene, camera);
}
animate();