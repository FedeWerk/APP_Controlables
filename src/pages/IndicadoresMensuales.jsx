import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { OBJ } from '../lib/puntuacion'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// Por defecto se carga el mes cerrado anterior
function mesAnterior() {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return { anio: d.getFullYear(), mes: d.getMonth() + 1 }
}

export default function IndicadoresMensuales() {
  const { usuario } = useAuth()
  const inicial = mesAnterior()
  const [anio, setAnio]       = useState(inicial.anio)
  const [mes, setMes]         = useState(inicial.mes)
  const [food, setFood]       = useState('')
  const [paper, setPaper]     = useState('')
  const [historial, setHist]  = useState([])
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState(false)
  const [error, setError]         = useState('')

  const foodV  = parseFloat(food)
  const paperV = parseFloat(paper)
  const foodOk  = !isNaN(foodV)  && foodV  <= OBJ.food_otros
  const paperOk = !isNaN(paperV) && paperV <= OBJ.paper_otros

  useEffect(() => { cargarHistorial() }, [])

  // Precarga los valores existentes si el mes ya fue cargado
  function precargar(a, m, datos) {
    const existente = datos.find(h => h.anio === a && h.mes === m)
    setFood(existente?.food_otros_pct != null ? String(existente.food_otros_pct) : '')
    setPaper(existente?.paper_otros_pct != null ? String(existente.paper_otros_pct) : '')
  }

  function cambiarPeriodo(a, m) {
    setAnio(a)
    setMes(m)
    precargar(a, m, historial)
  }

  async function cargarHistorial() {
    const { data } = await supabase
      .from('indicadores_mensuales')
      .select('*')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
      .limit(12)
    setHist(data || [])
    precargar(anio, mes, data || [])
  }

  async function guardar() {
    if (isNaN(foodV) && isNaN(paperV)) { setError('Ingresá al menos un indicador'); return }
    setGuardando(true); setError('')
    const { error: err } = await supabase
      .from('indicadores_mensuales')
      .upsert({
        anio, mes,
        food_otros_pct:  isNaN(foodV)  ? null : foodV,
        paper_otros_pct: isNaN(paperV) ? null : paperV,
        food_ok:  isNaN(foodV)  ? null : foodOk,
        paper_ok: isNaN(paperV) ? null : paperOk,
        cargado_por: usuario.id,
      }, { onConflict: 'anio,mes' })

    if (err) {
      setError('Error al guardar: ' + err.message)
    } else {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
      cargarHistorial()
    }
    setGuardando(false)
  }

  const anioActual = new Date().getFullYear()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: '0.5rem' }}>Indicadores mensuales</h2>
      <p style={{ fontSize: 13, color: 'var(--texto-sec)', marginBottom: '1.5rem' }}>
        Cargá Food Otros y Paper Otros a mes cerrado. Objetivos: Food ≤ {OBJ.food_otros}% · Paper ≤ {OBJ.paper_otros}%
      </p>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
          <div>
            <label style={lbl}>Mes</label>
            <select value={mes} onChange={e => cambiarPeriodo(anio, parseInt(e.target.value))} style={inp}>
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Año</label>
            <select value={anio} onChange={e => cambiarPeriodo(parseInt(e.target.value), mes)} style={inp}>
              {[anioActual, anioActual - 1].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={lbl}>Food Otros (%)</label>
            <input type="number" step="0.01" value={food} onChange={e => setFood(e.target.value)} placeholder="ej: 0.78" style={inp} />
            {!isNaN(foodV) && food !== '' && (
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4, color: foodOk ? 'var(--ok)' : 'var(--fail)' }}>
                {foodOk ? '✓ En objetivo' : '✗ Fuera de objetivo'}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>Obj ≤ {OBJ.food_otros}%</div>
          </div>
          <div>
            <label style={lbl}>Paper Otros (%)</label>
            <input type="number" step="0.01" value={paper} onChange={e => setPaper(e.target.value)} placeholder="ej: 0.69" style={inp} />
            {!isNaN(paperV) && paper !== '' && (
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4, color: paperOk ? 'var(--ok)' : 'var(--fail)' }}>
                {paperOk ? '✓ En objetivo' : '✗ Fuera de objetivo'}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>Obj ≤ {OBJ.paper_otros}%</div>
          </div>
        </div>
      </div>

      {error && <div style={{ background: 'var(--chip-rojo-bg)', color: 'var(--chip-rojo-tx)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>{error}</div>}
      {guardado && <div style={{ background: 'var(--chip-verde-bg)', color: 'var(--ok)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>✓ Indicadores guardados para {MESES[mes - 1]} {anio}</div>}

      <button onClick={guardar} disabled={guardando}
        style={{ padding: '10px 24px', background: '#DA291C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1, fontFamily: 'inherit', marginBottom: '2rem' }}>
        {guardando ? 'Guardando...' : 'Guardar indicadores'}
      </button>

      {historial.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', background: 'var(--bg-suave)', borderBottom: '0.5px solid var(--borde)', fontSize: 13, fontWeight: 500 }}>
            Últimos meses cargados
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-suave)' }}>
                {['Mes', 'Food Otros', 'Paper Otros'].map(h => (
                  <th key={h} style={{ padding: '6px 16px', textAlign: 'left', color: 'var(--texto-sec)', fontWeight: 500, borderBottom: '0.5px solid var(--borde)', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historial.map(h => (
                <tr key={`${h.anio}-${h.mes}`} style={{ borderBottom: '0.5px solid var(--borde-suave)' }}>
                  <td style={{ padding: '8px 16px' }}>{MESES[h.mes - 1]} {h.anio}</td>
                  <td style={{ padding: '8px 16px' }}>
                    {h.food_otros_pct != null ? (
                      <span style={{ color: h.food_ok ? 'var(--ok)' : 'var(--fail)', fontWeight: 500 }}>
                        {h.food_otros_pct}% {h.food_ok ? '✓' : '✗'}
                      </span>
                    ) : <span style={{ color: 'var(--texto-mute)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 16px' }}>
                    {h.paper_otros_pct != null ? (
                      <span style={{ color: h.paper_ok ? 'var(--ok)' : 'var(--fail)', fontWeight: 500 }}>
                        {h.paper_otros_pct}% {h.paper_ok ? '✓' : '✗'}
                      </span>
                    ) : <span style={{ color: 'var(--texto-mute)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize: 12, color: 'var(--texto-sec)', display: 'block', marginBottom: 4 }
const inp = { width: '100%', fontFamily: 'inherit', fontSize: 13, padding: '6px 9px', border: '0.5px solid var(--borde-input)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--texto)', boxSizing: 'border-box' }
