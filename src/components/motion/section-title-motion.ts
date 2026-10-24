import { gsap, SplitText } from '@/lib/animation/gsap';

/** Reveal static site copy while preserving existing component animations. */
export function animateSectionTitles(scope: HTMLElement) {
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const splits: SplitText[] = [];
    scope
      .querySelectorAll<HTMLElement>('.blog-grid:not(.blog-grid-alternate) .blog-card')
      .forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 36, scale: 0.96, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.09,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: card,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    scope
      .querySelectorAll<HTMLElement>('[data-motion="section-description"], .faq-item')
      .forEach((text) => {
        const isDescription = text.matches('[data-motion="section-description"]');
        gsap.fromTo(
          text,
          { x: isDescription ? 24 : 0, y: isDescription ? 0 : 8, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: isDescription ? 0.2 : 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: text,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    scope
      .querySelectorAll<HTMLElement>(
        'main .section-label, main .section-heading-label > span:first-child',
      )
      .forEach((label) => {
        const split = SplitText.create(label, { type: 'chars', tag: 'span', aria: 'auto' });
        splits.push(split);
        // Inline characters preserve both rotated Figma runs and vertical labels.
        gsap.set(split.chars, { display: 'inline', opacity: 0 });
        const typing = gsap.timeline({
          scrollTrigger: {
            // The outer Figma box does not follow the rotated text's visible bounds.
            trigger: label.querySelector('.text-run') ?? label,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
        split.chars.forEach((character, index) => {
          typing.set(character, { opacity: 1 }, 0.12 + index * 0.08);
        });
      });
    const candidates = scope.querySelectorAll<HTMLElement>(
      'main :is(h1,h2,h3,h4,h5,h6,p,blockquote,.text-block,.field-label), .footer-frame :is(h2,h3,p,.text-block)',
    );
    const alreadyAnimated = [
      '.section-label',
      '.section-heading-label',
      '.about-card-body',
      '.service-editorial-card',
      '.process-card-entry',
      '.case-browser',
      '.testimonial-carousel',
      '.testimonial-card',
      '.testimonial-video-card',
      '.blog-card',
      '.blog-reveal',
      '.faq-item',
      '[data-motion="section-description"]',
      '.contact-success',
      '.hero-ink-copy',
      '.button',
      '.button-link',
      'button',
      '[aria-hidden="true"]',
      '[data-motion="static"]',
      '[role="status"]',
      '.contact-live-status',
      '.blog-status',
    ].join(',');
    candidates.forEach((heading) => {
      if (
        heading.closest(alreadyAnimated) ||
        heading.querySelector(
          '.hero-typewriter, .hero-video-word, button, input, textarea, select',
        ) ||
        heading.matches('#inicio h1')
      )
        return;
      // Only split the outer text block once; leave nested semantic elements intact.
      if (Array.from(candidates).some((parent) => parent !== heading && parent.contains(heading)))
        return;
      if (!heading.textContent?.trim()) return;
      if (heading.matches('#conversa h2')) {
        gsap.fromTo(
          heading,
          { clipPath: 'inset(0 50% 0 50%)' },
          {
            clipPath: 'inset(0 0% 0 0%)',
            duration: 1,
            ease: 'power3.inOut',
            clearProps: 'clipPath',
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
        return;
      }
      if (heading.matches('.app-feature-title')) {
        // The app titles are deliberately authored as two fixed lines so their
        // illustrated words retain their SVG scribbles. Reveal those lines as
        // intact units instead of splitting and detaching the live SVG paths.
        const lines = heading.querySelectorAll<HTMLElement>('.app-feature-title-line');
        gsap.fromTo(
          lines,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.14,
            duration: 0.62,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          },
        );
        return;
      }
      if (!heading.matches('h1,h2,h3,h4,h5,h6')) {
        gsap.fromTo(
          heading,
          { y: 8, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
        return;
      }
      const words: Element[] = [];
      if (heading.querySelector('.app-title-word')) {
        // Never split an ancestor of a live SVG: rebuilding its markup detaches
        // the path retained by AppTitleWord's drawing timeline.
        heading.querySelectorAll<HTMLElement>('.text-run').forEach((run) => {
          const decorated = run.querySelector<HTMLElement>('.app-title-word');
          if (decorated) {
            words.push(decorated);
          } else {
            const split = SplitText.create(run, { type: 'words', aria: 'auto' });
            splits.push(split);
            words.push(...split.words);
          }
        });
      } else {
        const split = SplitText.create(heading, { type: 'words', aria: 'auto' });
        splits.push(split);
        words.push(...split.words);
      }
      gsap.from(words, {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
    const qrCallout = scope.querySelector<HTMLElement>('#aplicativo .qr-instructions');
    if (qrCallout) {
      // The QR callout's decorative paths are CSS pseudo-elements. Animate the
      // clipping variables on their owning element so each line is drawn as
      // the callout enters the viewport.
      gsap.fromTo(
        qrCallout,
        { '--qr-top-line-inset': '108px', '--qr-bottom-line-inset': '108px' },
        {
          '--qr-top-line-inset': '66px',
          '--qr-bottom-line-inset': '66px',
          duration: 0.7,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: qrCallout,
            start: 'top 84%',
            toggleActions: 'play none none none',
          },
        },
      );
    }
    return () => splits.forEach((split) => split.revert());
  });
  return () => media.revert();
}
