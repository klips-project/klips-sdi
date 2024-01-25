import {
  PlaywrightTestConfig,
  devices
} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testMatch: /.*\.ui\.spec/,
  snapshotPathTemplate: "./src/additional-files/screenshots/{arg}{ext}",
  webServer: {
    command: 'npm run start',
    url: 'https://localhost:8080',
    timeout: 240 * 1000,
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true
  },
  use: {
    baseURL: 'https://localhost:8080',
    headless: true,
    viewport: {
      width: 1380,
      height: 820
    },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure'
  },
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome']
    }
  }, {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox']
    }
  }, {
    name: 'webkit',
    use: {
      ...devices['Desktop Safari']
    }
  }]
};

export default config;
