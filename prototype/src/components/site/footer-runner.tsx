"use client";

import { useEffect, useState } from 'react';
import './footer-runner.css';

const socialLinks = [
  { name: 'email', label: 'E-mail', href: 'mailto:contato@beyondthebytes.com.br' },
  { name: 'whatsapp', label: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=5511936191071' },
  { name: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/beyond-the-bytes/' },
  { name: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/beyond.thebytes/' },
  { name: 'x', label: 'X', href: 'https://x.com/beyondthebytes' },
];

/** Decorative runner: all coordinates are measured from the original footer art. */
export function FooterRunner({ artwork }: { artwork: string }) {
  const [art, setArt] = useState<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!art || !stage) return;
    const root = stage;
    const source = art.querySelector<SVGRectElement>('[id="Frame 34"] rect');
    if (!source) return;
    const runner = root.querySelector<HTMLElement>('.footer-runner-pixel')!;
    const particles = Array.from(root.querySelectorAll<HTMLElement>('.footer-runner-particle'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, last = 0, elapsed = 0, visible = false, previousStop = -1;
    let width = 0, height = 0, startX = 39, startY = 73, size = 24;
    let stop = 0, travel = 0, ground = 0;
    let platforms: { x: number; y: number }[] = [];
    let terrain = new Float32Array(0);
    let jumpHeights: number[] = [];
    const surface = (x: number, rotation = 0) => {
      // Rotation enlarges the square's footprint and lowers its bottom corner.
      const radians = rotation * Math.PI / 180;
      const overhang = size * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)) - 1) / 2;
      let top = ground;
      const left = Math.max(0, Math.floor(x - overhang));
      const right = Math.min(terrain.length - 1, Math.ceil(x + size + overhang));
      for (let column = left; column <= right; column++) top = Math.min(top, terrain[column]);
      return top - size - overhang - 1;
    };
    let debris: { vx: number; vy: number; spin: number }[] = [];
    const position = (node: HTMLElement, x: number, y: number, rotation = 0) => {
      node.style.transform = `translate3d(${x}px,${y}px,0) rotate(${rotation}deg)`;
    };
    const reset = () => {
      elapsed = 0;
      // Choose a different landing platform each round, including early failures.
      const choices = platforms.length - 2;
      let next = 2 + Math.floor(Math.random() * choices);
      if (next === previousStop) next = 2 + ((next - 1) % choices);
      previousStop = stop = next;
      travel = (platforms[stop].x - startX) / Math.max(120, width * .16);
      debris = particles.map((_, i) => {
        const angle = Math.PI * 2 * i / particles.length;
        const speed = 65 + Math.random() * 110;
        return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 95, spin: (Math.random() - .5) * 700 };
      });
    };
    const measure = () => {
      const bounds = root.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      const original = source.getBoundingClientRect();
      const desktop = original.width > 0;
      size = desktop ? original.width : 20;
      startX = desktop ? original.left - bounds.left : 24;
      startY = desktop ? original.top - bounds.top : 24;
      ground = height - 30;
      runner.style.width = `${size}px`; runner.style.height = `${size}px`;
      // Build a one-pixel height map from every filled base vector, including
      // the green squares. Cache it on resize, never scan SVG paths per frame.
      const shapes = desktop ? Array.from(art.querySelectorAll<SVGGeometryElement>('[id="Container_78"] path, [id="Container_78"] rect, [id="Container_78"] circle, [id="Container_78"] polygon')) : [];
      terrain = new Float32Array(Math.ceil(width) + 1).fill(ground);
      for (const el of shapes) {
        const style = getComputedStyle(el);
        if (style.fill === 'none' || style.visibility === 'hidden' || style.display === 'none') continue;
        const inverse = el.getScreenCTM()?.inverse();
        if (!inverse) continue;
        const box = el.getBoundingClientRect();
        const left = Math.max(0, Math.floor(box.left - bounds.left));
        const right = Math.min(terrain.length - 1, Math.ceil(box.right - bounds.left));
        const top = Math.max(0, Math.floor(box.top - bounds.top));
        const bottom = Math.min(height, Math.ceil(box.bottom - bounds.top));
        for (let x = left; x <= right; x++) {
          for (let y = top; y <= Math.min(bottom, terrain[x]); y++) {
            if (el.isPointInFill(new DOMPoint(bounds.left + x, bounds.top + y).matrixTransform(inverse))) {
              terrain[x] = y - 1;
              break;
            }
          }
        }
      }
      const count = Math.max(5, Math.round(width / 135));
      platforms = Array.from({ length: count }, (_, i) => {
        const x = startX + (width - size - 28 - startX) * i / (count - 1);
        return { x, y: desktop ? surface(x) : ground - size - (i % 2 ? 16 : 0) };
      });
      // Plan clearance across the whole jump, not only at the landing point.
      jumpHeights = platforms.slice(0, -1).map((from, index) => {
        const to = platforms[index + 1];
        let lift = 100;
        const samples = Math.ceil((to.x - from.x) / 2);
        for (let step = 1; step < samples; step++) {
          const t = step / samples;
          const ceiling = surface(from.x + (to.x - from.x) * t, t * 90);
          lift = Math.max(lift, (from.y + (to.y - from.y) * t - ceiling) / (4 * t * (1 - t)));
        }
        return lift;
      });
      reset();
      position(runner, startX, startY);
      runner.style.opacity = '1';
      particles.forEach(p => { p.style.opacity = '0'; });
    };
    const tick = (now: number) => {
      const delta = last ? Math.min((now - last) / 1000, .05) : 0;
      last = now;
      elapsed += delta;
      const dropStart = .65, dropEnd = 1.65, runStart = 1.9;
      const death = runStart + travel;
      let x = startX, y = startY, rotation = 0;
      runner.style.opacity = '1';
      particles.forEach(p => { p.style.opacity = '0'; });
      if (elapsed >= dropStart && elapsed < dropEnd) {
        const t = (elapsed - dropStart) / (dropEnd - dropStart);
        y += (platforms[0].y - startY) * t * t;
      } else if (elapsed >= dropEnd && elapsed < runStart) {
        y = platforms[0].y - Math.sin((elapsed - dropEnd) / .25 * Math.PI) * 13;
      } else if (elapsed >= runStart) {
        const progress = Math.min(1, (elapsed - runStart) / travel) * stop;
        const index = Math.min(stop - 1, Math.floor(progress));
        const t = progress - index;
        const from = platforms[index], to = platforms[index + 1];
        x = from.x + (to.x - from.x) * t;
        y = from.y + (to.y - from.y) * t - 4 * t * (1 - t) * jumpHeights[index];
        rotation = t * 90;
        y = Math.min(y, surface(x, rotation));
      }
      position(runner, x, y, rotation);
      if (elapsed >= death) {
        runner.style.opacity = '0';
        const t = elapsed - death;
        particles.forEach((p, i) => {
          p.style.opacity = `${Math.max(0, 1 - t / .7)}`;
          position(p, x + size / 2 + debris[i].vx * t, y + size / 2 + debris[i].vy * t + 250 * t * t, debris[i].spin * t);
        });
        if (t > 1.3) reset();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); last = 0;
      const active = !reduced.matches;
      source.style.opacity = active ? '0' : '';
      root.style.visibility = active ? 'visible' : 'hidden';
      if (active && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(root);
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    measure(); sync();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      source.style.opacity = '';
    };
  // Rebind when React replaces either surface, including during live edits.
  }, [art, stage, artwork]);

  return <>
    <div key="footer-art" ref={setArt} className="figma-art bleed-art footer-original-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: artwork }}/>
    <a className="footer-brand-link" href="#inicio" aria-label="Beyond the Bytes — voltar ao início" />
    <a className="footer-badge-hit footer-badge-softex" href="https://softdex.com.br/empresa/beyond-the-bytes" target="_blank" rel="noopener noreferrer" aria-label="Avalie-nos na Softdex (abre em nova aba)" />
    <button type="button" className="footer-badge-hit footer-badge-google" aria-label="Adicionar como fonte preferida no Google" />
    <div className="footer-socials" role="group" aria-label="Redes sociais">
      {socialLinks.map(({ name, label, href }) =>
        <a key={name} href={href} className="button footer-social" aria-label={label} target={name === 'email' ? undefined : '_blank'} rel={name === 'email' ? undefined : 'noopener noreferrer'}>
          <img className="button-icon" src={`/assets/figma/footer-social-${name}.svg`} width={40} height={40} alt="" />
        </a>
      )}
    </div>
    <div key="footer-runner" ref={setStage} className="footer-runner-stage" aria-hidden="true">
      <span className="footer-runner-pixel"/>
      {Array.from({ length: 12 }, (_, i) => <span key={i} className="footer-runner-particle"/>)}
    </div>
  </>;
}
