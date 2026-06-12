// Captura el login en tema claro y oscuro (emulando prefers-color-scheme)
import { chromium } from 'playwright-core'

const browser = await chromium.launch()
for (const esquema of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 420, height: 800 }, colorScheme: esquema })
  const errores = []
  page.on('pageerror', e => errores.push(e.message))
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `smoke_login_${esquema}.png` })
  console.log(`${esquema}: tema aplicado =`, await page.evaluate(() => document.documentElement.dataset.theme), '— errores:', errores.length ? errores.join(' | ') : 'ninguno')
  await page.close()
}
await browser.close()
