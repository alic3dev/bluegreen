import React from 'react'

import styles from './VisdioApp.module.scss'

const ASPECT_RATIO = 16 / 9
const RESOLUTION = 1080
const SCREEN_SIZE: { x: number; y: number } = {
  x: RESOLUTION * ASPECT_RATIO,
  y: RESOLUTION,
}

// Embark
//
// Take caution
// Lose yourself
//
// Enjoy
//
// ...
//

export function VisdioApp() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (!canvasRef.current) return

    const gl: WebGL2RenderingContext | null =
      canvasRef.current.getContext('webgl2')

    if (!gl) return

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      }
    `

    const fsSource = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `

    function loadShader(
      gl: WebGL2RenderingContext,
      type: number,
      source: string,
    ) {
      const shader = gl.createShader(type)

      if (!shader) throw new Error('Unable to create shader')

      // Send the source to the shader object

      gl.shaderSource(shader, source)

      // Compile the shader program

      gl.compileShader(shader)

      // See if it compiled successfully

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)

        throw new Error(
          `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
            shader,
          )}`,
        )
      }

      return shader
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

    // Create the shader program

    const shaderProgram = gl.createProgram()

    if (!shaderProgram) throw new Error('Unable to create shader program')

    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shaderProgram,
        )}`,
      )
    }

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    // const programInfo = {
    //   program: shaderProgram,
    //   attribLocations: {
    //     vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    //   },
    //   uniformLocations: {
    //     projectionMatrix: gl.getUniformLocation(
    //       shaderProgram,
    //       'uProjectionMatrix',
    //     ),
    //     modelViewMatrix: gl.getUniformLocation(
    //       shaderProgram,
    //       'uModelViewMatrix',
    //     ),
    //   },
    // }

    // function initBuffers(gl: WebGL2RenderingContext) {
    //   const positionBuffer = initPositionBuffer(gl)

    //   return {
    //     position: positionBuffer,
    //   }
    // }

    // function initPositionBuffer(gl: WebGL2RenderingContext) {
    //   // Create a buffer for the square's positions.
    //   const positionBuffer = gl.createBuffer()

    //   // Select the positionBuffer as the one to apply buffer
    //   // operations to from here out.
    //   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    //   // Now create an array of positions for the square.
    //   const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0]

    //   // Now pass the list of positions into WebGL to build the
    //   // shape. We do this by creating a Float32Array from the
    //   // JavaScript array, then use it to fill the current buffer.
    //   gl.bufferData(
    //     gl.ARRAY_BUFFER,
    //     new Float32Array(positions),
    //     gl.STATIC_DRAW,
    //   )

    //   return positionBuffer
    // }

    // function drawScene(
    //   gl: WebGL2RenderingContext,
    //   // programInfo: { program: WebGLProgram },
    //   // buffers,
    // ) {
    //   gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
    //   gl.clearDepth(1.0) // Clear everything
    //   gl.enable(gl.DEPTH_TEST) // Enable depth testing
    //   gl.depthFunc(gl.LEQUAL) // Near things obscure far things

    //   // Clear the canvas before we start drawing on it.

    //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    //   // // Create a perspective matrix, a special matrix that is
    //   // // used to simulate the distortion of perspective in a camera.
    //   // // Our field of view is 45 degrees, with a width/height
    //   // // ratio that matches the display size of the canvas
    //   // // and we only want to see objects between 0.1 units
    //   // // and 100 units away from the camera.

    //   // const fieldOfView = (45 * Math.PI) / 180 // in radians
    //   // const aspect = gl.canvas.width / gl.canvas.height
    //   // const zNear = 0.1
    //   // const zFar = 100.0
    //   // const projectionMatrix = mat4.create()

    //   // // note: glmatrix.js always has the first argument
    //   // // as the destination to receive the result.
    //   // mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

    //   // // Set the drawing position to the "identity" point, which is
    //   // // the center of the scene.
    //   // const modelViewMatrix = mat4.create()

    //   // // Now move the drawing position a bit to where we want to
    //   // // start drawing the square.
    //   // mat4.translate(
    //   //   modelViewMatrix, // destination matrix
    //   //   modelViewMatrix, // matrix to translate
    //   //   [-0.0, 0.0, -6.0],
    //   // ) // amount to translate

    //   // // Tell WebGL how to pull out the positions from the position
    //   // // buffer into the vertexPosition attribute.
    //   // setPositionAttribute(gl, buffers, programInfo)

    //   // // Tell WebGL to use our program when drawing
    //   // gl.useProgram(programInfo.program)

    //   // // Set the shader uniforms
    //   // gl.uniformMatrix4fv(
    //   //   programInfo.uniformLocations.projectionMatrix,
    //   //   false,
    //   //   projectionMatrix,
    //   // )
    //   // gl.uniformMatrix4fv(
    //   //   programInfo.uniformLocations.modelViewMatrix,
    //   //   false,
    //   //   modelViewMatrix,
    //   // )

    //   // {
    //   //   const offset = 0
    //   //   const vertexCount = 4
    //   //   gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
    //   // }
    // }

    // // Tell WebGL how to pull out the positions from the position
    // // buffer into the vertexPosition attribute.
    // // function setPositionAttribute(
    // //   gl: WebGL2RenderingContext,
    // //   buffers,
    // //   programInfo,
    // // ) {
    // //   // const numComponents = 2 // pull out 2 values per iteration
    // //   // const type = gl.FLOAT // the data in the buffer is 32bit floats
    // //   // const normalize = false // don't normalize
    // //   // const stride = 0 // how many bytes to get from one set of values to the next
    // //   // // 0 = use type and numComponents above
    // //   // const offset = 0 // how many bytes inside the buffer to start from
    // //   // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    // //   // gl.vertexAttribPointer(
    // //   //   programInfo.attribLocations.vertexPosition,
    // //   //   numComponents,
    // //   //   type,
    // //   //   normalize,
    // //   //   stride,
    // //   //   offset,
    // //   // )
    // //   // gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
    // // }

    // // Here's where we call the routine that builds all the
    // // objects we'll be drawing.
    // // const buffers = initBuffers(gl)

    // // Draw the scene
    // drawScene(gl) //, programInfo, buffers)
  }, [])

  return (
    <div className={styles.visdio}>
      <canvas
        ref={canvasRef}
        style={{ height: `calc(100vw / ${ASPECT_RATIO})`, width: `100vw` }}
        width={SCREEN_SIZE.x}
        height={SCREEN_SIZE.y}
      />
    </div>
  )
}
