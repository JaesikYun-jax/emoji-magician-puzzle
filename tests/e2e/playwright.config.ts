import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 설정
 * - baseURL: Vite dev 서버 (포트 5175)
 * - webServer: dev 서버 자동 기동 (사용자가 이미 띄워두면 재사용)
 * - devices: iPhone 14 + Galaxy S9+ + Desktop Chrome (3종)
 * - headless: 기본 (작업 중 백그라운드 실행 가능)
 */
export default defineConfig({
  testDir: './',
  testMatch: ['smoke/**/*.spec.ts', 'critical/**/*.spec.ts'],

  /* Smoke + Critical 16 케이스. CI에서는 retries=2 */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,

  /* CI에서만 .only 금지 */
  forbidOnly: !!process.env.CI,

  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:5176',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'iphone-14',
      use: {
        ...devices['iPhone 14'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'galaxy-s9',
      use: {
        ...devices['Galaxy S9+'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ko-KR',
        viewport: { width: 1280, height: 800 },
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- --port 5176 --strictPort',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
