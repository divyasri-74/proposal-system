const puppeteer = require("puppeteer");

let browserPromise = null;

/**
 * One Chromium instance is shared across requests (launching per request costs 1-2s
 * and a lot of RAM on small hosts). Each request gets its own isolated page.
 */
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--font-render-hinting=none",
        ],
      })
      .then((browser) => {
        browser.on("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

// Limit simultaneous renders so a burst of requests cannot exhaust memory.
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT_PDFS || 3);
let active = 0;
const queue = [];
function acquire() {
  return new Promise((resolve) => {
    if (active < MAX_CONCURRENT) {
      active++;
      resolve();
    } else {
      queue.push(resolve);
    }
  });
}
function release() {
  const next = queue.shift();
  if (next) next();
  else active--;
}

function footerTemplate(label) {
  const safe = String(label).replace(/[&<>"']/g, "");
  return `
    <div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:8px;color:#8a8f98;
                padding:0 16mm;display:flex;justify-content:space-between;">
      <span>${safe}</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    </div>`;
}

async function htmlToPdf(html, { footerLabel = "" } = {}) {
  await acquire();
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Templates are fully self-contained (inline CSS, data-URL images).
    // Block everything else so user content can never trigger server-side requests.
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (url.startsWith("data:") || url === "about:blank") req.continue();
      else req.abort();
    });

    await page.emulateMediaType("print");
    await page.setContent(html, { waitUntil: "load", timeout: 20000 });
    await page.evaluate(() => document.fonts && document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: footerTemplate(footerLabel),
      margin: { top: "16mm", right: "16mm", bottom: "20mm", left: "16mm" },
    });
    return Buffer.from(pdf);
  } finally {
    if (page) await page.close().catch(() => {});
    release();
  }
}

async function closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b) await b.close().catch(() => {});
    browserPromise = null;
  }
}

module.exports = { htmlToPdf, closeBrowser };
