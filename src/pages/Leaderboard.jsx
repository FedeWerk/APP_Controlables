import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../lib/puntuacion'

export default function Leaderboard() {
  const { usuario } = useAuth()
  const [vista, setVista]     = useState('crew')
  const [periodo, setPeriodo] = useState('semana')
  const [dataCrew, setDataCrew]   = useState([])
  const [dataTurnos, setDataTurnos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargarDatos() }, [periodo])

  async function cargarDatos() {
    setLoading(true)
    const desde = getFecha(periodo)

    const { data: puntajes } = await supabase
      .from('puntajes')
      .select('*, usuario:usuario_id(id, nombre, rol)')
      .gte('fecha', desde)

    if (puntajes) {
      const porUsuario = {}
      puntajes.forEach(p => {
        const uid = p.usuario_id
        if (!porUsuario[uid]) {
          porUsuario[uid] = { id: uid, nombre: p.usuario?.nombre ?? 'Desconocido', rol: p.usuario?.rol ?? 'crew', pts: 0, turnos: 0 }
        }
        porUsuario[uid].pts += p.pts_total
        porUsuario[uid].turnos++
      })
      const sorted = Object.values(porUsuario).sort((a, b) => b.pts - a.pts)
      setDataCrew(sorted)

      const porFranja = {}
      puntajes.forEach(p => {
        if (!porFranja[p.franja]) porFranja[p.franja] = { franja: p.franja, pts: 0, turnos: 0 }
        porFranja[p.franja].pts += p.pts_total / (p.usuario ? 1 : 1)
        porFranja[p.franja].turnos++
      })
      const sortedT = Object.values(porFranja).sort((a, b) => b.pts - a.pts)
      setDataTurnos(sortedT)
    }
    setLoading(false)
  }

  function getFecha(p) {
    const d = new Date()
    if (p === 'semana') { const dia = d.getDay(); d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1)) }
    else if (p === 'mes') d.setDate(1)
    return d.toISOString().split('T')[0]
  }

  const FRANJAS = { desayuno: '🌅 Desayuno', almuerzo: '☀️ Almuerzo', merienda: '🌤️ Merienda', cena: '🌙 Cena', open: '🌃 Open' }
  const maxPts = dataCrew.length > 0 ? dataCrew[0].pts : 1
  const maxPtsT = dataTurnos.length > 0 ? dataTurnos[0].pts : 1
  const medalles = ['🥇', '🥈', '🥉']

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500 }}>Leaderboard</h2>
        <select value={periodo} onChange={e => setPeriodo(e.target.value)}
          style={{ fontSize: 13, padding: '5px 8px', border: '0.5px solid #ccc', borderRadius: 8, fontFamily: 'inherit' }}>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
        {['crew', 'turnos'].map(v => (
          <button key={v} onClick={() => setVista(v)}
            style={{ padding: '6px 16px', border: '0.5px solid #ccc', borderRadius: 8, background: vista === v ? '#f0ede6' : 'transparent', fontWeight: vista === v ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
            {v === 'crew' ? 'Empleados' : 'Turnos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888', fontSize: 13 }}>Cargando...</div>
      ) : vista === 'crew' ? (
        <div style={{ background: '#fff', border: '0.5px solid #e0ddd4', borderRadius: 12, overflow: 'hidden' }}>
          {dataCrew.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888', fontSize: 13 }}>Sin datos para el período seleccionado</div>
          ) : dataCrew.map((c, i) => {
            const esMio = c.id === usuario?.id
            const rolConf = ROLES[c.rol] ?? ROLES.crew
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '0.5px solid #f0ede6', background: esMio ? '#f8f7f4' : 'transparent' }}>
                <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{i < 3 ? medalles[i] : i + 1}</div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: rolConf.bg, color: rolConf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                  {c.nombre.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: esMio ? 500 : 400 }}>
                    {c.nombre}
                    {esMio && <span style={{ fontSize: 11, background: '#E6F1FB', color: '#0C447C', padding: '1px 6px', borderRadius: 6, marginLeft: 6 }}>vos</span>}
                    {c.rol === 'entrenador' && <span style={{ fontSize: 11, background: '#EAF3DE', color: '#27500A', padding: '1px 6px', borderRadius: 6, marginLeft: 4 }}>entrenador</span>}
                  </div>
                  <div style={{ height: 4, background: '#f0ede6', borderRadius: 2, marginTop: 5, overflow: 'hidden', width: 120 }}>
                    <div style={{ height: '100%', background: '#185FA5', borderRadius: 2, width: `${Math.round(c.pts / maxPts * 100)}%` }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#185FA5' }}>{Math.round(c.pts)}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{c.turnos} turnos</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '0.5px solid #e0ddd4', borderRadius: 12, overflow: 'hidden' }}>
          {dataTurnos.map((t, i) => (
            <div key={t.franja} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '0.5px solid #f0ede6' }}>
              <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{i < 3 ? medalles[i] : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{FRANJAS[t.franja] ?? t.franja}</div>
                <div style={{ height: 4, background: '#f0ede6', borderRadius: 2, marginTop: 5, overflow: 'hidden', width: 140 }}>
                  <div style={{ height: '100%', background: '#639922', borderRadius: 2, width: `${Math.round(t.pts / maxPtsT * 100)}%` }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#639922' }}>{Math.round(t.pts)}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{t.turnos} cargas</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
