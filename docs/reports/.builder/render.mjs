// Render an HTML report to a professional A4 PDF using system Chrome via puppeteer-core.
// Usage: node render.mjs <input.html> <output.pdf> "<footer short title>"
import puppeteer from "puppeteer-core";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const [, , inputArg, outputArg, footerTitleArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('Usage: node render.mjs <input.html> <output.pdf> "<footer title>"');
  process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);
const footerTitle = footerTitleArg || "";

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const chromePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chromePath) {
  console.error("No Chrome/Edge executable found.");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
});

try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
  page.on("console", (m) => {
    const t = m.text();
    if (t.startsWith("[render]")) console.log(t);
  });

  await page.goto(pathToFileURL(input).href, { waitUntil: "networkidle0", timeout: 120000 });

  // Wait until the HTML signals mermaid finished (or errored).
  await page.waitForFunction(() => window.__MERMAID_DONE === true || window.__MERMAID_ERROR, {
    timeout: 120000,
  });

  const diag = await page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll("pre.mermaid, .mermaid"));
    const total = blocks.length;
    const rendered = blocks.filter((b) => b.querySelector("svg")).length;
    return { total, rendered, error: window.__MERMAID_ERROR || null };
  });
  console.log(`[render] mermaid blocks: ${diag.rendered}/${diag.total} rendered`);
  if (diag.error) {
    console.error("[render] MERMAID ERROR:", diag.error);
    process.exit(2);
  }
  if (diag.total !== diag.rendered) {
    console.error(`[render] Not all mermaid diagrams rendered (${diag.rendered}/${diag.total}).`);
    process.exit(3);
  }

  // Give fonts/layout a final settle.
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });

  await page.pdf({
    path: output,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
    headerTemplate: `<span></span>`,
    footerTemplate: `
      <div style="width:100%; font-family: Georgia, 'Times New Roman', serif; font-size:8px; color:#7a8699;
                  padding:0 16mm; display:flex; justify-content:space-between; align-items:center;">
        <span style="letter-spacing:.04em;">${footerTitle.replace(/</g, "&lt;")}</span>
        <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  });

  const pages = diag; // already logged
  console.log(`[render] PDF written: ${output}`);
} finally {
  await browser.close();
}
