import { Play } from 'lucide-react';
import { Artwork } from '@/components/ui/artwork';

type TestimonialProps = {
  quote: string;
  name: string;
  role: string;
  videoSrc?: string;
  playing?: boolean;
  notice?: boolean;
  onPlay?: () => void;
  onEnded?: () => void;
};
export function TestimonialTextCard({ quote, name, role }: TestimonialProps) {
  return (
    <>
      <blockquote>{quote}</blockquote>
      <div className="testimonial-person">
        <div className="testimonial-portrait">
          <Artwork
            src="assets/depoimentos/natalia-example.jpg"
            width={323}
            height={379}
            className="testimonial-portrait-image"
            alt=""
          />
        </div>
        <p>
          <strong>{name}</strong>
          <span>{role}</span>
        </p>
      </div>
    </>
  );
}
export function TestimonialVideoCard({
  quote,
  name,
  role,
  videoSrc,
  playing,
  notice,
  onPlay,
  onEnded,
}: TestimonialProps) {
  return (
    <>
      <Artwork
        src="assets/depoimentos/natalia-example.jpg"
        width={1168}
        height={613}
        className="testimonial-video-poster"
        alt=""
      />
      <div className="testimonial-video-copy">
        <blockquote>{quote}</blockquote>
        <p>
          <strong>{name}</strong>
          <span>{role}</span>
        </p>
      </div>
      <button
        className="button testimonial-play"
        type="button"
        aria-label={
          videoSrc ? 'Reproduzir depoimento em vídeo' : 'Ver disponibilidade do depoimento em vídeo'
        }
        onClick={onPlay}
      >
        <Play className="button-icon" size={28} fill="currentColor" />
      </button>
      {!videoSrc && notice && (
        <span className="testimonial-video-status" role="status">
          Vídeo ainda não disponibilizado.
        </span>
      )}
      {playing && videoSrc && (
        <video
          className="testimonial-player"
          src={videoSrc}
          controls
          autoPlay
          playsInline
          aria-label={`Depoimento de ${name}`}
          onEnded={onEnded}
        />
      )}
    </>
  );
}
