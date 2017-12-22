// Continue from here:
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

main()

function main() {
	const canvas = document.querySelector('#glCanvas')
	// Initialize the GL context
	const gl = canvas.getContext('webgl')

	//Resize
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight


	// Only continue if WebGL is available and working
	if (!gl) {
		alert('Unable to initialize WebGL. Your browser or machine may not support it.')
		return
	}

	// Set clear color to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0)

	// Clear the color buffer with specified clear color
	gl.clear(gl.COLOR_BUFFER_BIT)


	//Initialize the shaders programs
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource)

	//Get the locations of our GL attribs and uniforms then store 'em
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
		},
	}
}


// Shader Sources
// Vertex shader program source
const vsSource = ` 
 attribute vec4 aVertexPosition

 uniform mat4 uModelViewMatrix
 uniform mat4 uProjectionMatrix

 void main() {
   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition
 }
`

// Fragment shader program source
const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0)
    }
`

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


//Create buffers
function initBuffers(gl) {

	// Create a buffer for the square's positions.
	const positionBuffer = gl.createBuffer()

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

	// Now create an array of positions for the square.
	const positions = [
		1.0, 1.0,
		-1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0,
	]

	// Now pass the list of positions into WebGL to build the shape.
	// We do this by creating a Float32Array from the JavaScript array
	// then use it to fill the current buffer.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

	return {
		position: positionBuffer
	}
}