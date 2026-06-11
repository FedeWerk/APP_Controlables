// Smoke test: abre la app local y captura la pantalla de login.
import { chromium } from 'playwright-core'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 420, height: 800 } })
const errores = []
page.on('pageerror', e => errores.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()) })

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.screenshot({ path: 'smoke_login.png' })
console.log('Título:', await page.title())
console.log('Errores:', errores.length === 0 ? 'ninguno' : errores.join('\n'))
await browser.close()
