'use client';
import './footer-runner.css';
import { FooterContent } from './footer-content';
import { useFooterRunner } from './use-footer-runner';
export function FooterRunner({ bottomArtwork }: { bottomArtwork: string[] }) {
  const stageRef = useFooterRunner();
  return <FooterContent stageRef={stageRef} bottomArtwork={bottomArtwork} />;
}
