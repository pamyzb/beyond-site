import base from '../playwright.config';
export default {
  ...base,
  testDir: '../tests/e2e',
  projects: [
    {
      name: 'desktop-edge',
      use: {
        browserName: 'chromium' as const,
        channel: 'msedge',
        viewport: { width: 1449, height: 930 },
      },
    },
    {
      name: 'mobile-edge',
      use: {
        browserName: 'chromium' as const,
        channel: 'msedge',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
};
