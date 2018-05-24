// Init Three.js
// Renderer
let renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setClearColor('#ffffff')
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.shadowMap.enabled = true
// BasicShadowMap gives unfiltered shadow maps - fastest, but lowest quality.
// PCFShadowMap filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm (default).
// PCFSoftShadowMap filters shadow maps using the Percentage-Closer Soft Shadows (PCSS) algorithm.
renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap
document.body.appendChild(renderer.domElement)

// Scene
let scene = new THREE.Scene()
scene.fog = new THREE.FogExp2('#afbbcd', 0.4)

let worldOrigin = new THREE.Vector3(0, 0, 0)
let helper = {
  axis: {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  }
}

// setup camera
let camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000)
let controls = new THREE.OrbitControls(camera);
camera.position.z = 1
controls.minAzimuthAngle = -HALF_PI / 2
controls.maxAzimuthAngle = HALF_PI / 2
controls.minPolarAngle = HALF_PI / 1.5
controls.maxPolarAngle = HALF_PI + HALF_PI / 2
controls.enablePan = false
controls.enableZoom = false
controls.enableKeys = false
controls.update();

// axis helper
let axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Light & Shadow
let light = new THREE.AmbientLight(0x333333);
scene.add(light);
light = new THREE.DirectionalLight(0xffffff, 1, 100);
light.position.set(0.5, 0.8, 1);
light.castShadow = true;
scene.add(light);

light.shadow.mapSize.width = 8192;
light.shadow.mapSize.height = 8192;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;


// ENV MAP
let textureLoader = new THREE.TextureLoader();
textureEquirec = textureLoader.load("model/equiangular.png");
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
// textureEquirec.magFilter = THREE.LinearFilter;
// textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

// 

let equirectShader = THREE.ShaderLib["equirect"];

let equirectMaterial = new THREE.ShaderMaterial({
  fragmentShader: equirectShader.fragmentShader,
  vertexShader: equirectShader.vertexShader,
  uniforms: equirectShader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
});

equirectMaterial.uniforms["tEquirect"].value = textureEquirec;

let cubeShader = THREE.ShaderLib["cube"];
let cubeMaterial = new THREE.ShaderMaterial({
  fragmentShader: cubeShader.fragmentShader,
  vertexShader: cubeShader.vertexShader,
  uniforms: cubeShader.uniforms,
  depthWrite: false,
  side: THREE.BackSide
});

// Skybox

cubeMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100), cubeMaterial);
scene.add(cubeMesh);

//
cubeMesh.material = equirectMaterial;
cubeMesh.visible = true;

// Creates a plane
let planeGeometry = new THREE.PlaneGeometry(4, 1)

let planeMaterial = new THREE.MeshStandardMaterial({
  color: '#9999aa',
  roughness: 1,
  metalness: 0,
});

let plane = new THREE.Mesh(planeGeometry, planeMaterial)
plane.receiveShadow = true;
plane.position.y = -0.2
scene.add(plane)

planeMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 1,
  metalness: 0,
});
let otherplane = new THREE.Mesh(planeGeometry, planeMaterial)
otherplane.receiveShadow = true;
otherplane.rotation.x = -HALF_PI
otherplane.position.z = 0.5
otherplane.position.y = -0.7
scene.add(otherplane)


// Loads model
let loader = new THREE.JSONLoader();
let cond
loader.load('model/klima2.json',

  // onLoad callback
  function (geometry, materials) {
    let material = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0,
      metalness: 0,
      envMap: textureEquirec
    });

    cond = new THREE.Mesh(geometry, material);
    cond.castShadow = true; //default is false
    cond.receiveShadow = true; //default
    cond.needsUpdate = true;
    scene.add(cond);
  },

  // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },

  // onError callback
  function (err) {
    console.log('An error happened:', err);
  }
)

// Window Resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  //camera.position.x = window.mouse.x * PI / window.innerWidth - PI / 2
  //camera.position.y = window.mouse.y * PI / window.innerHeight - PI / 2

  renderer.render(scene, camera);
}
animate();