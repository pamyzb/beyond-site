'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Artwork } from '@/components/ui/artwork';
import { ButtonLink } from '@/components/ui/button';
import { APP_DOWNLOAD_URLS, appDownloadPlatform } from '@/data/app-download';

export function AppQrCard({ source }: { source: string }) {
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);

  useEffect(() => {
    setPlatform(appDownloadPlatform(navigator.userAgent, navigator.maxTouchPoints));
  }, []);

  if (platform) {
    const href = APP_DOWNLOAD_URLS[platform];
    const label = (
      <>
        <Download size={20} aria-hidden="true" />
        Baixe nosso app
      </>
    );
    return (
      <ButtonLink variant="primary-lime" className="app-download-cta" href={href}>
        {label}
      </ButtonLink>
    );
  }

  return (
    <div
      className="qr-instructions app-qr-compact"
      data-source={source}
      aria-label="Instruções para baixar o aplicativo"
    >
      <div className="app-qr-surface">
        <Artwork
          src="assets/aplicativo/app-qr.svg"
          width={156}
          height={156}
          alt="QR Code para baixar o aplicativo Beyond"
          className="app-qr-image"
        />
        <span className="app-qr-caption">Experimente!</span>
      </div>
    </div>
  );
}
