import { Artwork } from '@/components/ui/artwork';
export function AppQrCard({ source }: { source: string }) {
  return (
    <div
      className="qr-instructions"
      data-source={source}
      aria-label="Instruções para baixar o aplicativo"
    >
      <span className="qr-hover-fill" aria-hidden="true" />
      <div className="app-qr-surface">
        <Artwork
          src="assets/figma/app-qr.svg"
          width={156}
          height={156}
          alt="QR Code para baixar o aplicativo Beyond"
          className="app-qr-image"
        />
      </div>
      <p>
        Escaneie o QR Code <br />
        para baixar o app!
      </p>
    </div>
  );
}
