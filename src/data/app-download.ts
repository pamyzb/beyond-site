export const APP_DOWNLOAD_URLS: Record<'android' | 'ios', string> = {
  android: 'https://play.google.com/store/search?q=beyond%20the%20bytes&c=apps&hl=pt_BR',
  ios: 'https://apps.apple.com/br/app/beyond-the-bytes/id6502892716',
};

export function appDownloadPlatform(userAgent: string, touchPoints: number) {
  if (/Android/i.test(userAgent)) return 'android' as const;
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1))
    return 'ios' as const;
  return null;
}
