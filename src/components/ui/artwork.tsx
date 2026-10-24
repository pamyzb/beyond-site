import { asset } from '@/lib/figma/design';

// Original SVGs carry masks, embedded photos and exact Figma geometry.
// Native images preserve these assets without rasterization by an image optimizer.
export function Artwork({
  src,
  width = 600,
  height = 400,
  alt = '',
  className = 'figma-art',
  lazy = true,
}: {
  src: string;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  lazy?: boolean;
}) {
  return (
    <img
      src={asset(src)}
      width={width}
      height={height}
      alt={alt}
      className={className}
      loading={lazy ? 'lazy' : 'eager'}
      draggable={false}
    />
  );
}
export function ReflowArtwork({
  name,
  className = 'component-art',
}: {
  name: string;
  className?: string;
}) {
  return <Artwork src={`assets/figma/${name}.svg`} className={className} />;
}
