import Deck from '../components/Deck'

const slides = [
  {
    tipo: 'oscura centrada',
    contenido: <>
      <div style={{ width: '14vmin', height: '14vmin', borderRadius: '50%', background: 'var(--d-rojo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7.5vmin', marginBottom: '4vmin' }}>🍟</div>
      <h1 style={{ fontSize: '11vmin', fontWeight: 700 }}>IC VCP</h1>
      <p style={{ fontSize: '3.6vmin', color: 'var(--d-dorado)', marginTop: '1.5vmin' }}>Gamificación del Índice de Controlables</p>
      <p style={{ fontSize: '2.2vmin', color: '#BDB9B0', marginTop: '9vmin' }}>McDonald's Villa Carlos Paz &nbsp;·&nbsp; Propuesta de implementación</p>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">El desafío</h2>
      <p className="deck-sub">Los controlables se definen en gerencia, pero se ganan o se pierden en el piso</p>
      <div className="deck-grid deck-g3">
        <div className="deck-card"><div className="deck-icono">🎯</div><h3>El crew no ve el impacto</h3><p>Quien opera la cocina no tiene visibilidad de cómo su turno afecta el desperdicio, el MFY o el stat.</p></div>
        <div className="deck-card"><div className="deck-icono">📉</div><h3>El incentivo llega tarde</h3><p>Los resultados del IC se conocen a fin de mes, cuando ya no se puede corregir el comportamiento diario.</p></div>
        <div className="deck-card"><div className="deck-icono">🗂️</div><h3>Datos dispersos</h3><p>La trazabilidad por turno y por persona se pierde entre planillas, fotos y mensajes.</p></div>
      </div>
      <p className="deck-cierre"><b>La oportunidad:</b> convertir los objetivos del P&L en un juego diario que el equipo quiera ganar.</p>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">La solución</h2>
      <p className="deck-sub">Una app instalable (PWA) que convierte el IC en competencia — sin tiendas de apps, en el celular de cada empleado</p>
      <div className="deck-grid deck-g3">
        <div className="deck-card"><div className="deck-icono" style={{ background: '#FDEAE8' }}>📊</div><h3>Medir cada turno</h3><p>El manager carga venta, desperdicio, MFY y stat en 2 minutos. La app calcula los % contra objetivo al instante.</p></div>
        <div className="deck-card"><div className="deck-icono" style={{ background: '#FDEAE8' }}>🏆</div><h3>Competir en equipo</h3><p>Cada resultado en objetivo suma puntos que se reparten automáticamente entre quienes trabajaron ese turno.</p></div>
        <div className="deck-card"><div className="deck-icono" style={{ background: '#FDEAE8' }}>📈</div><h3>Decidir con datos</h3><p>La gerencia obtiene evolución diaria, resumen mensual y exportación a Excel y PDF para la franquicia.</p></div>
      </div>
      <p className="deck-cierre deck-url">app-controlables.vercel.app</p>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">Cómo funciona</h2>
      <p className="deck-sub">Un circuito cerrado: del piso al reporte sin pasos manuales intermedios</p>
      <div className="deck-grid deck-g4">
        {[
          ['1', 'El manager carga el turno', 'Venta, completo, incompleto, MFY y stat del día. Validación inmediata contra objetivos.'],
          ['2', 'El motor calcula', 'Puntos base × multiplicador de franja × fin de semana × factor de equidad por persona.'],
          ['3', 'El crew suma', 'Los puntos se asignan según el horario real de Orquest y aparecen al instante en el ranking.'],
          ['4', 'La gerencia reporta', 'Evolución diaria, resumen mensual e indicadores Food/Paper Otros, exportables.'],
        ].map(([n, titulo, texto]) => (
          <div key={n} className="deck-card">
            <div className="deck-icono deck-num" style={{ background: 'var(--d-rojo)', color: '#fff', fontWeight: 700 }}>{n}</div>
            <h3>{titulo}</h3><p>{texto}</p>
          </div>
        ))}
      </div>
      <p className="deck-cierre" style={{ fontSize: '2vmin', fontStyle: 'italic', color: 'var(--d-gris)' }}>Automatizado: el horario semanal se activa solo cada lunes y el sistema alerta el viernes si falta subir el de la semana siguiente.</p>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">Un incentivo alineado al P&L</h2>
      <p className="deck-sub">Los puntos premian exactamente los objetivos del Índice de Controlables</p>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '3vmin', alignItems: 'start' }}>
        <table>
          <tbody>
            <tr><th>Indicador</th><th>Objetivo</th><th>Premio</th></tr>
            <tr><td>Completo</td><td>≤ 0,10% de la venta del turno</td><td>+10 pts (+20 si es $0)</td></tr>
            <tr><td>Incompleto</td><td>≤ 0,44% de la venta del turno</td><td>+10 pts (+20 si es $0)</td></tr>
            <tr><td>MFY</td><td>entre 35″ y 50″</td><td>+10 pts</td></tr>
            <tr><td>Stat diario</td><td>± 0,10% de la venta del día</td><td>+8 pts a todo el día</td></tr>
            <tr><td>Food / Paper Otros</td><td>≤ 0,84% / ≤ 0,74% mensual</td><td>Seguimiento en reportes</td></tr>
          </tbody>
        </table>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vmin' }}>
          <div className="deck-card"><div className="deck-icono" style={{ background: '#FFF4D6' }}>⏰</div><h3>Picos valen doble</h3><p>Almuerzo y cena x2, open x1.5 y fin de semana x2 adicional: el esfuerzo va donde está la venta.</p></div>
          <div className="deck-card"><div className="deck-icono" style={{ background: '#EAF3DE' }}>⚖️</div><h3>Equidad real</h3><p>Factor x1.25 para quienes tienen 12–15 hs semanales: la competencia no la define la cantidad de horas.</p></div>
        </div>
      </div>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo" style={{ marginBottom: '3vmin' }}>Ventajas para el negocio</h2>
      <div className="deck-grid deck-g3">
        <div className="deck-card"><div className="deck-icono">💰</div><h3>Foco directo en rentabilidad</h3><p>Cada punto premia una decisión que reduce desperdicio o protege la venta.</p></div>
        <div className="deck-card"><div className="deck-icono">📅</div><h3>Trazabilidad diaria</h3><p>Resultados por turno, por día y por persona, con historial permanente.</p></div>
        <div className="deck-card"><div className="deck-icono">📄</div><h3>Reportes para la franquicia</h3><p>Resumen mensual exportable a Excel y PDF en dos clics.</p></div>
        <div className="deck-card"><div className="deck-icono">🆓</div><h3>Costo de infraestructura $0</h3><p>Vercel + Supabase en planes gratuitos. Sin licencias ni servidores.</p></div>
        <div className="deck-card"><div className="deck-icono">🔐</div><h3>Seguridad por roles</h3><p>Crew, entrenador, manager y gerente ven solo lo que les corresponde (RLS en base de datos).</p></div>
        <div className="deck-card"><div className="deck-icono">⚙️</div><h3>Sin carga administrativa</h3><p>Horarios desde el PDF de Orquest, activación automática y alertas programadas.</p></div>
      </div>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">Control y transparencia</h2>
      <p className="deck-sub">Gamificar no es relajar el control: el sistema penaliza lo que daña la operación</p>
      <div className="deck-fila"><div className="deck-icono" style={{ background: '#FDEAE8' }}>🚫</div><div><h3>Anti-adulteración de MFY</h3><p>Un MFY por debajo de 35″ no suma: resta 10 puntos. Inflar tiempos para “ganar” sale caro.</p></div></div>
      <div className="deck-fila"><div className="deck-icono" style={{ background: '#FDEAE8' }}>⚠️</div><div><h3>Penalizaciones del gerente</h3><p>Vencimientos secundarios e incumplimientos de procedimiento restan puntos al turno, con detalle registrado.</p></div></div>
      <div className="deck-fila"><div className="deck-icono" style={{ background: '#FDEAE8' }}>🔒</div><div><h3>Historial inmutable</h3><p>Cada punto asignado queda en la base con fecha, turno y factor aplicado. El ranking siempre es auditable.</p></div></div>
      <p style={{ fontSize: '2vmin' }}><b>Privacidad:</b> <span style={{ color: 'var(--d-gris)' }}>el PDF de horarios se procesa en el navegador y nunca se almacena.</span></p>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">Puesta en marcha</h2>
      <p className="deck-sub">La implementación ya está operativa y lista para el testeo con el equipo</p>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '4vmin', alignItems: 'stretch' }}>
        <div style={{ background: 'var(--d-carbon)', borderRadius: '1.5vmin', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4vmin' }}>
          <div className="deck-num" style={{ fontSize: '12vmin', fontWeight: 700, color: 'var(--d-dorado)' }}>$0</div>
          <p style={{ color: '#fff', fontSize: '2.4vmin', textAlign: 'center', marginTop: '1vmin' }}>de costo mensual de infraestructura</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2.2vmin', fontSize: '2.4vmin' }}>
          <div>✅&nbsp; 84 usuarios ya cargados con sus roles</div>
          <div>✅&nbsp; App instalable en cualquier celular, sin tiendas de apps</div>
          <div>✅&nbsp; Login con Google corporativo o email y contraseña</div>
          <div>✅&nbsp; Seguridad de datos activa (políticas por rol en la base)</div>
          <div>✅&nbsp; Crons automáticos: activación de horarios y alertas</div>
          <div>🗓️&nbsp; <b>Siguiente paso:</b> piloto con usuarios reales y ajuste de objetivos</div>
        </div>
      </div>
    </>,
  },
  {
    tipo: 'oscura centrada',
    contenido: <>
      <h2 style={{ fontSize: '6vmin', fontWeight: 700 }}>Los controlables se ganan en el piso.</h2>
      <p style={{ fontSize: '3.4vmin', color: 'var(--d-dorado)', marginTop: '2vmin' }}>IC VCP pone a todo el equipo a jugar el mismo partido que el P&L.</p>
      <div style={{ display: 'flex', gap: '2.5vmin', marginTop: '6vmin', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Badges y logros', 'Notificaciones push', 'Historial personal por empleado'].map(t => (
          <span key={t} style={{ background: '#3A372F', borderRadius: '5vmin', padding: '1.5vmin 3.5vmin', fontSize: '2.2vmin' }}>{t}</span>
        ))}
      </div>
      <p style={{ fontSize: '1.9vmin', fontStyle: 'italic', color: '#BDB9B0', marginTop: '2vmin' }}>Próximas evoluciones del sistema</p>
      <p style={{ fontSize: '2.2vmin', color: '#BDB9B0', marginTop: '7vmin' }}>Federico Werkmeister · Gerente · McDonald's Villa Carlos Paz</p>
    </>,
  },
]

export default function PresentacionFranquicia() {
  return <Deck slides={slides} />
}
