// Tutorial link:
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_objects_with_WebGL

// Global Vars
let cubeRotation = 0.0

//
// Debug Program
//

function logAndValidate(functionName, args) {
	// logGLCall(functionName, args); // Comment this if you dont want to see all the calls
	validateNoneOfTheArgsAreUndefined(functionName, args);
}

function throwOnGLError(err, funcName, args) {
	throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};


function logGLCall(functionName, args) {
	console.log("gl." + functionName + "(" +
		WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}

function validateNoneOfTheArgsAreUndefined(functionName, args) {
	for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] === undefined) {
			console.error("undefined passed to gl." + functionName + "(" +
				WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
		}
	}
}


//
// Main program
//

main()

function main() {
	const canvas = document.querySelector('#glcanvas')

	//Resize **Note: resize before getting the context!
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	// Get WebGL Context
	const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

	//debug
	const gl = WebGLDebugUtils.makeDebugContext(context, throwOnGLError, logAndValidate);

	// Only continue if WebGL is available and working
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.')
		return
	}

	// Set clear color to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	// Clear the color buffer with specified clear color
	gl.clear(gl.COLOR_BUFFER_BIT)


	// Shader Sources
	// Vertex shader program source
	const vsSource = ` 
		attribute vec4 aVertexPosition;
		attribute vec3 aVertexNormal;
		attribute vec2 aTextureCoord;

		uniform mat4 uNormalMatrix;
		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;

		varying highp vec2 vTextureCoord;
		varying highp vec3 vLighting;

		void main() {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vTextureCoord = aTextureCoord;

			// Apply Lighting effect
			
			//Dark Gray-ish
			highp vec3 ambientLight   = vec3(0.3, 0.3, 0.3); 

			//White!
			highp vec3 dirLightColor  = vec3(1.0, 1.0, 1.0); 
			highp vec3 dirLightVector = normalize(vec3(0.85,0.8,0.75));

			highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

			highp float directional = max(dot(transformedNormal.xyz, dirLightVector), 0.0);
			vLighting = ambientLight + (dirLightColor * directional);
		}
	`

	// Fragment shader program source
	const fsSource = `
		varying highp vec2 vTextureCoord;
		varying highp vec3 vLighting;

		uniform sampler2D uSampler;

		void main() {
			highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
			gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
		}
	`

	//Initialize the shaders programs
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource)

	//Get the locations of our GL attribs and uniforms then store 'em
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
		},
		uniformLocations: {
			normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
		},
	}

	//Initialize square positions buffer
	const buffers = initBuffers(gl)

	// Load texture
	// if you're offline, use this instead:
	// const texture = loadTexture(gl, '../assets/cubetexture.png')
	const texture = loadTexture(gl, 'https://raw.githubusercontent.com/mdn/webgl-examples/gh-pages/tutorial/sample6/cubetexture.png')


	//Animation (frame refresh)
	let lastFrameTime = 0 // then

	//Draw the scene repeatedly
	function render(thisFrameTime) { // thisFrameTime is passed by requestAnimationFrame, it's the time in milliseconds since the page loaded.
		thisFrameTime *= 0.001 // Convert from milliseconds to seconds
		const deltaTime = thisFrameTime - lastFrameTime
		lastFrameTime = thisFrameTime

		cubeRotation += deltaTime

		drawScene(gl, programInfo, buffers, texture)

		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)
}
function initBuffers(gl) {

	// Create 1 arrays of positions for the cube.
	const positions = [
		// Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		// Top face
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		// Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,
	]

	// A buffer can be used to store ANY type of data on the GPU memory,
	// later we must specify how the GPU should read them in a meaningfull way

	// Create a buffer for the square's positions.
	// Then select the positionBuffer as the one to apply buffer
	// operations to from here out.
	const positionBuffer = gl.createBuffer() // Create buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer) // bind (target, buffer)

	// Now pass the list of positions into WebGL to build the shape.
	// We do this by creating a Float32Array from the JavaScript array
	// then use it to fill the current buffer.
	// See https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW) // Transfer data (target, srcData, usage)



	// Texture coordinates buffer
	const textureCoordinates = [
		// Front
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Back
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Top
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Bottom
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Right
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0,
		// Left
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	]

	const textureCoordBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW)


	// Element array

	// the faces are 2 triangles per face, whinch require 4 vertices per face,
	// that would be two triangles especified by 3 vertices each,
	// Thus the cube is described as a collection of 12 triangles.

	// here we especify the index of each vertex that belongs to that face
	// this can also be achieved with just 8 vertices.
	const indices = [
		0, 1, 2, 0, 2, 3,    // front
		4, 5, 6, 4, 6, 7,    // back
		8, 9, 10, 8, 10, 11,   // top
		12, 13, 14, 12, 14, 15,   // bottom
		16, 17, 18, 16, 18, 19,   // right
		20, 21, 22, 20, 22, 23,   // left
	]

	// bind the indices to a buffer
	const indexBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)



	// Cube normals:
	const vertexNormals = [
		// Front
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,
		0.0, 0.0, 1.0,

		// Back
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,
		0.0, 0.0, -1.0,

		// Top
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,

		// Bottom
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,
		0.0, -1.0, 0.0,

		// Right
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		1.0, 0.0, 0.0,

		// Left
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	];

	const normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);



	// return all buffers
	return {
		position: positionBuffer,
		normal: normalBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer
	}
}

// Render

function drawScene(gl, programInfo, buffers, texture) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0)	// Clear to black, full opaque
	gl.clearDepth(1.0)					// Clear everything (what? clear the buffers?)
	gl.enable(gl.DEPTH_TEST)			// Enable depth testing
	gl.depthFunc(gl.LEQUAL)				// Near things obscure far things

	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = 45 * Math.PI / 180 // In Radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
	const zNear = 0.1
	const zFar = 100.0
	const projectionMatrix = mat4.create()

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)



	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create()

	// Move the drawing position a bit to where we want to start drawing the cube
	mat4.translate(
		modelViewMatrix,	// Destination matrix
		modelViewMatrix,	// Source matrix
		[-0.0, 0.0, -6.0]	// amount to translate
	)

	// After translating, rotate the cube
	mat4.rotate(
		modelViewMatrix, // Destination
		modelViewMatrix, // Source
		cubeRotation,  // Amount to rotate (in radians)
		[0, 0, 1]		 // Axis to rotate around
	)
	mat4.rotate(
		modelViewMatrix,
		modelViewMatrix,
		cubeRotation,
		[0, 1, 0]
	)

	// Normal Matrix
	const normalMatrix = mat4.create()
	mat4.invert(normalMatrix, modelViewMatrix)
	mat4.transpose(normalMatrix, normalMatrix)


	// Tell WebGL how to pull out the positions from the position buffer
	// into the vertexPosition attribute
	{
		const numComponents = 3 // pull out 2 values per iteration
		const type = gl.FLOAT // the data in the buffer is 32bit floats
		const normalize = false // do not normalize
		const stride = 0 // how many bytes to get from one set of values to the next
		const offset = 0 // how many bytes inside the buffer to start from

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset)
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
	}

	// Texture coordinate attribute
	{
		const num = 2 // every coordinate composed of 2 values
		const type = gl.FLOAT // the data in the buffer is 32 bit float
		const normalize = false // don't normalize
		const stride = 0 // how many bytes to get from one set to the next
		const offset = 0 // how many butes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
		gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset)
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord)
	}


	// Tell WebGL which indices to use to index the vertices
	{
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
	}

	// Normals attribute
	{
		const num = 3 // every coordinate composed of 3 values
		const type = gl.FLOAT // the data in the buffer is 32 bit float
		const normalize = false // don't normalize
		const stride = 0 // how many bytes to get from one set to the next
		const offset = 0 // how many butes inside the buffer to start from
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal)
		gl.vertexAttribPointer(programInfo.attribLocations.vertexNormal, num, type, normalize, stride, offset)
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal)
	}

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program)

	// Set the shader uniforms
	gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix)
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;

		// Tell webgl we want to affect texture unit 0
		gl.activeTexture(gl.TEXTURE0)

		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, texture)

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(programInfo.uniformLocations.uSampler, 0)

		//Draw meshes
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
	}
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

	// Create the shader program
	const shaderProgram = gl.createProgram()
	gl.attachShader(shaderProgram, vertexShader)
	gl.attachShader(shaderProgram, fragmentShader)
	gl.linkProgram(shaderProgram)

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
		return null
	}

	return shaderProgram
}
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type)

	// Send the source to the shader object
	gl.shaderSource(shader, source)

	// Compile the shader program
	gl.compileShader(shader)

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
		gl.deleteShader(shader)
		return null
	}

	return shader
}

/**
 * Load texture from a image file or url into a WebGL Texture Object.
 * When the image finished loading, it's copied into the texture.
 * 
 * @param {any} gl WebGL context
 * @param {string} url image path or url
 * @returns WebGL Texture Object
 */
function loadTexture(gl, url) {
	const texture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, texture)

	// Because images have to be download over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
	const level = 0
	const internalFormat = gl.RGBA
	const width = 1
	const height = 1
	const border = 0
	const srcFormat = gl.RGBA
	const srcType = gl.UNSIGNED_BYTE
	const pixel = new Uint8Array([0, 0, 128, 255]) // unsigned byte - dark blue
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel)

	// Load image file
	const image = new Image() // new simple html image element
	image.crossOrigin = "anonymous" // Allow cross-domain images (if the website allows it too)
	image.onload = function () { //async callback
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)

		// WebGL1 has different requirements for power of 2 images
		// vs non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) { // Yes to power of 2!
			// generate mips!
			gl.generateMipmap(gl.TEXTURE_2D)
		} else { // No power of 2 :(
			// Prevents s-coordinate wrapping (repeating).
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			// Prevents t-coordinate wrapping (repeating).
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			// Disable mips
			// gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

		}
	}

	image.src = url

	return texture
}

function isPowerOf2(value) {
	// 256 -> 1 0000 0000 AND
	// 255 -> 0 1111 1111
	//  =     0 0000 0000
	return (value & (value - 1)) === 0
}