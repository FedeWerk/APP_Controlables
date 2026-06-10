// =============================================
// MOTOR DE PUNTUACIÓN IC — McDonald's VCP
// =============================================

export const OBJ = {
  completo:    0.10,
  incompleto:  0.44,
  stat:        0.10,
  mfy_max:     50,
  mfy_min:     35,
  food_otros:  0.84,
  paper_otros: 0.74,
}

export const MULT = {
  desayuno: 1.0,
  almuerzo: 2.0,
  merienda: 1.0,
  cena:     2.0,
  open:     1.5,
}

export const TURNOS_CONFIG = [
  { id: 'desayuno', label: 'Desayuno', icon: '🌅', inicio: 6,  fin: 11 },
  { id: 'almuerzo', label: 'Almuerzo', icon: '☀️',  inicio: 11, fin: 16 },
  { id: 'merienda', label: 'Merienda', icon: '🌤️', inicio: 16, fin: 20 },
  { id: 'cena',     label: 'Cena',     icon: '🌙',  inicio: 20, fin: 25 },
  { id: 'open',     label: 'Open',     icon: '🌃',  inicio: 25, fin: 30 },
]

export const ROLES = {
  gerente:    { label: 'Gerente',    color: '#534AB7', bg: '#EEEDFE' },
  manager:    { label: 'Manager',    color: '#0C447C', bg: '#E6F1FB' },
  entrenador: { label: 'Entrenador', color: '#27500A', bg: '#EAF3DE' },
  crew:       { label: 'Crew',       color: '#444441', bg: '#F1EFE8' },
}

export function esFindeSemana(fecha) {
  const d = new Date(fecha + 'T12:00:00')
  return d.getDay() === 0 || d.getDay() === 6
}

export function getLunesDeSemana(fecha) {
  const d = new Date(fecha + 'T12:00:00')
  const dia = d.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function getProximoLunes() {
  const hoy = new Date()
  const dia = hoy.getDay()
  const diff = dia === 0 ? 1 : 8 - dia
  hoy.setDate(hoy.getDate() + diff)
  return hoy.toISOString().split('T')[0]
}

export function getMultiplicador(franja, fecha) {
  const base = MULT[franja] ?? 1.0
  const fds  = esFindeSemana(fecha) ? 2.0 : 1.0
  return base * fds
}

export function getFactorEquidad(horasSemana) {
  if (horasSemana >= 12 && horasSemana <= 15) return 1.25
  return 1.0
}

export function asignarTurno(horaInicio, horaFin) {
  const totalHs = horaFin - horaInicio
  const proporciones = TURNOS_CONFIG.map(t => {
    const start = Math.max(horaInicio, t.inicio)
    const end   = Math.min(horaFin,   t.fin)
    const hs    = Math.max(0, end - start)
    return { turnoId: t.id, hs, pct: totalHs > 0 ? hs / totalHs : 0 }
  }).filter(p => p.hs > 0)

  if (proporciones.length === 0) return []
  const main = proporciones.find(p => p.pct >= 0.8)
  if (main) return [{ turnoId: main.turnoId, prop: 1.0 }]
  return proporciones.map(p => ({ turnoId: p.turnoId, prop: p.pct }))
}

export function calcularPuntosBase({ venta, completoMonto, incompletoMonto, mfySegundos, penMfyBajo, penVencimiento, penOtro }) {
  let pts = 0
  const detalle = []

  if (venta > 0) {
    if (completoMonto !== null && completoMonto !== undefined) {
      const pct = completoMonto / venta * 100
      if (completoMonto === 0) {
        pts += 20
        detalle.push({ txt: 'Completo $0 — cero absoluto', pts: 20, ok: true })
      } else if (pct <= OBJ.completo) {
        pts += 10
        detalle.push({ txt: `Completo en objetivo (${pct.toFixed(3)}%)`, pts: 10, ok: true })
      } else {
        detalle.push({ txt: `Completo fuera de objetivo (${pct.toFixed(3)}%)`, pts: 0, ok: false })
      }
    }
    if (incompletoMonto !== null && incompletoMonto !== undefined) {
      const pct = incompletoMonto / venta * 100
      if (incompletoMonto === 0) {
        pts += 20
        detalle.push({ txt: 'Incompleto $0 — cero absoluto', pts: 20, ok: true })
      } else if (pct <= OBJ.incompleto) {
        pts += 10
        detalle.push({ txt: `Incompleto en objetivo (${pct.toFixed(3)}%)`, pts: 10, ok: true })
      } else {
        detalle.push({ txt: `Incompleto fuera de objetivo (${pct.toFixed(3)}%)`, pts: 0, ok: false })
      }
    }
  }

  if (mfySegundos !== null && mfySegundos !== undefined) {
    if (mfySegundos < OBJ.mfy_min) {
      pts -= 10
      detalle.push({ txt: `MFY ${mfySegundos}" — adulteración`, pts: -10, ok: false })
    } else if (mfySegundos <= OBJ.mfy_max) {
      pts += 10
      detalle.push({ txt: `MFY ${mfySegundos}" — en objetivo`, pts: 10, ok: true })
    } else {
      detalle.push({ txt: `MFY ${mfySegundos}" — fuera de objetivo`, pts: 0, ok: false })
    }
  }

  if (penMfyBajo)     { pts -= 10; detalle.push({ txt: 'Penalización: MFY < 35"', pts: -10, ok: false }) }
  if (penVencimiento) { pts -= 10; detalle.push({ txt: 'Penalización: vencimiento secundario', pts: -10, ok: false }) }
  if (penOtro)        { pts -= 10; detalle.push({ txt: 'Penalización: otro incumplimiento', pts: -10, ok: false }) }

  return { pts, detalle }
}

export function distribuirPuntos(ptsTurno, crew, statOk) {
  return crew.map(c => {
    const factor        = getFactorEquidad(c.horas_semana)
    const ptsTurnoCrew  = ptsTurno * (c.prop_turno ?? 1.0) * factor
    const ptsStat       = statOk ? 8 : 0
    return {
      ...c,
      pts_turno:      Math.round(ptsTurnoCrew * 10) / 10,
      pts_stat:       ptsStat,
      pts_total:      Math.round((ptsTurnoCrew + ptsStat) * 10) / 10,
      factor_equidad: factor,
    }
  })
}

export function statDentroObjetivo(statMonto, ventaTotal) {
  if (!ventaTotal || ventaTotal === 0) return false
  return Math.abs(statMonto / ventaTotal * 100) <= OBJ.stat
}

export function formatPct(valor, venta) {
  if (!venta || venta === 0) return '—'
  return (valor / venta * 100).toFixed(3) + '%'
}
