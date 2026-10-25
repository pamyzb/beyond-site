/** Export-specific names belong at the import boundary, never in animation code.
 * A changed export fails preparation instead of silently disabling an animation.
 * Annotate opening tags without reserializing the original SVG artwork.
 */
export function annotateArtworkRoles(key, source) {
  const roles = key.startsWith('about-')
    ? [[/^lucide\//, 'about-glyph', 1]]
    : {
        process: [
          [/^Container_53$/, 'process-marker', 1],
          [/^Process Card(?:_\d+)?$/, 'process-face', 4],
        ],
        contact: [[/^contact-image$/, 'photo', 1]],
        faq: [[/^Image-faq$/, 'photo', 1]],
        conversation: [[/^Container_(21|22|23|24)$/, 'photo', 4]],
        'conversation-overlay': [[/^Vector_40$/, 'conversation-outline', 1]],
        'aplicativo-bleed': appRoles(true),
        'aplicativo-light-bleed': appRoles(true),
        'phone-project': appRoles(false),
        'phone-cases': appRoles(false),
      }[key];
  if (!roles) return source;
  const counts = new Map();
  const result = source.replace(/<[\w:-]+\b[^>]*>/g, (tag) => {
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (!id) return tag;
    const contract = roles.find(([pattern]) => pattern.test(id));
    if (!contract) return tag;
    const role = contract[1];
    counts.set(role, (counts.get(role) ?? 0) + 1);
    const side = key === 'conversation' && /_(21|24)$/.test(id) ? ' data-artwork-side="left"' : '';
    return tag.replace(/\s*\/?>$/, (end) => ` data-artwork-role="${role}"${side}${end}`);
  });
  for (const [, role, expected] of roles) {
    if (counts.get(role) !== expected) {
      throw new Error(
        `Artwork contract ${key}/${role}: expected ${expected}, found ${counts.get(role) ?? 0}. Review the export adapter.`,
      );
    }
  }
  return result;
}

function appRoles(background) {
  return background
    ? [
        [/^Vector_42$/, 'app-outline', 1],
        [/^qrcode-cta$/, 'qr-card', 1],
        [/^beyond$/, 'qr-logo', 1],
        ...phoneRoles(2),
      ]
    : phoneRoles(1);
}

function phoneRoles(count) {
  return [
    [/^Container_(26|34)$/, 'phone', count],
    [/^Container_(33|41)$/, 'phone-camera', count],
  ];
}
