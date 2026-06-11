// Genera public/icon-192.png y public/icon-512.png para la PWA.
// Uso: node tools/gen-icons.mjs
import { chromium } from 'playwright-core'

const html = (size) => `<!doctype html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body {
    width: ${size}px; height: ${size}px;
    background: linear-gradient(160deg, #E8392C 0%, #DA291C 55%, #B81F14 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Segoe UI', sans-serif;
    overflow: hidden;
  }
  .emoji { font-size: ${size * 0.42}px; line-height: 1; }
  .titulo {
    color: #fff; font-weight: 700;
    font-size: ${size * 0.15}px;
    letter-spacing: ${size * 0.01}px;
    margin-top: ${size * 0.04}px;
  }
</style></head>
<body>
  <div class="emoji">&#127839;</div>
  <div class="titulo">IC VCP</div>
</body></html>`

const browser = await chromium.launch()
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  await page.setContent(html(size))
  await page.screenshot({ path: `public/icon-${size}.png` })
  await page.close()
  console.log(`✓ public/icon-${size}.png`)
}
await browser.close()
