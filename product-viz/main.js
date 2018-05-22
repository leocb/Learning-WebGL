// Init Three.js
let scene = new THREE.Scene()
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

let renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor('#FFFFFF')
renderer.setSize(window.innerWidth, window.innerHeight, false)
document.body.appendChild(renderer.domElement)

// Light?
//let light = new THREE.LightShadow()

// Creates a cube
let cubeGeometry = new THREE.BoxGeometry(3, 3, 3)
let cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00
})

let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
scene.add(cube)
camera.position.z = 5

// Loads model
// let LoadingManager = new THREE.LoadingManager()
// let JSONLoader = new THREE.JSONLoader(loaderManager)



// Render loop
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.z = -window.mouse.x * PI / window.innerWidth;
  cube.rotation.x = window.mouse.y * PI / window.innerHeight;

  renderer.render(scene, camera);
}
animate();