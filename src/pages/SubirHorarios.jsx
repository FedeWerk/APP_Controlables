import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { asignarTurno, getProximoLunes } from '../lib/puntuacion'

export default function SubirHorarios() {
  const [archivo, setArchivo]   = useState(null)
  const [preview, setPreview]   = useState([])
  const [procesando, setProcesando] = useState(false)
  const [guardando, setGuardando]   = useState(false)
  const [guardado, setGuardado]     = useState(false)
  const [error, setError]           = useState('')
  const [semana, setSemana]         = useState(getProximoLunes())

  async function procesarPDF(e) {
    const file = e.target.files[0]
    if (!file) return
    setArchivo(file)
    setProcesando(true)
    setError('')
    setPreview([])

    try {
      // Importar pdf.js dinámicamente
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let textoCompleto = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        textoCompleto += content.items.map(item => item.str).join(' ') + '\n'
      }

      // Parser básico: busca patrones de nombre + horario
      // Formato Orquest típico: "APELLIDO Nombre  DD/MM  HH:MM-HH:MM"
      const filas = parsearTextoOrquest(textoCompleto)
      setPreview(filas)
    } catch (e) {
      setError('No se pudo leer el PDF. Verificá que sea el archivo de horarios de Orquest. Error: ' + e.message)
    }
    setProcesando(false)
  }

  function parsearTextoOrquest(texto) {
    const resultado = []
    const lineas = texto.split('\n').filter(l => l.trim())

    // Patrón: detecta rangos horarios HH:MM-HH:MM o HH:MM – HH:MM
    const regexHorario = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/
    const regexNombre  = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑA-Z][a-záéíóúñ]+)+/

    lineas.forEach(linea => {
      const matchH = linea.match(regexHorario)
      if (!matchH) return
      const hIni = parseInt(matchH[1]) + parseInt(matchH[2]) / 60
      const hFin = parseInt(matchH[3]) + parseInt(matchH[4]) / 60
      const hFinAdj = hFin < hIni ? hFin + 24 : hFin // cruza medianoche

      const matchN = linea.match(regexNombre)
      const nombre = matchN ? matchN[0].trim() : 'Sin nombre'

      const asignaciones = asignarTurno(hIni, hFinAdj)
      asignaciones.forEach(a => {
        resultado.push({
          nombre_pdf: nombre,
          hora_inicio: hIni,
          hora_fin: hFinAdj,
          horas_dia: Math.round((hFinAdj - hIni) * 10) / 10,
          turno_principal: a.turnoId,
          prop_turno: Math.round(a.prop * 100) / 100,
        })
      })
    })

    // Calcular horas_semana por empleado (suma de todos sus turnos en la semana)
    const porEmpleado = {}
    resultado.forEach(r => {
      if (!porEmpleado[r.nombre_pdf]) porEmpleado[r.nombre_pdf] = 0
      porEmpleado[r.nombre_pdf] += r.horas_dia
    })
    return resultado.map(r => ({ ...r, horas_semana: Math.round(porEmpleado[r.nombre_pdf] * 10) / 10 }))
  }

  async function guardarHorarios() {
    if (preview.length === 0) return
    setGuardando(true)
    setError('')

    try {
      const lunesFin = new Date(semana + 'T12:00:00')
      lunesFin.setDate(lunesFin.getDate() + 6)
      const domingo = lunesFin.toISOString().split('T')[0]

      const { data: semanaData, error: errSemana } = await supabase
        .from('horarios_semana')
        .upsert({ semana_inicio: semana, semana_fin: domingo, activo: false }, { onConflict: 'semana_inicio' })
        .select().single()

      if (errSemana) throw errSemana

      await supabase.from('asignaciones').delete().eq('semana_id', semanaData.id)

      const inserts = preview.map(r => ({
        semana_id: semanaData.id,
        nombre_pdf: r.nombre_pdf,
        hora_inicio: r.hora_inicio,
        hora_fin: r.hora_fin,
        horas_semana: r.horas_semana,
        turno_principal: r.turno_principal,
        prop_turno: r.prop_turno,
        fecha: semana,
      }))

      const { error: errIns } = await supabase.from('asignaciones').insert(inserts)
      if (errIns) throw errIns

      await supabase.from('alertas').update({ resuelta: true }).eq('tipo', 'horario_faltante')

      setGuardado(true)
      setPreview([])
      setArchivo(null)
    } catch (e) {
      setError('Error al guardar: ' + e.message)
    }
    setGuardando(false)
  }

  const TURNOS_LABEL = { desayuno: '🌅 Desayuno', almuerzo: '☀️ Almuerzo', merienda: '🌤️ Merienda', cena: '🌙 Cena', open: '🌃 Open' }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: '0.5rem' }}>Subir horarios de Orquest</h2>
      <p style={{ fontSize: 13, color: 'var(--texto-sec)', marginBottom: '1.5rem' }}>
        Exportá el PDF de horarios semanales desde Orquest y subilo acá. Se procesa localmente — los horarios no se almacenan, solo los datos de asignación de turno.
      </p>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: 12, color: 'var(--texto-sec)', display: 'block', marginBottom: 4 }}>Semana de aplicación (lunes)</label>
          <input type="date" value={semana} onChange={e => setSemana(e.target.value)}
            style={{ fontFamily: 'inherit', fontSize: 13, padding: '6px 9px', border: '0.5px solid var(--borde-input)', borderRadius: 8, maxWidth: 200 }} />
          <div style={{ fontSize: 11, color: 'var(--texto-ter)', marginTop: 3 }}>Se activará automáticamente el lunes 00:00</div>
        </div>

        <label style={{ display: 'block', border: '1px dashed var(--borde-input)', borderRadius: 10, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-suave)' }}>
          <input type="file" accept=".pdf" onChange={procesarPDF} style={{ display: 'none' }} />
          <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--texto)' }}>{archivo ? archivo.name : 'Seleccioná el PDF de Orquest'}</div>
          <div style={{ fontSize: 12, color: 'var(--texto-ter)', marginTop: 4 }}>Hacé click o arrastrá el archivo acá</div>
        </label>
      </div>

      {procesando && (
        <div style={{ background: 'var(--chip-azul-bg)', color: 'var(--chip-azul-tx)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>
          Procesando PDF...
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--chip-rojo-bg)', color: 'var(--chip-rojo-tx)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>{error}</div>
      )}

      {guardado && (
        <div style={{ background: 'var(--chip-verde-bg)', color: 'var(--ok)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: '1rem' }}>
          ✓ Horarios guardados para la semana del {semana}. Se activarán el lunes automáticamente.
        </div>
      )}

      {preview.length > 0 && (
        <>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '10px 16px', background: 'var(--bg-suave)', borderBottom: '0.5px solid var(--borde)', fontSize: 13, fontWeight: 500 }}>
              Vista previa — {preview.length} asignaciones detectadas
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg-suave)' }}>
                  {['Empleado', 'Horario', 'Hs/día', 'Hs/sem', 'Turno', 'Prop.'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--texto-sec)', fontWeight: 500, borderBottom: '0.5px solid var(--borde)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 30).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '0.5px solid var(--borde-suave)' }}>
                    <td style={{ padding: '6px 10px' }}>{r.nombre_pdf}</td>
                    <td style={{ padding: '6px 10px', color: 'var(--texto-sec)' }}>{Math.floor(r.hora_inicio)}:{String(Math.round((r.hora_inicio % 1) * 60)).padStart(2, '0')}–{Math.floor(r.hora_fin % 24)}:{String(Math.round((r.hora_fin % 1) * 60)).padStart(2, '0')}</td>
                    <td style={{ padding: '6px 10px' }}>{r.horas_dia}h</td>
                    <td style={{ padding: '6px 10px' }}>{r.horas_semana}h</td>
                    <td style={{ padding: '6px 10px' }}>{TURNOS_LABEL[r.turno_principal]}</td>
                    <td style={{ padding: '6px 10px' }}>{r.prop_turno < 1 ? `${Math.round(r.prop_turno * 100)}%` : '100%'}</td>
                  </tr>
                ))}
                {preview.length > 30 && (
                  <tr><td colSpan={6} style={{ padding: '6px 10px', color: 'var(--texto-ter)', fontSize: 11 }}>...y {preview.length - 30} más</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={guardarHorarios} disabled={guardando}
              style={{ padding: '10px 24px', background: '#DA291C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.7 : 1, fontFamily: 'inherit' }}>
              {guardando ? 'Guardando...' : 'Confirmar y guardar'}
            </button>
            <button onClick={() => { setPreview([]); setArchivo(null) }}
              style={{ padding: '10px 16px', border: '0.5px solid var(--borde-input)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
