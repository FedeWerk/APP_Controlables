import { ejecutarRPC, esCronAutorizado } from './_supabase.js'

// Cron de los lunes 00:05 (hora Argentina): activa el horario
// de la semana en curso (public.activar_horario_semana).
export default async function handler(req, res) {
  if (!esCronAutorizado(req)) return res.status(401).json({ error: 'No autorizado' })
  try {
    await ejecutarRPC('activar_horario_semana')
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
