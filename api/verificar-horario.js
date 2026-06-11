import { ejecutarRPC, esCronAutorizado } from './_supabase.js'

// Cron de los viernes: genera alerta si no se subió el horario
// de la semana siguiente (public.verificar_horario_proximo).
export default async function handler(req, res) {
  if (!esCronAutorizado(req)) return res.status(401).json({ error: 'No autorizado' })
  try {
    await ejecutarRPC('verificar_horario_proximo')
    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
