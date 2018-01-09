// Tutorial link:
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_objects_with_WebGL

// Global Vars
let squareRotation = 0.0


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
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

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
		attribute vec4 aVertexColor;

		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;

		varying lowp vec4 vColor;

		void main() {
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vColor = aVertexColor;
		}
	`

	// Fragment shader program source
	const fsSource = `
		varying lowp vec4 vColor;

		void main() {
			gl_FragColor = vColor;
		}
	`

	//Initialize the shaders programs
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource)

	//Get the locations of our GL attribs and uniforms then store 'em
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),

		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		},
	}

	//Initialize square positions buffer
	const buffers = initBuffers(gl)


	//Animation (frame refresh)
	let lastFrameTime = 0 // then

	//Draw the scene repeatedly
	function render(thisFrameTime) { // thisFrameTime is passed by requestAnimationFrame, it's the time in milliseconds since the page loaded.
		thisFrameTime *= 0.001 // Convert from milliseconds to seconds
		const deltaTime = thisFrameTime - lastFrameTime
		lastFrameTime = thisFrameTime

		squareRotation += deltaTime

		drawScene(gl, programInfo, buffers)

		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)
}
function initBuffers(gl) {

	// Create an array of positions for the square.
	const positions = [
		1.0, 1.0,
		-1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
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


	// Default primary colors
	const colors = [
		1.0, 1.0, 1.0, 1.0,    // white
		1.0, 0.0, 0.0, 1.0,    // red
		0.0, 1.0, 0.0, 1.0,    // green
		0.0, 0.0, 1.0, 1.0,    // blue
	];

	// Bind and send the colors data to the GL Buffer
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	// return both buffers
	return {
		position: positionBuffer,
		color: colorBuffer
	}
}

// Render

function drawScene(gl, programInfo, buffers) {
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
	const modelViewMatrix = mat4.create();

	// Move the drawing position a bit to where we want to start drawing the square
	mat4.translate(
		modelViewMatrix,	// Destination matrix
		modelViewMatrix,	// Source matrix
		[-0.0, 0.0, -6.0]	// amount to translate
	)

	// After translating, rotate the square
	mat4.rotate(
		modelViewMatrix, // Destination
		modelViewMatrix, // Source
		squareRotation,  // Amount to rotate (in radians)
		[0, 0, 1]		 // Axis to rotate around
	)



	// Tell WebGL how to pull out the positions from the position buffer
	// into the vertexPosition attribute
	{
		const numComponents = 2 // pull out 2 values per iteration
		const type = gl.FLOAT // the data in the buffer is 32bit floats
		const normalize = false // do not normalize
		const stride = 0 // how many bytes to get from one set of values to the next
		const offset = 0 // how many bytes inside the buffer to start from

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset)
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
	}

	//Color buffer attribute
	{
		const numComponents = 4 // pull out 4 values per iteration
		const type = gl.FLOAT // the data in the buffer is 32bit floats
		const normalize = false // do not normalize
		const stride = 0 // how many bytes to get from one set of values to the next
		const offset = 0 // how many bytes inside the buffer to start from

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
		gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset)
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor)
	}

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program)

	// Set the shader uniforms
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

	{
		const offset = 0
		const vertexCount = 4
		gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
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
