import React from 'react'
import { mat4 } from 'gl-matrix'

import { Size2D } from '../../utils/visual'

import styles from './VisdioApp.module.scss'

const ASPECT_RATIO: number = 16 / 9
const RESOLUTION: number = 1080
const SCREEN_SIZE: Size2D = {
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

interface ProgramInfo {
  program: WebGLProgram
  attribLocations: {
    vertexPosition: GLuint
  }
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation | null
    modelViewMatrix: WebGLUniformLocation | null
  }
}

interface Buffers {
  position: WebGLBuffer | null
}

function initPositionBuffer(gl: WebGL2RenderingContext): WebGLBuffer | null {
  // Create a buffer for the square's positions.
  const positionBuffer: WebGLBuffer | null = gl.createBuffer()

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Now create an array of positions for the square.
  const positions: Float32Array = new Float32Array([
    1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0,
  ])

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

  return positionBuffer
}

function initBuffers(gl: WebGL2RenderingContext): Buffers {
  const positionBuffer: WebGLBuffer | null = initPositionBuffer(gl)

  return {
    position: positionBuffer,
  }
}

function drawScene({
  gl,
  programInfo,
  buffers,
}: {
  gl: WebGL2RenderingContext
  programInfo: ProgramInfo
  buffers: Buffers
}): void {
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // Clear to black, fully opaque
  gl.clearDepth(1.0) // Clear everything
  gl.enable(gl.DEPTH_TEST) // Enable depth testing
  gl.depthFunc(gl.LEQUAL) // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  const fieldOfView: number = (45 * Math.PI) / 180 // in radians
  const aspect: number = gl.canvas.width / gl.canvas.height
  const zNear: number = 0.1
  const zFar: number = 100.0
  const projectionMatrix: mat4 = mat4.create()

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix: mat4 = mat4.create()

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  mat4.translate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -6.0],
  ) // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  setPositionAttribute({ gl, buffers, programInfo })

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program)

  const transpose: GLboolean = false

  // Set the shader uniforms
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    transpose,
    projectionMatrix,
  )
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    transpose,
    modelViewMatrix,
  )

  const offset: GLint = 0
  const vertexCount: GLsizei = 4
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute({
  gl,
  buffers,
  programInfo,
}: {
  gl: WebGL2RenderingContext
  buffers: Buffers
  programInfo: ProgramInfo
}): void {
  const numComponents: GLint = 2 // pull out 2 values per iteration
  const type: GLenum = gl.FLOAT // the data in the buffer is 32bit floats
  const normalize: GLboolean = false // don't normalize
  const stride: GLsizei = 0 // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset: GLintptr = 0 // how many bytes inside the buffer to start from

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  )
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
}

function loadShader({
  gl,
  type,
  source,
}: {
  gl: WebGL2RenderingContext
  type: GLenum
  source: string
}): WebGLShader {
  const shader: WebGLShader | null = gl.createShader(type)
  if (!shader) throw new Error('Unable to create shader')

  // Send the source to the shader object
  gl.shaderSource(shader, source)

  // Compile the shader program
  gl.compileShader(shader)

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)

    throw new Error(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
    )
  }

  return shader
}

export function VisdioApp(): JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect((): (() => void) | void => {
    if (!canvasRef.current) return

    const gl: WebGL2RenderingContext | null =
      canvasRef.current.getContext('webgl2')

    let animationFrameHandle: number

    function animationFrame(): void {
      if (!gl) return

      // Set clear color to black, fully opaque
      gl.clearColor(0.0, 0.0, 0.0, 1.0)

      // Clear the color buffer with specified clear color
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Vertex shader program
      const vsSource: string = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
      `

      const fsSource: string = `
        void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
      `

      const vertexShader: WebGLShader = loadShader({
        gl,
        type: gl.VERTEX_SHADER,
        source: vsSource,
      })
      const fragmentShader: WebGLShader = loadShader({
        gl,
        type: gl.FRAGMENT_SHADER,
        source: fsSource,
      })

      // Create the shader program
      const shaderProgram: WebGLProgram | null = gl.createProgram()
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
      const programInfo: ProgramInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(
            shaderProgram,
            'aVertexPosition',
          ),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(
            shaderProgram,
            'uProjectionMatrix',
          ),
          modelViewMatrix: gl.getUniformLocation(
            shaderProgram,
            'uModelViewMatrix',
          ),
        },
      }

      // Here's where we call the routine that builds all the
      // objects we'll be drawing.
      const buffers: Buffers = initBuffers(gl)

      // Draw the scene
      drawScene({ gl, programInfo, buffers })

      animationFrameHandle = window.requestAnimationFrame(animationFrame)
    }
    animationFrameHandle = window.requestAnimationFrame(animationFrame)

    return (): void => window.cancelAnimationFrame(animationFrameHandle)
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
