import { paintTestimonialTexture } from './testimonial-texture';

const vertexSource = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;
const fragmentSource = `
precision highp float;
uniform vec2 uCanvas;
uniform vec2 uCard;
uniform float uDpr;
uniform float uLeft;
uniform float uPosition;
uniform float uCompact;
uniform float uInset;
uniform sampler2D uText;
uniform sampler2D uVideo;
uniform sampler2D uThird;
vec4 softSample(sampler2D image, vec2 uv, float scale, float blend) {
  vec2 d = vec2(1.2 * blend) / (uCard * scale);
  vec4 color = texture2D(image, uv) * 0.25;
  color += (texture2D(image, uv + vec2(d.x, 0.0)) + texture2D(image, uv - vec2(d.x, 0.0))
    + texture2D(image, uv + vec2(0.0, d.y)) + texture2D(image, uv - vec2(0.0, d.y))) * 0.125;
  color += (texture2D(image, uv + d) + texture2D(image, uv - d)
    + texture2D(image, uv + vec2(d.x, -d.y)) + texture2D(image, uv + vec2(-d.x, d.y))) * 0.0625;
  return color;
}
vec4 card(float index, vec2 point, sampler2D image, float blend) {
  float slot = mod(index - uPosition + 1.5, 3.0) - 1.5;
  float distance = min(1.0, abs(slot));
  float scale = 1.0 - distance * 0.16;
  vec2 origin = vec2(slot * uCard.x * 0.96, 0.0) + uCard * (1.0 - scale) * 0.5;
  vec2 uv = (point - origin) / (uCard * scale);
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  vec4 color = softSample(image, vec2(uv.x, 1.0 - uv.y), scale, blend);
  vec2 rim = min(uv, 1.0 - uv) * uCard * scale;
  color.a *= smoothstep(0.0, 1.0, min(rim.x, rim.y));
  color.a *= 1.0 - distance * 0.58;
  return vec4(color.rgb * color.a, color.a);
}
void main() {
  vec2 point = vec2(gl_FragCoord.x / uDpr - uLeft,
    (uCanvas.y - gl_FragCoord.y) / uDpr - uCard.y * 0.25);
  float outside = max(-point.x, point.x - uCard.x);
  // Compact cards bring the lens inside their edges only while moving.
  // The complementary HTML mask uses the same inset and overlap width.
  if (outside <= -uInset) discard;
  float overlap = mix(48.0, 12.0, uCompact);
  float blend = clamp((outside + uInset) / overlap, 0.0, 1.0);
  // Both layers must show identical pixels throughout their overlap. Start
  // bending only after HTML has faded out, avoiding double letters/edges.
  float lens = smoothstep(48.0, 112.0, outside);
  if (uCompact > 0.5) lens = smoothstep(12.0, 48.0, outside + uInset);
  float cx = (point.x - uCard.x * 0.5) / (uCanvas.x / uDpr);
  float edge = smoothstep(0.34, 0.5, abs(cx));
  edge *= edge * lens;
  if (uCompact > 0.5) edge = lens;
  float cy = point.y - uCard.y * 0.5;
  point += vec2(-cx * (uCanvas.x / uDpr) * 0.03 * edge,
    -cy * (1.0 - 1.0 / (1.0 + 0.45 * edge)));
  vec4 a = card(0.0, point, uText, lens);
  vec4 b = card(1.0, point, uVideo, lens);
  vec4 c = card(2.0, point, uThird, lens);
  gl_FragColor = (a + b * (1.0 - a.a) + c * (1.0 - a.a) * (1.0 - b.a)) * blend;
}
`;

export type TestimonialGlass = { draw: (position: number) => boolean; dispose: () => void };

// Cached card textures and one GPU pass. No independent animation loop:
// scrolling a resting carousel never redraws or uploads its textures.
export async function createTestimonialGlass(
  canvas: HTMLCanvasElement,
  rail: HTMLElement,
  unavailable: () => void,
  signal: AbortSignal,
): Promise<TestimonialGlass | null> {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const textures: WebGLTexture[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  let lost = false;
  let released = false;
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    unavailable();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const dispose = () => {
    if (released) return;
    released = true;
    canvas.removeEventListener('webglcontextlost', onLost);
    signal.removeEventListener('abort', dispose);
    textures.forEach((texture) => gl.deleteTexture(texture));
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
  signal.addEventListener('abort', dispose, { once: true });
  try {
    if (!program || !buffer) throw new Error('WebGL allocation failed');
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertexSource],
      [gl.FRAGMENT_SHADER, fragmentSource],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('WebGL shader allocation failed');
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error('WebGL shader compilation failed');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('WebGL linking failed');
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const width = rail.clientWidth;
    const height = rail.clientHeight;
    const compact =
      !rail.querySelector('.agent-result-surface') && matchMedia('(max-width: 59.999em)').matches;
    const readingWindow = rail.closest('.testimonial-reading-window') as HTMLElement;
    const dpr = Math.min(
      devicePixelRatio || 1,
      2,
      maxTexture / Math.max(innerWidth, height * 1.5, width),
    );
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(height * 1.5 * dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${height * 1.5}px`;
    canvas.style.left = `${-rail.getBoundingClientRect().left}px`;
    canvas.style.top = `${-height * 0.25}px`;
    const agentSurfaces = [...rail.querySelectorAll<HTMLElement>('.agent-result-surface')];
    const text = rail.querySelector<HTMLElement>('.testimonial-text')!;
    const surfaces = agentSurfaces.length
      ? agentSurfaces
      : [text, rail.querySelector<HTMLElement>('.testimonial-video')!];
    const sources = await Promise.all(
      surfaces.map((surface) => paintTestimonialTexture(surface, dpr)),
    );
    if (lost || signal.aborted) {
      dispose();
      return null;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    sources.forEach((source, index) => {
      const texture = gl.createTexture();
      if (!texture) throw new Error('WebGL texture allocation failed');
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.uniform1i(gl.getUniformLocation(program, ['uText', 'uVideo', 'uThird'][index]), index);
    });
    if (!agentSurfaces.length) gl.uniform1i(gl.getUniformLocation(program, 'uThird'), 0);
    gl.uniform2f(gl.getUniformLocation(program, 'uCanvas'), canvas.width, canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'uCard'), width, height);
    gl.uniform1f(gl.getUniformLocation(program, 'uDpr'), dpr);
    gl.uniform1f(gl.getUniformLocation(program, 'uLeft'), rail.getBoundingClientRect().left);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    const positionUniform = gl.getUniformLocation(program, 'uPosition');
    const insetUniform = gl.getUniformLocation(program, 'uInset');
    gl.uniform1f(gl.getUniformLocation(program, 'uCompact'), compact ? 1 : 0);
    let previous = NaN;
    return {
      draw(position) {
        if (lost || gl.isContextLost()) return false;
        if (position === previous) return true;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(positionUniform, position);
        const inset = compact ? 56 * Math.sin(Math.PI * (position - Math.floor(position))) : 0;
        gl.uniform1f(insetUniform, inset);
        readingWindow.style.setProperty('--testimonial-lens-inset', `${inset}px`);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        // Avoid synchronous GPU error queries during animation.
        if (Number.isNaN(previous) && gl.getError() !== gl.NO_ERROR) return false;
        previous = position;
        return true;
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}
