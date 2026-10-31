'use client';
import { useEffect, useRef } from 'react';
import { parseSvgPath, containsPoint, type Point } from './runner-geometry';
type Obstacle = { left: number; right: number; top: number; width: number };
type TerrainPath = {
  polygons: Point[][];
  rect: DOMRect;
  viewBox: [number, number, number, number];
};

function isBlackFill(element: SVGGeometryElement) {
  const fill = element.getAttribute('fill') ?? getComputedStyle(element).fill;
  return fill === 'black' || fill === '#000' || fill === '#000000' || fill === 'rgb(0, 0, 0)';
}

export function useFooterRunner() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const runner = stage.querySelector<HTMLElement>('.footer-runner-pixel');
    const topMarker = stage
      .closest<HTMLElement>('.section-rodape')
      ?.querySelector<HTMLElement>('.footer-decoration--top-left');
    if (!runner || !topMarker) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = 0;
    let visible = false;
    let width = 0;
    let ground = 0;
    let startX = 0;
    let startY = 0;
    let size = 24;
    let runnerHeight = 23;
    let x = 0;
    let y = 0;
    let dropProgress = 0;
    let landingPause = 0;
    let rest = 0;
    let deathX = 0;
    let jump: {
      elapsed: number;
      duration: number;
      height: number;
      fromX: number;
      landX: number;
      fromY: number;
      landY: number;
    } | null = null;
    let obstacles: Obstacle[] = [];
    let terrain = new Float32Array(0);

    const place = (nextX: number, nextY: number, rotation = 0) => {
      runner.style.transform = `translate3d(${nextX}px,${nextY}px,0) rotate(${rotation}deg)`;
    };

    const measure = () => {
      const bounds = stage.getBoundingClientRect();
      const marker = topMarker.getBoundingClientRect();
      width = bounds.width;
      size = (marker.width * 24) / 102;
      runnerHeight = (size * 23) / 24;
      startX = marker.left - bounds.left + (marker.width * 39) / 102;
      startY = marker.top - bounds.top + (marker.height * 73) / 96;
      ground = bounds.height - 30 - runnerHeight;
      const footer = stage.closest<HTMLElement>('.section-rodape');
      obstacles = Array.from(footer?.querySelectorAll<HTMLElement>('.footer-bottom-art') ?? [])
        .filter((item) => getComputedStyle(item).display !== 'none')
        .map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            left: rect.left - bounds.left,
            right: rect.right - bounds.left,
            top: rect.top - bounds.top,
            width: rect.width,
          };
        });
      // Each exported SVG carries a 1,440 px black floor rectangle. It is
      // represented by `ground`; only black paths raise the terrain so the
      // runner lands on the actual silhouette of each obstacle.
      terrain = new Float32Array(Math.ceil(width) + 1).fill(ground);
      const paths: TerrainPath[] = Array.from(
        footer?.querySelectorAll<SVGPathElement>('.footer-bottom-art path') ?? [],
      )
        .filter((path) => isBlackFill(path))
        .map((path) => {
          const svg = path.closest<SVGSVGElement>('svg');
          const d = path.getAttribute('d');
          if (!svg || !d) return null;
          const viewBox = (
            svg.getAttribute('viewBox') ??
            `0 0 ${svg.getAttribute('width')} ${svg.getAttribute('height')}`
          )
            .trim()
            .split(/[\s,]+/)
            .map(Number);
          if (viewBox.length !== 4 || viewBox.some(Number.isNaN)) return null;
          return {
            polygons: parseSvgPath(d),
            rect: svg.getBoundingClientRect(),
            viewBox: viewBox as [number, number, number, number],
          };
        })
        .filter((path): path is TerrainPath => path !== null);
      for (const terrainPath of paths) {
        const left = Math.max(0, Math.floor(terrainPath.rect.left - bounds.left));
        const right = Math.min(terrain.length - 1, Math.ceil(terrainPath.rect.right - bounds.left));
        const top = Math.max(0, Math.floor(terrainPath.rect.top - bounds.top));
        const bottom = Math.min(
          Math.ceil(ground + runnerHeight),
          Math.ceil(terrainPath.rect.bottom - bounds.top),
        );
        for (let column = left; column <= right; column++) {
          for (let row = top; row <= Math.min(bottom, terrain[column] + runnerHeight); row++) {
            const localX =
              terrainPath.viewBox[0] +
              ((bounds.left + column - terrainPath.rect.left) / terrainPath.rect.width) *
                terrainPath.viewBox[2];
            const localY =
              terrainPath.viewBox[1] +
              ((bounds.top + row - terrainPath.rect.top) / terrainPath.rect.height) *
                terrainPath.viewBox[3];
            if (containsPoint(terrainPath.polygons, localX, localY)) {
              terrain[column] = Math.min(terrain[column], row - runnerHeight);
              break;
            }
          }
        }
      }
      // Keep the launch height tied to the highest black path of each SVG,
      // not its element box (which also includes lime decoration and clipping).
      obstacles = obstacles.map((obstacle) => {
        let top = ground + runnerHeight;
        const left = Math.max(0, Math.floor(obstacle.left));
        const right = Math.min(terrain.length - 1, Math.ceil(obstacle.right));
        for (let column = left; column <= right; column++)
          top = Math.min(top, terrain[column] + runnerHeight);
        return { ...obstacle, top };
      });
      runner.style.width = `${size}px`;
      runner.style.height = `${runnerHeight}px`;
      x = startX;
      y = startY;
      dropProgress = 0;
      landingPause = 0;
      rest = 0;
      deathX = width * (0.25 + Math.random() * 0.6);
      jump = null;
      runner.style.opacity = '1';
      place(x, y);
    };

    const reset = () => {
      x = startX;
      y = startY;
      dropProgress = 0;
      landingPause = 0;
      rest = 0;
      deathX = width * (0.25 + Math.random() * 0.6);
      jump = null;
      runner.style.opacity = '1';
      place(x, y);
    };

    // The black strip is the fallback floor; inline path data raises it where
    // a real vector is filled, including the vector's internal gaps and steps.
    const surfaceAt = (atX: number) => {
      let surface = ground;
      const left = Math.max(0, Math.floor(atX));
      const right = Math.min(terrain.length - 1, Math.ceil(atX + size));
      for (let column = left; column <= right; column++)
        surface = Math.min(surface, terrain[column]);
      return surface;
    };

    const explode = () => {
      runner.style.opacity = '0';
      for (let index = 0; index < 10; index++) {
        const particle = document.createElement('span');
        particle.className = 'footer-runner-particle';
        stage.appendChild(particle);
        const angle = (index / 10) * Math.PI * 2;
        const distance = size * (1.8 + Math.random() * 2);
        const originX = x + size / 2;
        const originY = y + runnerHeight / 2;
        const animation = particle.animate(
          [
            { transform: `translate3d(${originX}px,${originY}px,0) scale(1)`, opacity: 1 },
            {
              transform: `translate3d(${originX + Math.cos(angle) * distance}px,${originY + Math.sin(angle) * distance - size}px,0) rotate(160deg) scale(.25)`,
              opacity: 0,
            },
          ],
          { duration: 420, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        );
        animation.onfinish = () => particle.remove();
      }
    };

    const tick = (now: number) => {
      const delta = last ? Math.min((now - last) / 1000, 0.04) : 0;
      last = now;
      if (rest > 0) {
        rest = Math.max(0, rest - delta);
        runner.style.opacity = '0';
        if (rest === 0) reset();
      } else if (dropProgress < 1) {
        dropProgress = Math.min(
          1,
          dropProgress + delta / Math.sqrt((2 * Math.max(1, surfaceAt(startX) - startY)) / 1800),
        );
        const landingSurface = surfaceAt(startX);
        y = startY + (landingSurface - startY) * dropProgress * dropProgress;
        if (dropProgress === 1) landingPause = 0.06;
        place(x, y);
      } else if (landingPause > 0) {
        // Let the first contact read as a landing before horizontal motion
        // begins; this removes the sideways skid at the top of the first SVG.
        landingPause = Math.max(0, landingPause - delta);
        y = surfaceAt(x) - Math.sin((1 - landingPause / 0.06) * Math.PI) * 4;
        place(x, y);
      } else {
        const speed = Math.max(170, width * 0.15);
        const next = obstacles.find((obstacle) => obstacle.right > x && obstacle.left > x - size);
        if (!jump) {
          // Use one shared target for horizontal travel and the landing
          // surface. Matching those values prevents a visible snap at the end
          // of each arc.
          const fromY = surfaceAt(x);
          const crossingObstacle = next && x + size >= next.left - 42;
          const landingX = Math.min(deathX, crossingObstacle ? next.right + 42 : x + 80);
          const landY = surfaceAt(landingX);
          const distance = Math.max(1, landingX - x);
          const height = Math.max(
            32,
            Math.min(fromY, landY) - (crossingObstacle ? next.top : ground) + runnerHeight + 8,
          );
          jump = {
            elapsed: 0,
            duration: Math.max(distance / speed, Math.sqrt((8 * height) / 1800)),
            fromX: x,
            landX: landingX,
            fromY,
            landY,
            height,
          };
        }
        let rotation = 0;
        if (jump) {
          jump.elapsed += delta;
          const progress = Math.min(1, jump.elapsed / jump.duration);
          x = jump.fromX + (jump.landX - jump.fromX) * progress;
          y =
            jump.fromY +
            (jump.landY - jump.fromY) * progress -
            4 * progress * (1 - progress) * jump.height;
          rotation = progress * 360;
          if (progress === 1) {
            jump = null;
            if (x >= deathX) {
              rest = 0.65;
              explode();
            }
          }
        } else {
          y = surfaceAt(x);
        }
        if (x > width + size) reset();
        else place(x, y, rotation);
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (reduced.matches) {
        runner.style.opacity = '0';
        return;
      }
      runner.style.opacity = rest > 0 ? '0' : '1';
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resize = new ResizeObserver(measure);
    observer.observe(stage);
    resize.observe(stage);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    measure();
    sync();

    return () => {
      cancelAnimationFrame(frame);
      stage.querySelectorAll('.footer-runner-particle').forEach((particle) => particle.remove());
      observer.disconnect();
      resize.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return stageRef;
}
