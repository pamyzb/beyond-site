import type { ReactNode } from 'react';

/** Keeps each supplied App Beyond group together while preserving its original artwork and copy. */
export function AppFeatureCard({source,children}:{source:string;children:ReactNode}) {
  return <article className="content-card app-feature-card" data-source={source} data-motion="card">{children}</article>;
}
