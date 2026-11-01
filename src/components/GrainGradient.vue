<template>
  <canvas ref="canvas" class="grain-gradient"></canvas>
</template>

<script>
// Vue 2 port of the "Grain Gradient" WebGL shader background (21st.dev Shader Builder).
// Adapted from Paper Shaders: https://shaders.paper.design/grain-gradient (Apache-2.0).
// One WebGL canvas that fills its parent. Tweak the look by editing UNIFORMS below.

const VERT = `attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec3 u_colors[4];
uniform vec4 u_scene;      // resolution.xy, time, colour count
uniform vec4 u_shape;      // scale, intensity, paramA, warp
uniform vec4 u_surface;    // detail, contrast, brightness, saturation
uniform vec4 u_finish;     // hue, vignette, blur, grain
uniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle
uniform vec4 u_space;      // offset.xy (pointer.xy unused)
uniform vec4 u_cursor;     // presence, -, strength, radius
uniform vec4 u_trail[4];   // 8 trail points (x,y,x,y) in -1..1 canvas space, newest first

#define u_resolution u_scene.xy
#define u_time u_scene.z
#define u_colorCount u_scene.w
#define u_scale u_shape.x
#define u_intensity u_shape.y
#define u_paramA u_shape.z
#define u_warp u_shape.w
#define u_detail u_surface.x
#define u_contrast u_surface.y
#define u_brightness u_surface.z
#define u_saturation u_surface.w
#define u_hue u_finish.x
#define u_vignette u_finish.y
#define u_blur u_finish.z
#define u_grain u_finish.w
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define u_seed u_transform.x
#else
#define u_seed mod(u_transform.x, 31.0)
#endif
#define u_rotate u_transform.y
#define u_drift u_transform.z
#define u_oklab u_transform.w
#define u_offset u_space.xy
#define u_mouse u_space.zw
#define u_cursorPresence u_cursor.x
#define u_cursorEffect u_cursor.y
#define u_cursorStrength u_cursor.z
#define u_cursorRadius u_cursor.w

float hash21(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float grainHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
#ifndef GL_FRAGMENT_PRECISION_HIGH
  p = mod(p, 31.0);
#endif
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(15731.743, 7892.321) * n);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}

vec3 srgbToLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),
    step(0.04045, c));
}
vec3 linearToSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, c));
}
vec3 linToOklab(vec3 c) {
  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
  l = pow(max(l, 0.0), 1.0 / 3.0);
  m = pow(max(m, 0.0), 1.0 / 3.0);
  s = pow(max(s, 0.0), 1.0 / 3.0);
  return vec3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
}
vec3 oklabToLin(vec3 c) {
  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}
vec3 mixColour(vec3 a, vec3 b, float t) {
  if (u_oklab > 0.5) {
    vec3 la = linToOklab(srgbToLinear(a));
    vec3 lb = linToOklab(srgbToLinear(b));
    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);
  }
  return mix(a, b, t);
}

vec3 palette(float x) {
  float n = max(u_colorCount - 1.0, 1.0);
  float f = clamp(x, 0.0, 1.0) * n;
  vec3 col = u_colors[0];
  for (int i = 0; i < 3; i++) {
    if (float(i) < n)
      col = mixColour(col, u_colors[i + 1],
        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));
  }
  return col;
}

vec3 hueRotate(vec3 col, float a) {
  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,
                          0.587, -0.274, -0.523,
                          0.114, -0.322, 0.312);
  const mat3 toRGB = mat3(1.0, 1.0, 1.0,
                          0.956, -0.272, -1.106,
                          0.621, -0.647, 1.703);
  vec3 yiq = toYIQ * col;
  float ca = cos(a), sa = sin(a);
  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);
  return toRGB * yiq;
}

vec3 shade(vec2 uv, vec2 p, float t) {
  vec2 q = p;
  q.x += sin(q.y * 2.1 + t * 0.2) * (0.08 + u_intensity * 0.32);
  q.y += cos(q.x * 2.7 - t * 0.17) * (0.06 + u_intensity * 0.26);
  float wave = 0.5 + 0.5 * sin(q.x * 2.8 + q.y * 1.9 + fbm(q * 2.0) * 3.0);
  float coarse = hash21(floor((uv + t * 0.002) * (90.0 + u_paramA * 260.0)) + u_seed);
  float grain = (coarse - 0.5) * u_paramA * 0.42;
  return palette(clamp(wave + grain, 0.0, 1.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 screenUv = uv;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
    / min(u_resolution.x, u_resolution.y);

  // Mouse trail: each remembered pointer position pushes the field outward,
  // weighted by age (newest strongest), so the colours smear along the path.
  if (u_cursorPresence > 0.001) {
    float m = min(u_resolution.x, u_resolution.y);
    vec2 push = vec2(0.0);
    for (int i = 0; i < 4; i++) {
      vec4 tp = u_trail[i];
      vec2 c0 = 0.5 * tp.xy * u_resolution.xy / m;
      vec2 c1 = 0.5 * tp.zw * u_resolution.xy / m;
      vec2 d0 = p - c0;
      vec2 d1 = p - c1;
      float w0 = 1.0 - float(i * 2) / 8.0;
      float w1 = 1.0 - float(i * 2 + 1) / 8.0;
      float m0 = w0 * (1.0 - smoothstep(0.0, u_cursorRadius, length(d0)));
      float m1 = w1 * (1.0 - smoothstep(0.0, u_cursorRadius, length(d1)));
      push += normalize(d0 + vec2(0.0001)) * m0 + normalize(d1 + vec2(0.0001)) * m1;
    }
    p -= push * u_cursorPresence * u_cursorStrength * 0.1;
  }

  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;
  p *= u_scale;
  if (abs(u_rotate) > 0.0001) {
    float cr = cos(u_rotate), sr = sin(u_rotate);
    p = mat2(cr, -sr, sr, cr) * p;
  }
  p += u_offset;
  if (u_drift > 0.0001)
    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));
  if (u_warp > 0.0) {
    p += u_warp * (vec2(
      fbm(p * u_detail + u_seed),
      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);
  }
  vec3 col;
  if (u_blur > 0.0) {
    float e = u_blur;
    float pe = e * u_scale;
    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;
    col  = shade(uv, p, u_time) * 0.36;
    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;
    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;
    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;
  } else {
    col = shade(uv, p, u_time);
  }
  if (abs(u_contrast - 1.0) > 0.0001)
    col = (col - 0.5) * u_contrast + 0.5;
  if (abs(u_saturation - 1.0) > 0.0001) {
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(luma), col, u_saturation);
  }
  if (abs(u_hue) > 0.0001)
    col = hueRotate(col, u_hue);
  if (abs(u_brightness) > 0.0001)
    col += u_brightness;
  if (u_vignette > 0.0001) {
    float vd = length(screenUv - 0.5) * 1.41421356;
    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);
  }
  if (u_grain > 0.0001)
    col += (grainHash(
      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

const UNIFORMS = {
  colors: [
    [0.8588235294117647, 0.29411764705882354, 0.5607843137254902],
    [0.24705882352941178, 0.23529411764705882, 0.7333333333333333],
    [0.0392156862745098, 0.0392156862745098, 0.0392156862745098],
    [1, 0.8392156862745098, 0.4196078431372549]
  ],
  colorCount: 4,
  scale: 2.5,
  intensity: 0.77,
  paramA: 0.0,
  warp: 0.432,
  detail: 2.496,
  contrast: 1.329,
  brightness: -0.06,
  saturation: 1.06,
  hue: 0.2967,
  vignette: 0.0,
  blur: 0.0044,
  grain: 0.266,
  seed: 6905.0,
  rotate: 2.1468,
  offsetX: 0.0,
  offsetY: 0.0,
  drift: 0.0,
  // Mouse trail distortion: strength = how hard it bends the gradient, radius = trail thickness.
  cursorStrength: 0.5,
  cursorRadius: 0.1,
  oklab: 0.0,
  timeScale: 1.658
}

export default {
  name: 'GrainGradient',
  props: {
    options: { type: Object, default: () => ({}) }
  },
  mounted () {
    this.teardown = this.start()
  },
  beforeUnmount () {
    if (this.teardown) this.teardown()
  },
  methods: {
    start () {
      // `options` overrides any entry of UNIFORMS (e.g. a different palette) for this instance.
      const U = Object.assign({}, UNIFORMS, this.options)
      const canvas = this.$refs.canvas
      const gl = canvas.getContext('webgl', { antialias: false })
      if (!gl) return null

      const compile = (type, src) => {
        const s = gl.createShader(type)
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          console.error('[GrainGradient] shader compile error:', gl.getShaderInfoLog(s))
        }
        return s
      }
      const program = gl.createProgram()
      const vs = compile(gl.VERTEX_SHADER, VERT)
      const fs = compile(gl.FRAGMENT_SHADER, FRAG)
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('[GrainGradient] program link error:', gl.getProgramInfoLog(program))
      }
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.useProgram(program)

      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      const u = {}
      ;['colors', 'scene', 'shape', 'surface', 'finish', 'transform', 'space', 'cursor', 'trail'].forEach(n => {
        u[n] = gl.getUniformLocation(program, 'u_' + n)
      })
      const flat = [].concat.apply([], U.colors)
      gl.uniform3fv(u.colors, new Float32Array(flat))
      gl.uniform4f(u.shape, U.scale, U.intensity, U.paramA, U.warp)
      gl.uniform4f(u.surface, U.detail, U.contrast, U.brightness, U.saturation)
      gl.uniform4f(u.finish, U.hue, U.vignette, U.blur, U.grain)
      gl.uniform4f(u.transform, U.seed, U.rotate, U.drift, U.oklab)
      gl.uniform4f(u.space, U.offsetX, U.offsetY, 0, 0)
      gl.uniform4f(u.cursor, 0, 0, U.cursorStrength, U.cursorRadius)

      // Pointer + trail state. The smoothed pointer is sampled into a short history;
      // the shader distorts the gradient around each remembered point.
      const TRAIL = 8
      const SAMPLE_MS = 28
      const trail = []
      for (let i = 0; i < TRAIL; i++) trail.push({ x: 0, y: 0 })
      const trailData = new Float32Array(TRAIL * 2)
      let targetX = 0
      let targetY = 0
      let mouseX = 0
      let mouseY = 0
      let presence = 0
      let lastMove = 0
      let lastSample = 0
      let lastNow = null
      let seeded = false

      const onPointerMove = e => {
        const r = canvas.getBoundingClientRect()
        if (!r.width || !r.height) return
        targetX = ((e.clientX - r.left) / r.width) * 2 - 1
        targetY = -(((e.clientY - r.top) / r.height) * 2 - 1)
        if (!seeded) {
          seeded = true
          mouseX = targetX
          mouseY = targetY
          for (let i = 0; i < TRAIL; i++) { trail[i].x = mouseX; trail[i].y = mouseY }
        }
        lastMove = performance.now()
      }
      const onPointerLeave = () => { lastMove = 0 }

      let raf = 0
      let disposed = false
      // A hidden tab doesn't run animation frames anyway, so start as visible: reading the state
      // at mount could leave the loop switched off if the page loaded while in the background.
      let visible = true
      const start = performance.now()

      const resize = () => {
        const rect = canvas.getBoundingClientRect()
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const rawW = Math.max(1, Math.round(rect.width * dpr))
        const rawH = Math.max(1, Math.round(rect.height * dpr))
        // cap the pixel count so large screens stay smooth
        const k = Math.min(1, Math.sqrt(2000000 / (rawW * rawH)))
        const w = Math.max(1, Math.round(rawW * k))
        const h = Math.max(1, Math.round(rawH * k))
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
          gl.viewport(0, 0, w, h)
        }
      }

      const render = now => {
        raf = 0
        if (disposed || !visible) return
        resize()
        const dt = lastNow === null ? 0 : Math.min((now - lastNow) / 1000, 0.1)
        lastNow = now
        const follow = 1 - Math.exp(-14 * dt)
        mouseX += (targetX - mouseX) * follow
        mouseY += (targetY - mouseY) * follow
        // Trail is only "on" while the pointer is moving, then fades out.
        const moving = lastMove > 0 && performance.now() - lastMove < 140
        presence += ((moving ? 1 : 0) - presence) * (1 - Math.exp(-(moving ? 12 : 4) * dt))
        if (now - lastSample > SAMPLE_MS) {
          lastSample = now
          trail.pop()
          trail.unshift({ x: mouseX, y: mouseY })
        }
        for (let i = 0; i < TRAIL; i++) {
          trailData[i * 2] = trail[i].x
          trailData[i * 2 + 1] = trail[i].y
        }
        gl.uniform4fv(u.trail, trailData)
        gl.uniform4f(u.cursor, presence, 0, U.cursorStrength, U.cursorRadius)
        gl.uniform4f(
          u.scene,
          canvas.width,
          canvas.height,
          ((now - start) / 1000) * U.timeScale,
          U.colors.length
        )
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        raf = requestAnimationFrame(render)
      }

      const onVisibility = () => {
        visible = document.visibilityState === 'visible'
        if (visible && !raf) {
          lastNow = null
          raf = requestAnimationFrame(render)
        }
      }
      document.addEventListener('visibilitychange', onVisibility)
      window.addEventListener('resize', resize)
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('blur', onPointerLeave)
      document.documentElement.addEventListener('pointerleave', onPointerLeave)
      raf = requestAnimationFrame(render)

      return () => {
        disposed = true
        cancelAnimationFrame(raf)
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('blur', onPointerLeave)
        document.documentElement.removeEventListener('pointerleave', onPointerLeave)
        gl.deleteBuffer(buf)
        gl.deleteProgram(program)
        const lose = gl.getExtension('WEBGL_lose_context')
        if (lose) lose.loseContext()
      }
    }
  }
}
</script>

<style scoped>
.grain-gradient {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
