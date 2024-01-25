import {
  test,
  expect
} from '@playwright/test';

test.describe('Basic application tests', () => {
  test.beforeEach(async ({
    page
  }) => {
    await page.goto('/');
  });

  test('it has set the correct title', async ({
    page
  }) => {
    await expect(page).toHaveTitle('Simulation');
  });

  test('it renders the most important components', async ({
    page
  }) => {
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', {
      name: 'Original'
    })).toBeVisible();
    await expect(page.getByRole('button', {
      name: 'Simulation'
    })).toBeVisible();
    await expect(page.getByRole('button', {
      name: 'Set transparency of layers'
    })).toBeVisible();
    await expect(page.getByRole('button', {
      name: 'Show legend'
    })).toBeVisible();
    await expect(page.getByRole('switch', {
      name: 'Neustadt'
    })).toBeVisible();
    await expect(page.getByRole('switch', {
      name: 'Hitzeindex (HI)'
    })).toBeVisible();
    await expect(page.getByLabel('time-slider')).toBeVisible();
    await expect(page.getByText('Place name,')).toBeVisible();
  });

  test('test functionality of legend', async ({
    page
  }) => {
    await expect(page.locator('div.ant-space.ant-space-vertical')).not.toBeVisible();
    await page.getByRole('button', {
      name: 'Show legend'
    }).click();
    await expect(page.locator('div.ant-space.ant-space-vertical')).toBeVisible();
  });

  test('test functionality of transparency slider', async ({
    page
  }) => {
    await expect(page.getByLabel('transperency-slider')).not.toBeVisible();
    await page.getByRole('button', {
      name: 'Set transparency of layers'
    }).click();
    await expect(page.getByLabel('transperency-slider')).toBeVisible();
  });

  test('test functionality of simulation toggle button', async ({
    page
  }, workerInfo
  ) => {
    test.setTimeout(100000);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: './src/additional-files/screenshots/simulation-toggle-'
        + workerInfo.project.name + '-linux.png'
    });
    await page.getByText('Neustadt').click({ position: { x: 1, y: 1 } });
    await expect(page.getByText('Lenneplatz')).toBeVisible();
    await page.waitForTimeout(5000);
    await expect(page).not.toHaveScreenshot('simulation-toggle-'
        + workerInfo.project.name
        + '-linux.png', {maxDiffPixelRatio: 0.01});
  });

  test('test functionality of index toggle button', async ({
    page
  }, workerInfo
  ) => {
    test.setTimeout(100000);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: './src/additional-files/screenshots/index-toggle-'
        + workerInfo.project.name + '-linux.png'
    });
    await page.getByText('Hitzeindex (HI)').click({ position: { x: 1, y: 1 } });
    await expect(page.getByText('Hitzeinsel Effekt (UHI)')).toBeVisible();
    await page.waitForTimeout(5000);
    await expect(page).not.toHaveScreenshot('index-toggle-'
        + workerInfo.project.name
        + '-linux.png', {maxDiffPixelRatio: 0.01});
  });
});
