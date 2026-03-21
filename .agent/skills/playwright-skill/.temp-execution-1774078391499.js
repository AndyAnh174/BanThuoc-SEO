const { chromium } = require('playwright');

const BASE_URL = 'https://banthuoc.andyanh.id.vn';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  // Use Playwright's native fill - should trigger proper events
  const usernameInput = page.locator('#input-username');
  const passwordInput = page.locator('#input-password');
  
  await usernameInput.focus();
  await usernameInput.fill('user');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  
  await passwordInput.focus();
  await passwordInput.fill('Test@1234');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  
  // Check for validation errors before submit
  const errorsBeforeSubmit = await page.locator('[class*="text-red"], [class*="error"], p[class*="text-"]').allTextContents();
  console.log('Errors before submit:', errorsBeforeSubmit.filter(t => t.trim()));
  
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  
  // Check for validation errors after submit
  const errorsAfterSubmit = await page.locator('[class*="text-red"], [class*="error"], p[class*="text-"]').allTextContents();
  console.log('Errors after submit:', errorsAfterSubmit.filter(t => t.trim()));
  
  await page.waitForTimeout(4000);
  console.log('Final URL:', page.url());
  
  await page.screenshot({ path: '/tmp/banthuoc-screenshots/debug-login.png', fullPage: true });
  
  await browser.close();
})();
