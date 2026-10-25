import { readArtwork, readNamespacedArtwork, stripSvgXml, prefixSvgIds } from './svg';
import { readProcessArtwork } from './process-artwork';

export async function readHomeArtwork() {
  const [process, footer, about, contact, faq, conversationOverlay, conversation, appEntries] =
    await Promise.all([
      readProcessArtwork(),
      Promise.all(
        Array.from({ length: 10 }, (_, index) =>
          readArtwork(`footer-${index + 1}` as Parameters<typeof readArtwork>[0]).then(stripSvgXml),
        ),
      ),
      Promise.all(
        ([16, 17, 18] as const).map(async (id) => {
          let svg = await readArtwork(`about-${id}`);
          if (id === 17)
            svg = svg.replace(
              /(<g\b[^>]*\sid="lucide\/blocks"[^>]*>)[\s\S]*?(<\/g>)/,
              '$1<g fill="none" stroke="#2F43FC" stroke-width="2"><rect x="564.667" y="8961.25" width="10.667" height="10.667" rx="2"/><rect x="564.667" y="8971.92" width="10.667" height="10.667" rx="1"/><rect x="575.334" y="8971.92" width="10.667" height="10.667" rx="1"/><rect x="580.667" y="8955.92" width="10.667" height="10.667" rx="1.333"/></g>$2',
            );
          return prefixSvgIds(svg.replaceAll('crispEdges', 'geometricPrecision'), `about-${id}`);
        }),
      ),
      readNamespacedArtwork('contact', 'contact-art'),
      readNamespacedArtwork('faq', 'faq-art'),
      readArtwork('conversation-overlay'),
      readNamespacedArtwork('conversation', 'conversation-art'),
      Promise.all(
        (
          ['aplicativo-bleed', 'aplicativo-light-bleed', 'phone-project', 'phone-cases'] as const
        ).map(async (name) => [name, await readNamespacedArtwork(name, name)] as const),
      ),
    ]);
  return {
    process,
    footer,
    about,
    contact,
    faq,
    conversationOverlay,
    conversation,
    app: Object.fromEntries(appEntries),
  };
}
