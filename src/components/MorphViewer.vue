<template>
  <div class="morph">
    <canvas v-show="!failed" ref="canvas" class="morph__canvas" :class="{ 'is-ready': ready }"></canvas>
    <!-- Without WebGL the same frames still work, as a plain cross-fade. -->
    <transition v-if="failed" name="morph-fade">
      <img :key="index" class="morph__fallback" :src="srcFor(index)" alt="" />
    </transition>
  </div>
</template>

<script>
// Vue 2 port of the "Morph Gallery" dissolve (21st.dev). Slides tear into each other
// through fbm noise instead of cutting; the incoming frame's bright areas burn through first.
// Changed from the original: images are fit with `contain` (artwork is never cropped) on a flat
// background, and only the frames around the current one are kept as textures, so a volume
// with hundreds of images doesn't load them all at once.

const VERT = `attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG = `precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;
uniform vec3 u_bg;
// Each frame's contained rectangle, as width/height fractions of the canvas.
uniform vec2 u_fromBox;
uniform vec2 u_toBox;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Drifted samples that run past the picture edge are reflected back into it
// rather than smeared or blanked.
vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

// Image drawn cover-fit inside the current frame. At rest the frame has the image's own
// shape, so this is an exact, uncropped fit; mid-transition it crops slightly.
vec3 sampleFrame(sampler2D tex, vec2 local, float imgAspect, float boxAspect) {
  vec2 s = (boxAspect > imgAspect)
    ? vec2(1.0, imgAspect / boxAspect)
    : vec2(boxAspect / imgAspect, 1.0);
  vec4 c = texture2D(tex, mirror((local - 0.5) * s + 0.5));
  return mix(u_bg, c.rgb, c.a);
}

void main() {
  // One shared frame that reshapes from the old artwork's rectangle to the new one's,
  // so a tall image and a wide one morph into each other instead of leaving fragments.
  vec2 box = mix(u_fromBox, u_toBox, u_progress);
  vec2 local = (v_uv - 0.5) / box + 0.5;
  if (local.x < 0.0 || local.x > 1.0 || local.y < 0.0 || local.y > 1.0) {
    gl_FragColor = vec4(u_bg, 1.0);
    return;
  }
  float boxAspect = (box.x * u_resolution.x) / (box.y * u_resolution.y);

  // Widen the sweep by one edge at each end so progress 0 and 1 are fully one frame.
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  // u_direction is +1 going forward (next artwork), -1 going back.
  // The noise field rises going forward and sinks going back, like a scroll.
  float noise = fbm(v_uv * u_scale - vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  // Bright parts of the incoming frame cross the threshold first and burn through.
  noise = smoothstep(0.0, 2.0, length(sampleFrame(u_to, local, u_toAspect, boxAspect)) + noise);
  // Bias the threshold by height so the new frame comes in from the bottom going forward
  // and from the top going back; the noise keeps the front torn rather than a straight wipe.
  float sweep = u_direction > 0.0 ? local.y : 1.0 - local.y;
  noise = mix(noise, sweep, 0.55);

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  // Going forward the old frame lifts up and away while the new one rises into place
  // from below (reversed going back), at different speeds so the tatters have parallax.
  vec3 fromCol = sampleFrame(u_from,
    local - vec2(0.0, noise * u_progress * u_drift * u_direction), u_fromAspect, boxAspect);
  vec3 toCol = sampleFrame(u_to,
    local + vec2(0.0, noise * (1.0 - u_progress) * 0.5 * u_drift * u_direction), u_toAspect, boxAspect);

  gl_FragColor = vec4(mix(fromCol, toCol, mixFactor), 1.0);
}`

// Quintic in-out: the dissolve starts and ends still and hurries the middle.
const easeInOutQuint = t => {
  const x = Math.min(Math.max(t, 0), 1)
  return x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2
}

// How many frames either side of the current one are kept loaded as textures.
const KEEP = 2
// Largest texture side we upload; some source images are several thousand pixels and
// many MB, and uploading those at full size freezes the page.
const MAX_TEXTURE = 2048

export default {
  name: 'MorphViewer',
  props: {
    // [{ small, large }] image URLs, one per frame.
    frames: { type: Array, required: true },
    index: { type: Number, default: 0 },
    duration: { type: Number, default: 1200 },
    noiseScale: { type: Number, default: 3.5 },
    edge: { type: Number, default: 0.15 },
    drift: { type: Number, default: 0.5 },
    // Page background behind the artwork, as 0..1 rgb.
    background: { type: Array, default: () => [0.933, 0.933, 0.933] }
  },
  data () {
    return { ready: false, failed: false }
  },
  watch: {
    index (i) {
      if (this.engine) this.engine.show(i)
    },
    frames () {
      // A different volume: rebuild from scratch.
      this.teardown()
      this.ready = false
      this.failed = false
      this.$nextTick(() => { this.engine = this.start() })
    }
  },
  mounted () {
    this.engine = this.start()
  },
  beforeUnmount () {
    this.teardown()
  },
  methods: {
    teardown () {
      if (this.engine) this.engine.destroy()
      this.engine = null
    },
    srcFor (i) {
      const f = this.frames[i]
      if (!f) return ''
      return (this.$el && this.$el.clientWidth * (window.devicePixelRatio || 1) > 900) ? f.large : f.small
    },
    start () {
      const vm = this
      const canvas = this.$refs.canvas
      const gl = canvas.getContext('webgl', { alpha: false, antialias: false }) ||
        canvas.getContext('experimental-webgl')
      if (!gl || !this.frames.length) {
        this.failed = !!this.frames.length
        return null
      }

      const compile = (type, src) => {
        const s = gl.createShader(type)
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
        return s
      }
      let program
      try {
        program = gl.createProgram()
        const vs = compile(gl.VERTEX_SHADER, VERT)
        const fs = compile(gl.FRAGMENT_SHADER, FRAG)
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        gl.deleteShader(vs)
        gl.deleteShader(fs)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
      } catch (err) {
        console.error('[MorphViewer]', err)
        this.failed = true
        return null
      }
      gl.useProgram(program)

      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(program, 'a_position')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      const u = {}
      ;['from', 'to', 'progress', 'resolution', 'fromAspect', 'toAspect', 'scale', 'direction', 'edge', 'drift', 'bg', 'fromBox', 'toBox']
        .forEach(n => { u[n] = gl.getUniformLocation(program, 'u_' + n) })
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

      // index -> { tex, aspect } once loaded, or 'loading'.
      const cache = new Map()
      let disposed = false
      let raf = 0
      let dirty = true

      // Dissolve state.
      let from = this.index
      let to = this.index
      let progress = 1
      let startedAt = 0
      let direction = 1
      let pending = null
      // Pressed again while a dissolve was still running: the next dissolve catches up faster.
      let queued = false
      let span = 0

      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const ensure = i => {
        if (i < 0 || i >= vm.frames.length || cache.has(i)) return
        cache.set(i, 'loading')
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.decoding = 'async'
        img.onload = () => {
          if (disposed || cache.get(i) !== 'loading') return
          const tex = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, tex)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shrink(img))
          // Photos aren't powers of two, so WebGL1 only allows clamp + linear here.
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          cache.set(i, { tex, aspect: img.naturalWidth / Math.max(img.naturalHeight, 1) })
          dirty = true
        }
        img.onerror = () => {
          if (disposed) return
          // Not every image has the smaller size; fall back to the large one before giving up.
          const large = vm.frames[i] && vm.frames[i].large
          if (large && img.src.indexOf(large) === -1) {
            img.src = large
            return
          }
          // A broken image costs one frame: it stays blank (page background).
          cache.set(i, { tex: null, aspect: 1 })
        }
        img.src = vm.srcFor(i)
      }

      // Scale oversized images down before they reach the GPU.
      const shrink = img => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        const limit = Math.min(MAX_TEXTURE, Math.max(1024, canvas.width, canvas.height))
        const k = limit / Math.max(w, h)
        if (k >= 1) return img
        const c = document.createElement('canvas')
        c.width = Math.max(1, Math.round(w * k))
        c.height = Math.max(1, Math.round(h * k))
        const ctx = c.getContext('2d')
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, c.width, c.height)
        return c
      }

      // Load the neighbourhood of `center`, free textures that drifted out of it.
      const refresh = center => {
        for (let d = 0; d <= KEEP; d++) { ensure(center + d); ensure(center - d) }
        cache.forEach((entry, i) => {
          if (Math.abs(i - center) > KEEP + 1 && i !== from && i !== to && i !== pending) {
            if (entry && entry.tex) gl.deleteTexture(entry.tex)
            cache.delete(i)
          }
        })
      }

      const loaded = i => {
        const e = cache.get(i)
        return e && e !== 'loading' ? e : null
      }

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = Math.round(canvas.clientWidth * dpr)
        const h = Math.round(canvas.clientHeight * dpr)
        if (!w || !h || (canvas.width === w && canvas.height === h)) return
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        dirty = true
      }
      const observer = new ResizeObserver(resize)
      observer.observe(canvas)

      // object-fit: contain, as [width, height] fractions of the canvas.
      const containBox = aspect => {
        const canvasAspect = canvas.width / Math.max(canvas.height, 1)
        return canvasAspect > aspect ? [aspect / canvasAspect, 1] : [1, canvasAspect / aspect]
      }

      const bindFrame = (unit, uniform, entry) => {
        gl.activeTexture(unit === 0 ? gl.TEXTURE0 : gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, entry && entry.tex)
        gl.uniform1i(uniform, unit)
      }

      const frame = now => {
        raf = requestAnimationFrame(frame)
        // A requested frame starts once the running dissolve has finished (cutting one off
        // mid-way makes the picture jump) and its texture is in. Rapid presses only keep the
        // latest request, and that catch-up dissolve runs faster.
        if (pending !== null && progress >= 1 && loaded(pending)) {
          from = to
          direction = pending > to ? 1 : -1
          to = pending
          pending = null
          progress = 0
          startedAt = now
          span = reduced ? 0 : Math.max(vm.duration, 1) * (queued ? 0.6 : 1)
          queued = false
          refresh(to)
        }
        if (progress < 1) {
          progress = span === 0 ? 1 : easeInOutQuint((now - startedAt) / span)
          dirty = true
        }
        const fromE = loaded(from) || loaded(to)
        const toE = loaded(to)
        if (!dirty || !toE) return
        dirty = false
        if (!vm.ready) vm.ready = true

        bindFrame(0, u.from, fromE)
        bindFrame(1, u.to, toE)
        gl.uniform1f(u.progress, progress)
        gl.uniform2f(u.resolution, canvas.width, canvas.height)
        gl.uniform1f(u.fromAspect, fromE.aspect)
        gl.uniform1f(u.toAspect, toE.aspect)
        gl.uniform1f(u.scale, vm.noiseScale)
        gl.uniform1f(u.direction, direction)
        gl.uniform1f(u.edge, Math.max(vm.edge, 0.001))
        gl.uniform1f(u.drift, vm.drift)
        gl.uniform3f(u.bg, vm.background[0], vm.background[1], vm.background[2])
        gl.uniform2fv(u.fromBox, containBox(fromE.aspect))
        gl.uniform2fv(u.toBox, containBox(toE.aspect))
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      resize()
      refresh(this.index)
      raf = requestAnimationFrame(frame)

      return {
        show (i) {
          if (progress < 1) queued = true
          // Back to where we're already heading: nothing new to dissolve to.
          pending = i === to ? null : i
          if (pending === null) queued = false
          else refresh(i)
        },
        destroy () {
          disposed = true
          cancelAnimationFrame(raf)
          observer.disconnect()
          cache.forEach(e => { if (e && e.tex) gl.deleteTexture(e.tex) })
          cache.clear()
          gl.deleteBuffer(buffer)
          gl.deleteProgram(program)
        }
      }
    }
  }
}
</script>

<style scoped>
.morph {
  position: relative;
  width: 100%;
  height: 100%;
}

.morph__canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.morph__canvas.is-ready {
  opacity: 1;
}

.morph__fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.morph-fade-enter-active,
.morph-fade-leave-active {
  transition: opacity 0.6s ease;
}

.morph-fade-enter-from,
.morph-fade-leave-to {
  opacity: 0;
}
</style>
