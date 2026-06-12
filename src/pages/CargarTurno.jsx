import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { calcularPuntosBase, getMultiplicador, distribuirPuntos, statDentroObjetivo, OBJ, TURNOS_CONFIG, esFindeSemana, formatPct } from '../lib/puntuacion'

const hoy = () => new Date().toISOString().split('T')[0]

export default function CargarTurno() {
  const { usuario, puedeAplicarPenal } = useAuth()
  const [fecha, setFecha]       = useState(hoy())
  const [franja, setFranja]     = useState('almuerzo')
  const [venta, setVenta]       = useState('')
  const [completo, setCompleto] = useState('')
  const [incompleto, setInc]    = useState('')
  const [mfy, setMfy]           = useState('')
  const [statMonto, setStat]    = useState('')
  const [ventaDia, setVentaDia] = useState('')
  const [penMfy, setPenMfy]     = useState(false)
  const [penVenc, setPenVenc]   = useState(false)
  const [penOtro, setPenOtro]   = useState(false)
  const [penDetalle, setPenDet] = useState('')
  const [crew, setCrew]         = useState([])
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [error, setError]         = useState('')

  const fds   = esFindeSemana(fecha)
  const mult  = getMultiplicador(franja, fecha)
  const v     = parseFloat(venta)   || 0
  const comp  = parseFloat(completo)
  const inc   = parseFloat(incompleto)
  const mfySeg = parseInt(mfy)
  const statV  = parseFloat(statMonto)
  const ventaD = parseFloat(ventaDia) || 0

  const { pts: ptsBase, detalle } = calcularPuntosBase({
    venta: v, completoMonto: isNaN(comp) ? null : comp,
    incompletoMonto: isNaN(inc) ? null : inc,
    mfySegundos: isNaN(mfySeg) ? null : mfySeg,
    penMfyBajo: penMfy, penVencimiento: penVenc, penOtro,
  })
  const ptsTotal = ptsBase * mult
  const statOk   = !isNaN(statV) && ventaD > 0 && statDentroObjetivo(statV, ventaD)

  useEffect(() => { cargarCrew() }, [fecha, franja])

  async function cargarCrew() {
    const lunesDeSemana = (() => {
      const d = new Date(fecha + 'T12:00:00')
      const dia = d.getDay()
      const diff = dia === 0 ? -6 : 1 - dia
      d.setDate(d.getDate() + diff)
      return d.toISOString().split('T')[0]
    })()

    const { data } = await supabase
      .from('asignaciones')
      .select('*, usuario:usuario_id(id, nombre, rol)')
      .eq('turno_principal', franja)
      .eq('fecha', fecha)
      .order('nombre_pdf')

    if (data && data.length > 0) {
      setCrew(data.map(a => ({
        id: a.usuario_id, nombre: a.nombre_pdf,
        horas_semana: a.horas_semana, prop_turno: a.prop_turno,
        rol: a.usuario?.rol ?? 'crew', removido: false,
      })))
    }
  }

  async function guardar() {
    if (!v) { setError('Ingresá la venta del turno'); return }
    setGuardando(true); setError('')
    try {
      const { data: turno, error: errTurno } = await supabase
        .from('turnos')
        .upsert({
          fecha, franja, manager_id: usuario.id,
          venta: v, completo_monto: isNaN(comp) ? null : comp,
          incompleto_monto: isNaN(inc) ? null : inc,
          mfy_segundos: isNaN(mfySeg) ? null : mfySeg,
          pts_base: ptsBase, multiplicador: mult, pts_total: ptsTotal,
          pen_mfy_bajo: penMfy, pen_vencimiento: penVenc,
          pen_otro: penOtro, pen_detalle: penDetalle,
        }, { onConflict: 'fecha,franja' })
        .select().single()

      if (errTurno) throw errTurno

      if (!isNaN(statV) && ventaD > 0) {
        await supabase.from('stat_diario').upsert({
          fecha, venta_total: ventaD, stat_monto: statV,
          stat_pct: statV / ventaD * 100, dentro_objetivo: statOk,
          cargado_por: usuario.id,
        }, { onConflict: 'fecha' })
      }

      const crewActivo = crew.filter(c => !c.removido)
      const distribuidos = distribuirPuntos(ptsTotal, crewActivo, statOk)

      for (const c of distribuidos) {
        if (!c.id) continue
        await supabase.from('puntajes').upsert({
          usuario_id: c.id, turno_id: turno.id, fecha, franja,
          pts_turno: c.pts_turno, pts_stat: c.pts_stat, pts_total: c.pts_total,
          factor_equidad: c.factor_equidad, horas_semana: c.horas_semana,
        }, { onConflict: 'turno_id,usuario_id' })
      }

      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (e) {
      setError('Error al guardar: ' + e.message)
    }
    setGuardando(false)
  }

  const pctComp = v > 0 && !isNaN(comp) ? comp / v * 100 : null
  const pctInc  = v > 0 && !isNaN(inc)  ? inc  / v * 100 : null
  const pctStat = ventaD > 0 && !isNaN(statV) ? Math.abs(statV / ventaD * 100) : null

  const okColor   = 'var(--ok)'
  const failColor = 'var(--fail)'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1.5rem' }}>Cargar turno</h2>

      {/* Fecha y franja */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Franja</label>
            <select value={franja} onChange={e => setFranja(e.target.value)} style={inp}>
              {TURNOS_CONFIG.map(t => (
                <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={chip('var(--chip-viol-bg)', 'var(--chip-viol-tx)')}>x{mult.toFixed(1)} multiplicador</span>
          {fds && <span style={chip('var(--chip-amar-bg)', 'var(--chip-amar-tx)')}>Fin de semana — x2.0 aplicado</span>}
          {ptsBase > 0 && <span style={chip('var(--chip-verde-bg)', 'var(--ok)')}>{ptsTotal.toFixed(0)} pts totales del turno</span>}
        </div>
      </div>

      {/* Venta e indicadores */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={lbl}>Venta del turno ($)</label>
          <input type="number" value={venta} onChange={e => setVenta(e.target.value)} placeholder="ej: 850000" style={{ ...inp, maxWidth: 200 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Completo ($)</label>
            <input type="number" value={completo} onChange={e => setCompleto(e.target.value)} placeholder="ej: 850" style={inp} />
            {pctComp !== null && (
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, color: pctComp <= OBJ.completo ? okColor : failColor }}>
                {pctComp.toFixed(3)}%
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>Obj ≤ {OBJ.completo}%</div>
          </div>
          <div>
            <label style={lbl}>Incompleto ($)</label>
            <input type="number" value={incompleto} onChange={e => setInc(e.target.value)} placeholder="ej: 3200" style={inp} />
            {pctInc !== null && (
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, color: pctInc <= OBJ.incompleto ? okColor : failColor }}>
                {pctInc.toFixed(3)}%
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>Obj ≤ {OBJ.incompleto}%</div>
          </div>
          <div>
            <label style={lbl}>MFY (segundos)</label>
            <input type="number" value={mfy} onChange={e => setMfy(e.target.value)} placeholder="ej: 44" style={inp} />
            {!isNaN(mfySeg) && mfy !== '' && (
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, color: mfySeg < OBJ.mfy_min ? failColor : mfySeg <= OBJ.mfy_max ? okColor : failColor }}>
                {mfySeg < OBJ.mfy_min ? 'Adulteración' : mfySeg <= OBJ.mfy_max ? 'En objetivo' : 'Fuera'}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>Obj 35"–50"</div>
          </div>
        </div>
      </div>

      {/* Stat diario */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.75rem' }}>Stat del día <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--texto-ter)' }}>(cargar una vez por día)</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Stat ($) — puede ser negativo</label>
            <input type="number" value={statMonto} onChange={e => setStat(e.target.value)} placeholder="ej: -420" style={inp} />
            {pctStat !== null && (
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, color: statOk ? okColor : failColor }}>
                {(statV / ventaD * 100).toFixed(3)}% {statOk ? '→ +8 pts' : '→ sin bonus'}
              </div>
            )}
          </div>
          <div>
            <label style={lbl}>Venta total del día ($)</label>
            <input type="number" value={ventaDia} onChange={e => setVentaDia(e.target.value)} placeholder="ej: 4200000" style={inp} />
            <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>Obj: entre −0.10% y +0.10%</div>
          </div>
        </div>
      </div>

      {/* Penalizaciones — solo gerente */}
      {puedeAplicarPenal && (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.75rem' }}>Penalizaciones</div>
          {[
            { id: 'mfy', val: penMfy, set: setPenMfy, txt: 'MFY por debajo de 35"' },
            { id: 'venc', val: penVenc, set: setPenVenc, txt: 'Productos fuera de vencimiento secundario' },
            { id: 'otro', val: penOtro, set: setPenOtro, txt: 'Otro incumplimiento de procedimiento' },
          ].map(p => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '0.5px solid var(--borde)', borderRadius: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13 }}>
              <input type="checkbox" checked={p.val} onChange={e => p.set(e.target.checked)} />
              {p.txt}
              <span style={{ marginLeft: 'auto', background: 'var(--chip-rojo-bg)', color: 'var(--chip-rojo-tx)', fontSize: 11, padding: '1px 7px', borderRadius: 8 }}>−10 pts</span>
            </label>
          ))}
          {(penMfy || penVenc || penOtro) && (
            <input type="text" value={penDetalle} onChange={e => setPenDet(e.target.value)} placeholder="Detalle del incumplimiento..." style={{ ...inp, marginTop: 4 }} />
          )}
        </div>
      )}

      {/* Crew del turno */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.75rem' }}>
          Crew del turno <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--texto-ter)' }}>({crew.filter(c => !c.removido).length} personas)</span>
        </div>
        {crew.filter(c => !c.removido).length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--texto-ter)', padding: '8px 0' }}>Sin crew asignado — subí el horario de Orquest</div>
        )}
        {crew.map((c, i) => !c.removido && (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--borde-suave)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--chip-azul-bg)', color: 'var(--chip-azul-tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
              {c.nombre.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, fontSize: 13 }}>
              {c.nombre}
              {(c.rol === 'entrenador') && <span style={{ ...badge('var(--chip-verde-bg)', 'var(--ok)'), marginLeft: 6 }}>entrenador</span>}
              {c.prop_turno < 1 && <span style={{ ...badge('var(--chip-amar-bg)', 'var(--chip-amar-tx)'), marginLeft: 4 }}>{Math.round(c.prop_turno * 100)}% turno</span>}
              <div style={{ fontSize: 11, color: 'var(--texto-ter)' }}>
                {c.horas_semana} hs/sem · factor {c.horas_semana >= 12 && c.horas_semana <= 15 ? <span style={{ color: okColor }}>x1.25</span> : <span>x1.00</span>}
              </div>
            </div>
            <button onClick={() => setCrew(prev => prev.map((x, j) => j === i ? { ...x, removido: true } : x))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-mute)', fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>

      {error && <div style={{ background: 'var(--chip-rojo-bg)', color: 'var(--chip-rojo-tx)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>{error}</div>}
      {guardado && <div style={{ background: 'var(--chip-verde-bg)', color: 'var(--ok)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>✓ Turno guardado y puntos asignados al equipo</div>}

      <button onClick={guardar} disabled={guardando}
        style={{ padding: '10px 24px', background: '#DA291C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1, fontFamily: 'inherit' }}>
        {guardando ? 'Guardando...' : 'Guardar y asignar puntos'}
      </button>
    </div>
  )
}

const lbl = { fontSize: 12, color: 'var(--texto-sec)', display: 'block', marginBottom: 4 }
const inp = { width: '100%', fontFamily: 'inherit', fontSize: 13, padding: '6px 9px', border: '0.5px solid var(--borde-input)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--texto)', boxSizing: 'border-box' }
const chip = (bg, color) => ({ background: bg, color, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 8, display: 'inline-block' })
const badge = (bg, color) => ({ background: bg, color, fontSize: 10, padding: '1px 5px', borderRadius: 6, display: 'inline-block' })
