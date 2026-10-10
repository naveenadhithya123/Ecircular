const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    await page.goto('http://localhost:5173/staff/circular/new', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot.png' });
    console.log("Screenshot saved.");
  } catch (e) {
    console.error("Failed to load:", e);
  } finally {
    await browser.close();
  }
})();
