// Init Three.js
// Renderer
let renderer = new THREE.WebGLRenderer({
  //antialias: true
})
renderer.setClearColor('#ffffff')
// renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.shadowMap.enabled = true
// BasicShadowMap gives unfiltered shadow maps - fastest, but lowest quality.
// PCFShadowMap filters shadow maps using the Percentage-Closer Filtering (PCF) algorithm (default).
// PCFSoftShadowMap filters shadow maps using the Percentage-Closer Soft Shadows (PCSS) algorithm.
renderer.shadowMap.type = THREE.PCFSoftShadowMap // default THREE.PCFShadowMap
document.body.appendChild(renderer.domElement)



// Settings
let toneMappingOptions = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Uncharted2: THREE.Uncharted2ToneMapping,
  Cineon: THREE.CineonToneMapping
};

let toneMappingParams = {
  exposure: 1.34,
  whitePoint: 5.4,
  toneMapping: 'Uncharted2'
};

let bloomParams = {
  threshold: 0.72,
  strength: 0.52,
  radius: 0.01
}

var saoParams = {
  output: 0,
  saoBias: 0.5,
  saoBlur: true,
  saoBlurDepthCutoff: 0.00486,
  saoBlurRadius: 7,
  saoBlurStdDev: 6,
  saoIntensity: 0.0018,
  saoKernelRadius: 100,
  saoMinResolution: 0,
  saoScale: 1
}

let gui = new dat.GUI();

let bloomGui = gui.addFolder('Unreal 4 Bloom');
let toneMappingGui = gui.addFolder('ToneMapping');
let saoGui = gui.addFolder('SAO');

toneMappingGui.add(toneMappingParams, 'exposure', 0.0, 3.0);
toneMappingGui.add(toneMappingParams, 'whitePoint', 0.0, 10.0);
toneMappingGui.add(toneMappingParams, 'toneMapping', Object.keys(toneMappingOptions));

bloomGui.add(bloomParams, 'threshold', 0.0, 1.0);
bloomGui.add(bloomParams, 'strength', 0.0, 5.0);
bloomGui.add(bloomParams, 'radius', 0.0, 2.0);

saoGui.add(saoParams, 'output', {
  'Beauty': THREE.SAOPass.OUTPUT.Beauty,
  'Beauty+SAO': THREE.SAOPass.OUTPUT.Default,
  'SAO': THREE.SAOPass.OUTPUT.SAO,
  'Depth': THREE.SAOPass.OUTPUT.Depth,
  'Normal': THREE.SAOPass.OUTPUT.Normal
})
saoGui.add(saoParams, 'saoBias', -1, 1);
saoGui.add(saoParams, 'saoIntensity', 0, 1);
saoGui.add(saoParams, 'saoScale', 0, 10);
saoGui.add(saoParams, 'saoKernelRadius', 1, 100);
saoGui.add(saoParams, 'saoBlur');
saoGui.add(saoParams, 'saoBlurRadius', 0, 200);
saoGui.add(saoParams, 'saoBlurStdDev', 0.5, 150);
saoGui.add(saoParams, 'saoBlurDepthCutoff', 0.0, 0.1);

gui.open()
saoGui.open()


// Scene
let scene = new THREE.Scene()
//scene.fog = new THREE.FogExp2('#afbbcd', 0.4)

let worldOrigin = new THREE.Vector3(0, 0, 0)
let helper = {
  axis: {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1)
  }
}


// setup camera
let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 1.2
let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minAzimuthAngle = -(PI / 3)
controls.maxAzimuthAngle = PI / 3
controls.minPolarAngle = HALF_PI - HALF_PI / 4
controls.maxPolarAngle = HALF_PI + HALF_PI / 2
controls.enablePan = false
controls.enableZoom = false
controls.enableKeys = false
controls.target = new THREE.Vector3(0, 0.05, 0.1)
controls.update();

// Post Processing
renderScene = new THREE.RenderPass(scene, camera);

effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), bloomParams.strength, bloomParams.radius, bloomParams.threshold);
bloomPass.renderToScreen = true;

let saoPass = new THREE.SAOPass(scene, camera, true, true);
saoPass.renderToScreen = true;

composer = new THREE.EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(effectFXAA);
composer.addPass(bloomPass);
//composer.addPass(saoPass);

renderer.gammaInput = false;
renderer.gammaOutput = false;



// axis helper\
let axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Light & Shadow
// let ambientLight = new THREE.AmbientLight(0x222222);
// scene.add(ambientLight);

// light = new THREE.DirectionalLight(0xffffff, 1, 100);
// light.position.set(0.5, 0.8, 1);
// light.castShadow = true;
// scene.add(light);

let light = new THREE.PointLight(0xffffff, 0.3, 100);
light.position.set(0.2, 0.8, 2);
light.castShadow = true;

light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 500;
light.shadow.camera.radius = 50;

scene.add(light)
scene.add(new THREE.CameraHelper(light.shadow.camera));


// Textures

let groundTexture = new THREE.TextureLoader().load("textures/white_ceiling.jpg");
groundTexture.wrapS = THREE.RepeatWrapping;
groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(3, 3);

let wallTexture = new THREE.TextureLoader().load("textures/wood_wall.jpg");
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(3, 3);

// standard materials
let standardMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.1,
  metalness: 0,
});

let wallplaneMaterial = new THREE.MeshStandardMaterial({
  //color: '#223399',
  roughness: 1,
  metalness: 0,
  map: wallTexture
});

let groundplaneMaterial = new THREE.MeshStandardMaterial({
  //color: '#ffffff',
  roughness: 1,
  metalness: 0,
  map: groundTexture
});


// HDR Skybox
let hdrUrls = genCubeUrls('./textures/woodenLoungeHDR/', '.hdr');
// how to create cubemaps from hdri panorama:
// https://eleni.mutantstargoat.com/hikiko/2017/07/28/creating-cube-maps-from-hdr-images/
// panoramas here:
// https://hdrihaven.com/

let newEnvMap
new THREE.HDRCubeTextureLoader().load(THREE.UnsignedByteType, hdrUrls, function (hdrCubeMap) {

  let pmremGenerator = new THREE.PMREMGenerator(hdrCubeMap);
  pmremGenerator.update(renderer);

  let pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
  pmremCubeUVPacker.update(renderer);

  hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

  newEnvMap = standardMaterial.envMap;

  if (hdrCubeRenderTarget) newEnvMap = hdrCubeRenderTarget.texture;

  if (newEnvMap !== standardMaterial.envMap) {

    standardMaterial.envMap = newEnvMap;
    standardMaterial.envMapIntensity = 1;
    standardMaterial.needsUpdate = true;

    wallplaneMaterial.envMap = newEnvMap;
    wallplaneMaterial.envMapIntensity = 1;
    wallplaneMaterial.needsUpdate = true;

    groundplaneMaterial.envMap = newEnvMap;
    groundplaneMaterial.envMapIntensity = 1;
    groundplaneMaterial.needsUpdate = true;

  }
});



// Creates planes
let planeGeometry = new THREE.PlaneGeometry(4, 4)

let wallPlane = new THREE.Mesh(planeGeometry, wallplaneMaterial)
wallPlane.receiveShadow = true;
wallPlane.position.y = -1
scene.add(wallPlane)

let groundPlane = new THREE.Mesh(planeGeometry, groundplaneMaterial)
groundPlane.receiveShadow = true;
groundPlane.rotation.x = -HALF_PI
groundPlane.position.z = 0.5
groundPlane.position.y = -1.5
scene.add(groundPlane)

let roofPlane = new THREE.Mesh(planeGeometry, groundplaneMaterial)
roofPlane.receiveShadow = true;
roofPlane.rotation.x = HALF_PI
roofPlane.position.z = 0.5
roofPlane.position.y = 0.7
scene.add(roofPlane)


// Loads model
let loader = new THREE.JSONLoader();
let cond
loader.load('model/klima2.json',

  // onLoad callback
  function (geometry, materials) {
    cond = new THREE.Mesh(geometry, standardMaterial);
    cond.castShadow = true; //default is false
    cond.receiveShadow = true; //default
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
  composer.setSize(window.innerWidth, window.innerHeight);
  effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  composer.render();

  // Settings


  bloomPass.threshold = bloomParams.threshold;
  bloomPass.strength = bloomParams.strength;
  bloomPass.radius = bloomParams.radius;

  renderer.toneMappingExposure = toneMappingParams.exposure;
  renderer.toneMappingWhitePoint = toneMappingParams.whitePoint;

  renderScene.toneMappingExposure = toneMappingParams.exposure;
  renderScene.toneMappingWhitePoint = toneMappingParams.whitePoint;

  saoPass.params = saoParams

  if (renderer.toneMapping !== toneMappingOptions[toneMappingParams.toneMapping]) {
    renderer.toneMapping = toneMappingOptions[toneMappingParams.toneMapping];
    renderScene.toneMapping = toneMappingOptions[toneMappingParams.toneMapping];
    if (groundplaneMaterial) groundplaneMaterial.needsUpdate = true;
    if (wallplaneMaterial) wallplaneMaterial.needsUpdate = true;
    if (standardMaterial) standardMaterial.needsUpdate = true;
    renderScene.needsUpdate = true
    bloomPass.needsUpdate = true
    renderer.needsUpdate = true
    bloomPass.needsUpdate = true
  }

}
animate();