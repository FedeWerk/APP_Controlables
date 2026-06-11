// Helper compartido por los crons: ejecuta una función SQL de Supabase
// vía RPC usando la service role key (solo disponible en el server).
export async function ejecutarRPC(fn) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en las env vars de Vercel')
  }

  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })

  if (!res.ok) {
    const detalle = await res.text()
    throw new Error(`RPC ${fn} falló (${res.status}): ${detalle}`)
  }
}

// Los crons de Vercel mandan Authorization: Bearer <CRON_SECRET> si está configurado.
export function esCronAutorizado(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.authorization === `Bearer ${secret}`
}
