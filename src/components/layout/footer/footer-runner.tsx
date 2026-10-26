'use client';
import './footer-runner.css';
import { FooterContent } from './footer-content';
import { useFooterRunner } from './use-footer-runner';
export function FooterRunner({
  bottomArtwork,
  homePath = '',
}: {
  bottomArtwork: string[];
  homePath?: string;
}) {
  const stageRef = useFooterRunner();
  return <FooterContent stageRef={stageRef} bottomArtwork={bottomArtwork} homePath={homePath} />;
}
