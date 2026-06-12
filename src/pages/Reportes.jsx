import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { OBJ } from '../lib/puntuacion'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const INDICADORES = [
  { id: 'completo_pct',   label: 'Completo %',   obj: OBJ.completo,   objLabel: `Obj ≤ ${OBJ.completo}%`,   color: '#185FA5' },
  { id: 'incompleto_pct', label: 'Incompleto %', obj: OBJ.incompleto, objLabel: `Obj ≤ ${OBJ.incompleto}%`, color: '#639922' },
  { id: 'stat_pct',       label: 'Stat %',       obj: OBJ.stat,       objLabel: `Obj ±${OBJ.stat}%`,        color: '#534AB7' },
  { id: 'mfy_prom',       label: 'MFY (seg)',    obj: OBJ.mfy_max,    objLabel: `Obj ≤ ${OBJ.mfy_max}"`,    color: '#B86E00' },
]

function ultimosMeses(n) {
  const res = []
  const d = new Date()
  d.setDate(1)
  for (let i = 0; i < n; i++) {
    res.push({ anio: d.getFullYear(), mes: d.getMonth() + 1 })
    d.setMonth(d.getMonth() - 1)
  }
  return res
}

export default function Reportes() {
  const [periodo, setPeriodo]   = useState(ultimosMeses(1)[0])
  const [indicador, setInd]     = useState('completo_pct')
  const [dias, setDias]         = useState([])
  const [resumen, setResumen]   = useState(null)
  const [mensual, setMensual]   = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true)
    const desde = `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}-01`
    const finMes = new Date(periodo.anio, periodo.mes, 0).getDate()
    const hasta = `${periodo.anio}-${String(periodo.mes).padStart(2, '0')}-${String(finMes).padStart(2, '0')}`

    const [{ data: turnos }, { data: stats }, { data: indMes }] = await Promise.all([
      supabase.from('turnos').select('*').gte('fecha', desde).lte('fecha', hasta).order('fecha'),
      supabase.from('stat_diario').select('*').gte('fecha', desde).lte('fecha', hasta).order('fecha'),
      supabase.from('indicadores_mensuales').select('*').eq('anio', periodo.anio).eq('mes', periodo.mes).maybeSingle(),
    ])

    // Agregado por día: % sobre venta del día, MFY promedio
    const porDia = {}
    ;(turnos || []).forEach(t => {
      if (!porDia[t.fecha]) porDia[t.fecha] = { fecha: t.fecha, venta: 0, completo: 0, incompleto: 0, mfys: [] }
      const d = porDia[t.fecha]
      d.venta      += t.venta || 0
      d.completo   += t.completo_monto || 0
      d.incompleto += t.incompleto_monto || 0
      if (t.mfy_segundos != null) d.mfys.push(t.mfy_segundos)
    })
    ;(stats || []).forEach(s => {
      if (!porDia[s.fecha]) porDia[s.fecha] = { fecha: s.fecha, venta: 0, completo: 0, incompleto: 0, mfys: [] }
      porDia[s.fecha].stat_pct = Math.round(s.stat_pct * 1000) / 1000
      porDia[s.fecha].stat_ok = s.dentro_objetivo
    })

    const filas = Object.values(porDia).sort((a, b) => a.fecha.localeCompare(b.fecha)).map(d => ({
      ...d,
      dia: parseInt(d.fecha.slice(8)),
      completo_pct:   d.venta > 0 ? Math.round(d.completo / d.venta * 100 * 1000) / 1000 : null,
      incompleto_pct: d.venta > 0 ? Math.round(d.incompleto / d.venta * 100 * 1000) / 1000 : null,
      mfy_prom: d.mfys.length > 0 ? Math.round(d.mfys.reduce((a, b) => a + b, 0) / d.mfys.length) : null,
    }))
    setDias(filas)

    // Resumen del mes
    const ventaTotal = filas.reduce((a, d) => a + d.venta, 0)
    const compTotal  = filas.reduce((a, d) => a + d.completo, 0)
    const incTotal   = filas.reduce((a, d) => a + d.incompleto, 0)
    const mfysTodos  = (turnos || []).filter(t => t.mfy_segundos != null).map(t => t.mfy_segundos)
    const diasConStat = filas.filter(d => d.stat_pct != null)
    setResumen({
      ventaTotal, compTotal, incTotal,
      compPct: ventaTotal > 0 ? compTotal / ventaTotal * 100 : null,
      incPct:  ventaTotal > 0 ? incTotal / ventaTotal * 100 : null,
      mfyProm: mfysTodos.length > 0 ? mfysTodos.reduce((a, b) => a + b, 0) / mfysTodos.length : null,
      statOk: diasConStat.filter(d => d.stat_ok).length,
      statTotal: diasConStat.length,
      turnosCargados: (turnos || []).length,
    })
    setMensual(indMes)
    setLoading(false)
    }
    cargarDatos()
  }, [periodo])

  function exportarCSV() {
    // Formato Excel AR: separador ; y coma decimal
    const num = v => v == null ? '' : String(v).replace('.', ',')
    const filas = [
      ['Fecha', 'Venta dia ($)', 'Completo ($)', 'Completo %', 'Incompleto ($)', 'Incompleto %', 'MFY prom (seg)', 'Stat %', 'Stat OK'],
      ...dias.map(d => [
        d.fecha, num(d.venta), num(d.completo), num(d.completo_pct),
        num(d.incompleto), num(d.incompleto_pct), num(d.mfy_prom),
        num(d.stat_pct), d.stat_pct != null ? (d.stat_ok ? 'SI' : 'NO') : '',
      ]),
    ]
    if (mensual) {
      filas.push([])
      filas.push(['Food Otros %', num(mensual.food_otros_pct), mensual.food_ok ? 'OK' : 'Fuera'])
      filas.push(['Paper Otros %', num(mensual.paper_otros_pct), mensual.paper_ok ? 'OK' : 'Fuera'])
    }
    const csv = '﻿' + filas.map(f => f.join(';')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `IC_VCP_${periodo.anio}-${String(periodo.mes).padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const indActual = INDICADORES.find(i => i.id === indicador)
  const fmtMoney = v => v != null ? '$' + Math.round(v).toLocaleString('es-AR') : '—'
  const fmtPct = v => v != null ? v.toFixed(3) + '%' : '—'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '1rem' }} className="reporte-print">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500 }}>Reportes</h2>
        <div style={{ display: 'flex', gap: 8 }} className="no-print">
          <select value={`${periodo.anio}-${periodo.mes}`}
            onChange={e => { const [a, m] = e.target.value.split('-'); setPeriodo({ anio: parseInt(a), mes: parseInt(m) }) }}
            style={{ fontSize: 13, padding: '5px 8px', border: '0.5px solid var(--borde-input)', borderRadius: 8, fontFamily: 'inherit' }}>
            {ultimosMeses(12).map(p => (
              <option key={`${p.anio}-${p.mes}`} value={`${p.anio}-${p.mes}`}>{MESES[p.mes - 1]} {p.anio}</option>
            ))}
          </select>
          <button onClick={exportarCSV} style={btn}>⬇ Excel</button>
          <button onClick={() => window.print()} style={btn}>🖨 PDF</button>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--texto-sec)', marginBottom: '1.5rem' }}>
        IC VCP — {MESES[periodo.mes - 1]} {periodo.anio} · McDonald's Villa Carlos Paz
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-ter)', fontSize: 13 }}>Cargando...</div>
      ) : dias.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '2rem', textAlign: 'center', color: 'var(--texto-ter)', fontSize: 13 }}>
          Sin turnos cargados en {MESES[periodo.mes - 1]} {periodo.anio}
        </div>
      ) : (
        <>
          {/* Resumen del mes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: '1.5rem' }}>
            <Card titulo="Venta del mes" valor={fmtMoney(resumen.ventaTotal)} sub={`${resumen.turnosCargados} turnos cargados`} />
            <Card titulo="Completo" valor={fmtPct(resumen.compPct)} sub={fmtMoney(resumen.compTotal)}
              ok={resumen.compPct != null ? resumen.compPct <= OBJ.completo : null} />
            <Card titulo="Incompleto" valor={fmtPct(resumen.incPct)} sub={fmtMoney(resumen.incTotal)}
              ok={resumen.incPct != null ? resumen.incPct <= OBJ.incompleto : null} />
            <Card titulo="MFY promedio" valor={resumen.mfyProm != null ? Math.round(resumen.mfyProm) + '"' : '—'} sub={`Obj 35"–50"`}
              ok={resumen.mfyProm != null ? resumen.mfyProm >= OBJ.mfy_min && resumen.mfyProm <= OBJ.mfy_max : null} />
            <Card titulo="Stat en objetivo" valor={resumen.statTotal > 0 ? `${resumen.statOk}/${resumen.statTotal} días` : '—'} sub={`Obj ±${OBJ.stat}%`} />
            <Card titulo="Food / Paper Otros"
              valor={mensual ? `${mensual.food_otros_pct ?? '—'}% / ${mensual.paper_otros_pct ?? '—'}%` : 'Sin cargar'}
              sub={`Obj ≤ ${OBJ.food_otros}% / ≤ ${OBJ.paper_otros}%`}
              ok={mensual ? (mensual.food_ok && mensual.paper_ok) : null} />
          </div>

          {/* Evolución diaria */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Evolución diaria</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} className="no-print">
                {INDICADORES.map(i => (
                  <button key={i.id} onClick={() => setInd(i.id)}
                    style={{ padding: '4px 10px', border: '0.5px solid var(--borde-input)', borderRadius: 8, background: indicador === i.id ? 'var(--bg-activo)' : 'transparent', fontWeight: indicador === i.id ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dias} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede6" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#73726c' }} />
                <YAxis tick={{ fontSize: 11, fill: '#73726c' }} domain={['auto', 'auto']} />
                <Tooltip
                  formatter={(v) => [indicador === 'mfy_prom' ? `${v}"` : `${v}%`, indActual.label]}
                  labelFormatter={d => `Día ${d}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid var(--borde)' }} />
                <ReferenceLine y={indActual.obj} stroke="#A32D2D" strokeDasharray="4 4"
                  label={{ value: indActual.objLabel, fontSize: 10, fill: 'var(--fail)', position: 'insideTopRight' }} />
                {indicador === 'stat_pct' && <ReferenceLine y={-OBJ.stat} stroke="#A32D2D" strokeDasharray="4 4" />}
                {indicador === 'mfy_prom' && <ReferenceLine y={OBJ.mfy_min} stroke="#B86E00" strokeDasharray="4 4"
                  label={{ value: `Min ${OBJ.mfy_min}"`, fontSize: 10, fill: '#B86E00', position: 'insideBottomRight' }} />}
                <Line type="monotone" dataKey={indicador} stroke={indActual.color} strokeWidth={2}
                  dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla diaria */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '10px 16px', background: 'var(--bg-suave)', borderBottom: '0.5px solid var(--borde)', fontSize: 13, fontWeight: 500 }}>
              Detalle diario
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-suave)' }}>
                    {['Día', 'Venta', 'Completo %', 'Incompleto %', 'MFY', 'Stat %'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--texto-sec)', fontWeight: 500, borderBottom: '0.5px solid var(--borde)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dias.map(d => (
                    <tr key={d.fecha} style={{ borderBottom: '0.5px solid var(--borde-suave)' }}>
                      <td style={{ padding: '6px 10px' }}>{d.dia}</td>
                      <td style={{ padding: '6px 10px' }}>{fmtMoney(d.venta)}</td>
                      <td style={{ padding: '6px 10px', color: d.completo_pct == null ? '#aaa' : d.completo_pct <= OBJ.completo ? 'var(--ok)' : 'var(--fail)' }}>{d.completo_pct != null ? d.completo_pct + '%' : '—'}</td>
                      <td style={{ padding: '6px 10px', color: d.incompleto_pct == null ? '#aaa' : d.incompleto_pct <= OBJ.incompleto ? 'var(--ok)' : 'var(--fail)' }}>{d.incompleto_pct != null ? d.incompleto_pct + '%' : '—'}</td>
                      <td style={{ padding: '6px 10px', color: d.mfy_prom == null ? '#aaa' : d.mfy_prom >= OBJ.mfy_min && d.mfy_prom <= OBJ.mfy_max ? 'var(--ok)' : 'var(--fail)' }}>{d.mfy_prom != null ? d.mfy_prom + '"' : '—'}</td>
                      <td style={{ padding: '6px 10px', color: d.stat_pct == null ? '#aaa' : d.stat_ok ? 'var(--ok)' : 'var(--fail)' }}>{d.stat_pct != null ? d.stat_pct + '%' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Card({ titulo, valor, sub, ok = null }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: 11, color: 'var(--texto-sec)', marginBottom: 4 }}>{titulo}</div>
      <div style={{ fontSize: 17, fontWeight: 500, color: ok === null ? '#1a1a1a' : ok ? 'var(--ok)' : 'var(--fail)' }}>
        {valor}{ok !== null && <span style={{ fontSize: 12, marginLeft: 4 }}>{ok ? '✓' : '✗'}</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 2 }}>{sub}</div>
    </div>
  )
}

const btn = { padding: '5px 12px', border: '0.5px solid var(--borde-input)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }
