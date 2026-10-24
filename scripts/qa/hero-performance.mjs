import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Local-only diagnostic fixture. Never imported by the application.
function diagnostics() {
  const empty = () => ({
    encodes: 0,
    encodeMs: 0,
    videoDraws: 0,
    videoPixels: 0,
    longTasks: 0,
    longTaskMs: 0,
  });
  let counts = empty(),
    active = true,
    output,
    status = 'Startup',
    started = performance.now();
  const encode = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    const start = performance.now();
    const value = encode.apply(this, args);
    if (active) {
      counts.encodes++;
      counts.encodeMs += performance.now() - start;
    }
    return value;
  };
  const draw = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (...args) {
    if (active && args[0] instanceof HTMLVideoElement) {
      counts.videoDraws++;
      counts.videoPixels += this.canvas.width * this.canvas.height;
    }
    return draw.apply(this, args);
  };
  const observer = new PerformanceObserver((list) => {
    if (!active) return;
    for (const entry of list.getEntries()) {
      counts.longTasks++;
      counts.longTaskMs += entry.duration;
    }
  });
  if (PerformanceObserver.supportedEntryTypes.includes('longtask'))
    observer.observe({ type: 'longtask', buffered: true });
  function render() {
    if (output)
      output.textContent = JSON.stringify(
        {
          status,
          elapsedMs: Math.round(performance.now() - started),
          ...counts,
          encodeMs: Math.round(counts.encodeMs),
          longTaskMs: Math.round(counts.longTaskMs),
        },
        null,
        2,
      );
  }
  setTimeout(() => {
    const panel = document.createElement('aside');
    panel.setAttribute('aria-label', 'Diagnóstico local do hero');
    panel.style.cssText =
      'position:fixed;left:12px;bottom:12px;z-index:1000;background:white;color:black;border:1px solid #bbb;border-radius:8px;padding:12px;font:12px monospace;max-width:280px';
    output = document.createElement('pre');
    output.id = 'hero-performance-result';
    output.style.cssText = 'margin:8px 0 0;white-space:pre-wrap;font:inherit';
    const button = document.createElement('button');
    button.textContent = 'Medir hero por 6 segundos';
    button.style.cssText =
      'padding:8px;border:1px solid black;background:#ddd;color:black;font:inherit';
    button.onclick = () => {
      counts = empty();
      active = true;
      started = performance.now();
      status = 'Medindo';
      button.disabled = true;
      render();
      setTimeout(() => {
        active = false;
        status = 'Concluído';
        render();
        button.disabled = false;
      }, 6000);
    };
    panel.append(button, output);
    document.body.append(panel);
    setInterval(() => {
      if (active) render();
    }, 500);
    render();
  }, 3000);
}
const root = fileURLToPath(new URL('../../', import.meta.url));
const html = await readFile(path.join(root, 'out/index.html'), 'utf8');
const reduced = process.argv.includes('--reduced');
const route = reduced ? 'qa-hero-reduced' : 'qa-hero-performance';
const preference = reduced
  ? `<script>
const nativeMedia = window.matchMedia.bind(window);
window.matchMedia = query => query.includes('prefers-reduced-motion') ? {
 media:query,matches:!query.includes('no-preference'),onchange:null,
 addEventListener(){},removeEventListener(){},addListener(){},removeListener(){},dispatchEvent(){return true}
} : nativeMedia(query);
</script><style>*{animation:none!important;transition:none!important}</style>`
  : '';
const destination = path.join(root, `out/${route}`);
await mkdir(destination, { recursive: true });
await writeFile(
  path.join(destination, 'index.html'),
  html.replace('<head>', `<head>${preference}<script>(${diagnostics.toString()})();</script>`),
);
console.log(`Local hero diagnostic fixture: /${route}/ (removed by the next build).`);
