const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
});

document.querySelectorAll('.pages button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.pages .active')?.classList.remove('active');
    button.classList.add('active');
  });
});

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.form-status');

  if (!form.checkValidity()) {
    form.reportValidity();
    status.textContent = 'Preencha os campos obrigatórios para continuar.';
    return;
  }

  status.textContent = 'Mensagem recebida. Nosso time entrará em contato em breve.';
  form.reset();
});

const clientTooltip = document.querySelector('.client-tooltip');
const showClientTooltip = (client) => {
  if (!clientTooltip) return;
  const rect = client.getBoundingClientRect();
  const name = client.querySelector('strong')?.textContent || '';
  const image = clientTooltip.querySelector('img');
  image.src = client.dataset.clientImage;
  image.alt = `Projeto desenvolvido para ${name}`;
  clientTooltip.querySelector('strong').textContent = name;
  clientTooltip.querySelector('p').textContent = client.dataset.clientDescription;
  clientTooltip.style.left = `${Math.min(window.innerWidth - 155, Math.max(155, rect.left + rect.width / 2))}px`;
  clientTooltip.style.top = `${rect.top}px`;
  clientTooltip.classList.add('visible');
  clientTooltip.setAttribute('aria-hidden', 'false');
};
const hideClientTooltip = () => {
  clientTooltip?.classList.remove('visible');
  clientTooltip?.setAttribute('aria-hidden', 'true');
};

document.querySelectorAll('.client[data-client-description]').forEach((client) => {
  client.addEventListener('mouseenter', () => showClientTooltip(client));
  client.addEventListener('mouseleave', hideClientTooltip);
  client.addEventListener('focus', () => showClientTooltip(client));
  client.addEventListener('blur', hideClientTooltip);
});

window.addEventListener('scroll', hideClientTooltip, { passive: true });
window.addEventListener('resize', hideClientTooltip);

const hero = document.querySelector('.hero');
let heroFrame;

hero?.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  cancelAnimationFrame(heroFrame);
  heroFrame = requestAnimationFrame(() => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    hero.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    hero.style.setProperty('--px', String(((event.clientX - rect.left) / rect.width - 0.5) * 2));
    hero.style.setProperty('--py', String(((event.clientY - rect.top) / rect.height - 0.5) * 2));
    const svg = hero.querySelector('.hero-network');
    if (svg) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(svg.getScreenCTM().inverse());
      svg.querySelectorAll('.network-nodes circle').forEach((node) => {
        const distance = Math.hypot(Number(node.getAttribute('cx')) - local.x, Number(node.getAttribute('cy')) - local.y);
        if (!node.dataset.radius) node.dataset.radius = node.getAttribute('r');
        node.classList.toggle('is-near', distance < 145);
        node.setAttribute('r', distance < 145 ? String(Math.max(7, 13 - distance / 22)) : node.dataset.radius);
      });
    }
  });
});

hero?.addEventListener('pointerleave', () => {
  hero.style.setProperty('--mx', '50%');
  hero.style.setProperty('--my', '42%');
  hero.style.setProperty('--px', '0');
  hero.style.setProperty('--py', '0');
  hero.querySelectorAll('.network-nodes circle').forEach((node) => {
    node.classList.remove('is-near');
    if (node.dataset.radius) node.setAttribute('r', node.dataset.radius);
  });
});

const updateHeroScroll = () => {
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
  hero.style.setProperty('--hero-scale', String(1 + progress * 0.02));
  hero.style.setProperty('--hero-y', `${progress * 12}px`);
  hero.style.setProperty('--ribbon-stretch', String(1 + progress * 0.12));
  hero.style.setProperty('--ribbon-y', `${progress * 18}px`);
};

window.addEventListener('scroll', updateHeroScroll, { passive: true });
updateHeroScroll();

const initHeroGsap = () => {
  if (!hero || !window.gsap || !window.ScrollTrigger) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('gsap-ready');
  window.gsap.registerPlugin(window.ScrollTrigger);

  const title = hero.querySelector('.hero-title-stage > h1');
  const lines = title.querySelectorAll(':scope > span');
  const symbol = hero.querySelector('.hero-symbol');
  const intro = hero.querySelector('.hero-intro');

  if (reduceMotion) {
    window.gsap.set([lines, symbol, intro], { clearProps: 'all' });
    return;
  }

  window.gsap.set(lines, { yPercent: 115, opacity: 0, rotateX: -14 });
  window.gsap.set(symbol, { scale: 0, rotate: -75, opacity: 0 });
  window.gsap.set(intro, { y: 28, opacity: 0 });

  window.gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to(lines, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.15, stagger: 0.13 })
    .to(symbol, { scale: 1, rotate: 0, opacity: 1, duration: 0.75, ease: 'back.out(1.6)' }, '-=.45')
    .to(intro, { y: 0, opacity: 1, duration: 0.8 }, '-=.42');

  window.gsap.to(title, {
    backgroundPosition: '62% 44%',
    duration: 7,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  const rotateXTo = window.gsap.quickTo(title, 'rotationX', { duration: 0.65, ease: 'power3.out' });
  const rotateYTo = window.gsap.quickTo(title, 'rotationY', { duration: 0.65, ease: 'power3.out' });
  const symbolXTo = window.gsap.quickTo(symbol, 'x', { duration: 0.8, ease: 'power3.out' });
  const symbolYTo = window.gsap.quickTo(symbol, 'y', { duration: 0.8, ease: 'power3.out' });

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    rotateXTo(y * -2.2);
    rotateYTo(x * 3.2);
    symbolXTo(x * 10);
    symbolYTo(y * 8);
  });

  hero.addEventListener('pointerleave', () => {
    rotateXTo(0);
    rotateYTo(0);
    symbolXTo(0);
    symbolYTo(0);
  });

  window.gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8,
      invalidateOnRefresh: true
    }
  })
    .to(lines[0], { xPercent: -7, opacity: 0.35, ease: 'none' }, 0)
    .to(lines[1], { xPercent: 6, opacity: 0.45, ease: 'none' }, 0)
    .to(lines[2], { xPercent: -4, opacity: 0.55, ease: 'none' }, 0)
    .to(title, { scale: 1.045, y: 34, ease: 'none' }, 0)
    .to(symbol, { rotate: 90, y: 18, opacity: 0.45, ease: 'none' }, 0)
    .to(intro, { y: 42, opacity: 0, ease: 'none' }, 0);
};

initHeroGsap();

const initHeroFluid = () => {
  const canvas = hero?.querySelector('.hero-fluid-canvas');
  if (!canvas) return;
  const context = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!context) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0.5, y: 0.46, targetX: 0.5, targetY: 0.46, active: 0 };
  const fluid = { alpha: 1 };
  const sourceCanvas = document.createElement('canvas');
  const sourceContext = sourceCanvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastFrame = 0;

  const resizeFluid = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    sourceCanvas.width = Math.round(width);
    sourceCanvas.height = Math.round(height);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawFluid = (time = 0) => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;
    if (!pointer.active) return;
    sourceContext.clearRect(0, 0, width, height);
    const canvasRect = canvas.getBoundingClientRect();
    const titleLines = hero.querySelectorAll('.hero-title-stage > h1 > span');
    sourceContext.fillStyle = '#2f43fc';
    sourceContext.textAlign = 'center';
    sourceContext.textBaseline = 'middle';
    titleLines.forEach((line) => {
      const rect = line.getBoundingClientRect();
      const style = getComputedStyle(line);
      sourceContext.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      sourceContext.fillText(line.textContent, rect.left + rect.width / 2 - canvasRect.left, rect.top + rect.height / 2 - canvasRect.top);
    });
    const px = pointer.x * width;
    const py = pointer.y * height;
    const radius = 138;
    context.save();
    context.beginPath();
    context.arc(px, py, radius, 0, Math.PI * 2);
    context.clip();
    for (let y = Math.max(0, py - radius); y < Math.min(height, py + radius); y += 4) {
      const distance = Math.abs(y - py) / radius;
      const amplitude = (1 - distance) * 18;
      const shift = Math.sin(y * .105 + time * .008) * amplitude + Math.sin(y * .037) * 7;
      context.globalAlpha = (.42 + (1 - distance) * .38) * fluid.alpha;
      context.drawImage(sourceCanvas, 0, y, width, 4, shift, y, width, 4);
    }
    context.restore();
  };

  const renderFluid = (time) => {
    if (time - lastFrame < 30) return;
    lastFrame = time;
    drawFluid(time);
  };

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    pointer.targetX = (event.clientX - rect.left) / rect.width;
    pointer.targetY = (event.clientY - rect.top) / rect.height;
    pointer.active = 1;
    const stage = hero.querySelector('.hero-title-stage');
    const stageRect = stage.getBoundingClientRect();
    stage.style.setProperty('--mx', `${event.clientX - stageRect.left}px`);
    stage.style.setProperty('--my', `${event.clientY - stageRect.top}px`);
  });
  hero.addEventListener('pointerleave', () => {
    pointer.targetX = 0.5;
    pointer.targetY = 0.46;
    pointer.active = 0;
  });
  window.addEventListener('resize', resizeFluid);
  resizeFluid();

  if (window.gsap && !reduced) {
    window.gsap.ticker.add(renderFluid);
    window.gsap.to(canvas, { opacity: 1, duration: .3, ease: 'power2.out' });
    if (window.ScrollTrigger) {
      window.gsap.to(fluid, {
        alpha: 0.12,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 }
      });
    }
  } else {
    drawFluid(0);
  }
};

initHeroFluid();

const initHeroFragments = () => {
  if (!hero || !window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const source = hero.querySelector('.hero-title-stage > h1');
  const layer = hero.querySelector('.hero-fragment-layer');
  if (!source || !layer) return;
  for (let index = 0; index < 6; index += 1) layer.append(source.cloneNode(true));
  const fragments = layer.querySelectorAll('h1');
  const shifts = [-18, 12, -9, 16, -13, 8];
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const velocity = Math.min(1, Math.hypot(event.movementX, event.movementY) / 22);
    window.gsap.to(layer, { opacity: .38 + velocity * .35, duration: .18, overwrite: true });
    fragments.forEach((fragment, index) => {
      window.gsap.to(fragment, {
        x: shifts[index] * (.45 + velocity),
        y: (index % 2 ? -1 : 1) * (2 + velocity * 3),
        skewX: shifts[index] * .12,
        duration: .28 + index * .025,
        ease: 'power3.out',
        overwrite: true
      });
    });
  });
  hero.addEventListener('pointerleave', () => {
    window.gsap.to(layer, { opacity: 0, duration: .35, overwrite: true });
    window.gsap.to(fragments, { x: 0, y: 0, skewX: 0, duration: .45, ease: 'power3.out', overwrite: true });
  });
};

initHeroFragments();

const initProcessMotion = () => {
  const section = document.querySelector('.process-section');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = section.querySelectorAll('.process-card');
  window.gsap.from(cards, {
    y: 64,
    opacity: 0,
    duration: .9,
    stagger: .16,
    ease: 'power3.out',
    scrollTrigger: { trigger: section.querySelector('.process-journey'), start: 'top 78%', once: true }
  });
};

initProcessMotion();

const updateProcessConnectors = () => {
  const journey = document.querySelector('.process-journey');
  const svg = journey?.querySelector('.process-connectors');
  const cards = journey?.querySelectorAll('.process-step');
  if (!journey || !svg || !cards || cards.length < 3 || window.innerWidth <= 800) return;
  const host = journey.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${host.width} ${host.height}`);
  const relativeRect = (element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left - host.left, right: rect.right - host.left, top: rect.top - host.top, bottom: rect.bottom - host.top, width: rect.width, height: rect.height };
  };
  const first = relativeRect(cards[0]);
  const second = relativeRect(cards[1]);
  const third = relativeRect(cards[2]);
  const connections = [
    { start: [first.right - 8, first.top + first.height * .72], end: [second.left + 8, second.top + second.height * .28] },
    { start: [second.left + 8, second.top + second.height * .72], end: [third.right - 8, third.top + third.height * .28] }
  ];
  svg.querySelectorAll('path').forEach((path, index) => {
    const { start, end } = connections[index];
    const direction = end[0] > start[0] ? 1 : -1;
    const bend = Math.max(42, Math.abs(end[0] - start[0]) * .34);
    path.setAttribute('d', `M ${start[0]} ${start[1]} C ${start[0] + bend * direction} ${start[1]}, ${end[0] - bend * direction} ${end[1]}, ${end[0]} ${end[1]}`);
  });
  window.ScrollTrigger?.refresh();
};

window.addEventListener('resize', updateProcessConnectors);
window.addEventListener('load', updateProcessConnectors);
document.fonts?.ready.then(updateProcessConnectors);
setTimeout(updateProcessConnectors, 100);

const initProcessTraveler = () => {
  const journey = document.querySelector('.process-journey');
  const traveler = journey?.querySelector('.process-traveler');
  const paths = journey?.querySelectorAll('.process-connectors path');
  if (!journey || !traveler || !paths?.length || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const state = { progress: 0 };
  const render = () => {
    if (window.innerWidth <= 800) return;
    const lengths = Array.from(paths, (path) => path.getTotalLength());
    const total = lengths[0] + lengths[1];
    const distance = state.progress * total;
    const pathIndex = distance <= lengths[0] ? 0 : 1;
    const localDistance = pathIndex === 0 ? distance : distance - lengths[0];
    const path = paths[pathIndex];
    const length = lengths[pathIndex];
    const point = path.getPointAtLength(Math.min(length, localDistance));
    const next = path.getPointAtLength(Math.min(length, localDistance + 2));
    const angle = Math.atan2(next.y - point.y, next.x - point.x) * 180 / Math.PI;
    const seam = lengths[0] / total;
    const seamDistance = Math.abs(state.progress - seam);
    const opacity = seamDistance < .018 ? seamDistance / .018 : 1;
    window.gsap.set(traveler, { x: point.x - 17, y: point.y - 17, rotation: angle, opacity });
  };
  window.gsap.to(state, {
    progress: 1,
    ease: 'none',
    onUpdate: render,
    scrollTrigger: { trigger: journey, start: 'top 68%', end: 'bottom 42%', scrub: .65 }
  });
  render();
};

setTimeout(initProcessTraveler, 140);
