'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
// Reveal triggers use toggleActions: 'play none none none', not once: true.
// In GSAP 3.13, refreshing pending timelines while initializing another trigger
// can remove once-triggers from the array being traversed (undefined.end).
// Keep registrations stable; scoped useGSAP/matchMedia contexts own cleanup.
export { gsap, ScrollTrigger, SplitText, useGSAP };
