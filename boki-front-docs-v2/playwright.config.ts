import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/report' }],
  ],
  outputDir: 'e2e/results',
  webServer: {
    command: 'ng serve --port 4200',
    port: 4200,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
