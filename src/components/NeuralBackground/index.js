import { useEffect, useRef, useCallback } from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

/* ────────────────────────────────────────────────────────────────────────────
 * Interactive Neural Vortex Background
 *
 * A WebGL-powered animated background that responds to pointer movement and
 * scroll position. Renders as a fixed full-screen canvas behind all content.
 *
 * Colours adapt to the active MUI theme palette (primary / info).
 *
 * Usage:
 *   <NeuralBackground>{children}</NeuralBackground>
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Shader sources ──────────────────────────────────────────────────────────

const VERTEX_SHADER = `
  precision mediump float;
  attribute vec2 a_position;
  varying vec2 vUv;
  void main() {
    vUv = .5 * (a_position + 1.);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

/**
 * Build the fragment shader with the given theme colours injected as
 * compile-time constants so the GPU never has to branch.
 */
function buildFragmentShader(primaryR, primaryG, primaryB, infoR, infoG, infoB) {
  return `
    precision mediump float;
    varying vec2 vUv;
    uniform float u_time;
    uniform float u_ratio;
    uniform vec2  u_pointer_position;
    uniform float u_scroll_progress;

    vec2 rotate(vec2 uv, float th) {
      return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
    }

    float neuro_shape(vec2 uv, float t, float p) {
      vec2 sine_acc = vec2(0.);
      vec2 res = vec2(0.);
      float scale = 8.;
      for (int j = 0; j < 15; j++) {
        uv = rotate(uv, 1.);
        sine_acc = rotate(sine_acc, 1.);
        vec2 layer = uv * scale + float(j) + sine_acc - t;
        sine_acc += sin(layer) + 2.4 * p;
        res += (.5 + .5 * cos(layer)) / scale;
        scale *= 1.2;
      }
      return res.x + res.y;
    }

    void main() {
      vec2 uv = .5 * vUv;
      uv.x *= u_ratio;

      vec2 pointer = vUv - u_pointer_position;
      pointer.x *= u_ratio;
      float p = clamp(length(pointer), 0., 1.);
      p = .5 * pow(1. - p, 2.);

      float t = .001 * u_time;

      // Primary colour from theme
      vec3 color = vec3(${primaryR.toFixed(4)}, ${primaryG.toFixed(4)}, ${primaryB.toFixed(4)});

      // Mix with info colour
      color = mix(color, vec3(${infoR.toFixed(4)}, ${infoG.toFixed(4)}, ${infoB.toFixed(4)}),
                  0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));

      // Accent shift
      color += vec3(${(primaryR * 0.3).toFixed(4)}, 0.0, ${(primaryB * 0.9).toFixed(4)})
               * sin(2.0 * u_scroll_progress + 1.5);

      float noise = neuro_shape(uv, t, p);
      noise = 1.2 * pow(noise, 3.);
      noise += pow(noise, 10.);
      noise = max(0., noise - .5);
      noise *= (1. - length(vUv - .5));

      color = color * noise;
      gl_FragColor = vec4(color, noise);
    }
  `
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a hex colour like '#7367F0' → { r, g, b } in 0-1 range. */
function hexToGL(hex) {
  const c = hex.replace('#', '')
  return {
    r: parseInt(c.substring(0, 2), 16) / 255,
    g: parseInt(c.substring(2, 4), 16) / 255,
    b: parseInt(c.substring(4, 6), 16) / 255
  }
}

function compileShader(gl, source, type) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// ── Component ───────────────────────────────────────────────────────────────

export default function NeuralBackground({ children }) {
  const theme = useTheme()
  const canvasRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0, tX: 0, tY: 0 })
  const animationRef = useRef(null)
  const glRef = useRef(null)

  // Derive GL colours from MUI palette
  const primary = hexToGL(theme.palette.primary.main)
  const info = hexToGL(theme.palette.info.main)

  const setupGL = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }
    glRef.current = gl

    // Enable blending for translucent overlay
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const vsShader = compileShader(gl, VERTEX_SHADER, gl.VERTEX_SHADER)
    const fsShader = compileShader(
      gl,
      buildFragmentShader(primary.r, primary.g, primary.b, info.r, info.g, info.b),
      gl.FRAGMENT_SHADER
    )

    const program = gl.createProgram()
    gl.attachShader(program, vsShader)
    gl.attachShader(program, fsShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    // Fullscreen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniform locations
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uRatio = gl.getUniformLocation(program, 'u_ratio')
    const uPointer = gl.getUniformLocation(program, 'u_pointer_position')
    const uScroll = gl.getUniformLocation(program, 'u_scroll_progress')

    // Resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform1f(uRatio, canvas.width / canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)

    // Render loop
    const render = () => {
      pointer.current.x += (pointer.current.tX - pointer.current.x) * 0.2
      pointer.current.y += (pointer.current.tY - pointer.current.y) * 0.2

      gl.uniform1f(uTime, performance.now())
      gl.uniform2f(
        uPointer,
        pointer.current.x / window.innerWidth,
        1 - pointer.current.y / window.innerHeight
      )

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      gl.uniform1f(uScroll, scrollable > 0 ? window.pageYOffset / scrollable : 0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationRef.current = requestAnimationFrame(render)
    }

    render()

    // Pointer events
    const onPointerMove = e => {
      pointer.current.tX = e.clientX
      pointer.current.tY = e.clientY
    }
    const onTouchMove = e => {
      if (e.touches[0]) {
        pointer.current.tX = e.touches[0].clientX
        pointer.current.tY = e.touches[0].clientY
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchmove', onTouchMove)

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      cancelAnimationFrame(animationRef.current)
      gl.deleteProgram(program)
      gl.deleteShader(vsShader)
      gl.deleteShader(fsShader)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const cleanup = setupGL()
    return cleanup
  }, [setupGL])

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fixed WebGL canvas covering the full viewport */}
      <Box
        component='canvas'
        ref={canvasRef}
        sx={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.95
        }}
      />

      {/* All page content rendered above the canvas */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Box>
  )
}
