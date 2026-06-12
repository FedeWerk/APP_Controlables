import Deck from '../components/Deck'

const num = (n) => (
  <div className="deck-num" style={{ width: '7vmin', height: '7vmin', borderRadius: '50%', background: 'var(--d-rojo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5vmin', fontWeight: 700, marginBottom: '2vmin' }}>{n}</div>
)

const slides = [
  {
    tipo: 'roja centrada',
    contenido: <>
      <div style={{ fontSize: '11vmin', marginBottom: '2vmin' }}>🍟</div>
      <h1 style={{ fontSize: '7.5vmin', fontWeight: 700 }}>¡Tus turnos ahora suman puntos!</h1>
      <p style={{ fontSize: '3.6vmin', color: 'var(--d-dorado)', marginTop: '2vmin' }}>Llega IC VCP: la competencia oficial del local</p>
      <p style={{ fontSize: '2.2vmin', color: '#FFD9D5', marginTop: '8vmin' }}>McDonald's Villa Carlos Paz</p>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">¿De qué se trata?</h2>
      <p className="deck-sub">Tu trabajo de siempre, pero ahora cada turno bien jugado suma puntos</p>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '4vmin', alignItems: 'center' }}>
        <div style={{ fontSize: '2.7vmin', lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: '3vmin' }}>
          <p>Cada turno que trabajás, el local mide cuatro cosas: <b>el desperdicio completo, el incompleto, el tiempo de MFY y el stat del día</b>. Si el turno las hace bien, todos los que estuvieron en ese turno suman puntos.</p>
          <p><b style={{ color: 'var(--d-rojo)' }}>No tenés que cargar nada</b>: el manager carga los resultados y tus puntos aparecen solos en el ranking, según tu horario de Orquest.</p>
        </div>
        <div style={{ background: 'var(--d-panel)', border: '1px solid var(--d-borde)', borderRadius: '1.5vmin', padding: '3.5vmin', display: 'flex', flexDirection: 'column', gap: '2.8vmin', fontSize: '2.6vmin', fontWeight: 700 }}>
          <div>🥇&nbsp; Ranking semanal</div>
          <div>🏅&nbsp; Ranking mensual</div>
          <div>⚔️&nbsp; Turnos vs. turnos</div>
          <div>🧑‍🍳&nbsp; Crew y entrenadores</div>
        </div>
      </div>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">Cómo se suman puntos</h2>
      <p className="deck-sub">Premia jugar limpio y cuidar el producto — quien incumple, resta</p>
      <div className="deck-grid deck-g2">
        <div className="deck-card deck-pts"><div className="deck-num">+10</div><div><h3>Desperdicio en objetivo</h3><p>Completo ≤ 0,10% o incompleto ≤ 0,44% de la venta del turno.</p></div></div>
        <div className="deck-card deck-pts"><div className="deck-num">+20</div><div><h3>Cero absoluto</h3><p>Turno con completo o incompleto en $0: el doble de puntos.</p></div></div>
        <div className="deck-card deck-pts"><div className="deck-num">+10</div><div><h3>MFY entre 35″ y 50″</h3><p>Tiempo real y dentro de objetivo.</p></div></div>
        <div className="deck-card deck-pts"><div className="deck-num">+8</div><div><h3>Stat del día OK</h3><p>Si el día cierra dentro de ±0,10%, suman todos los que trabajaron.</p></div></div>
      </div>
      <div className="deck-banda" style={{ background: '#FDEAE8', color: '#6B1F1A' }}><b style={{ color: 'var(--d-rojo-osc)', fontSize: '2.8vmin' }}>−10</b> &nbsp;MFY menor a 35″ (adulterado), vencimientos secundarios u otro incumplimiento.</div>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">No todos los turnos valen lo mismo</h2>
      <p className="deck-sub">Los picos de venta multiplican tus puntos</p>
      <div className="deck-grid deck-g5">
        {[['🌅', 'Desayuno', 'x1.0', 0], ['☀️', 'Almuerzo', 'x2.0', 1], ['🌤️', 'Merienda', 'x1.0', 0], ['🌙', 'Cena', 'x2.0', 1], ['🌃', 'Open', 'x1.5', 1]].map(([emoji, nombre, mult, destacado]) => (
          <div key={nombre} className="deck-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4.5vmin' }}>{emoji}</div>
            <h3 style={{ fontSize: '2.2vmin', marginTop: '1vmin' }}>{nombre}</h3>
            <div className="deck-num" style={{ fontSize: '4.5vmin', fontWeight: 700, color: destacado ? 'var(--d-rojo)' : 'var(--d-gris)' }}>{mult}</div>
          </div>
        ))}
      </div>
      <div className="deck-banda" style={{ background: '#FFF4D6' }}>🔥 <b>Fin de semana: x2 adicional.</b> &nbsp;Cena de sábado = x2 × x2 = <b style={{ color: 'var(--d-rojo)', fontSize: '3vmin' }}>¡x4 tus puntos!</b></div>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">La cancha está nivelada</h2>
      <p className="deck-sub">El sistema está pensado para que cualquiera pueda ganar</p>
      <div className="deck-fila"><div className="deck-icono" style={{ background: '#EAF3DE' }}>⚖️</div><div><h3>¿Pocas horas? Tenés ventaja</h3><p>Si trabajás entre 12 y 15 horas semanales, tus puntos de turno se multiplican x1.25.</p></div></div>
      <div className="deck-fila"><div className="deck-icono" style={{ background: '#EAF3DE' }}>🤝</div><div><h3>Suma el turno, no el individuo</h3><p>Los puntos se reparten entre todos los que estuvieron: cuidar los controlables es trabajo de equipo.</p></div></div>
      <div className="deck-fila"><div className="deck-icono" style={{ background: '#EAF3DE' }}>🧑‍🏫</div><div><h3>Entrenadores incluidos</h3><p>Compiten en el mismo ranking que el crew, identificados con su etiqueta verde.</p></div></div>
    </>,
  },
  {
    contenido: <>
      <h2 className="deck-titulo">Empezá hoy: 3 pasos</h2>
      <p className="deck-sub">En dos minutos ya estás participando</p>
      <div className="deck-grid deck-g3">
        <div className="deck-card">{num(1)}<h3>Entrá</h3><p>Abrí <span className="deck-url">app-controlables.vercel.app</span> en tu celular e ingresá con tu cuenta de Google (la que le diste al gerente).</p></div>
        <div className="deck-card">{num(2)}<h3>Instalala</h3><p>Desde el menú del navegador: “Agregar a pantalla de inicio”. Queda como una app más.</p></div>
        <div className="deck-card">{num(3)}<h3>Jugá</h3><p>Mirá el ranking, defendé tu turno y sumá puntos en cada franja que trabajes.</p></div>
      </div>
      <p style={{ textAlign: 'center', fontSize: '2.3vmin', marginTop: '3.5vmin' }}><b style={{ color: 'var(--d-rojo)' }}>¿No te deja entrar?</b> <span style={{ color: 'var(--d-gris)' }}>Avisale al gerente para que verifique tu email en el sistema.</span></p>
    </>,
  },
  {
    tipo: 'roja centrada',
    contenido: <>
      <h2 style={{ fontSize: '7vmin', fontWeight: 700 }}>El IC lo ganamos entre todos.</h2>
      <p style={{ fontSize: '3.6vmin', color: 'var(--d-dorado)', marginTop: '2vmin' }}>Cada turno cuenta. Cada punto también.</p>
      <p style={{ fontSize: '2.5vmin', fontStyle: 'italic', color: '#FFD9D5', marginTop: '6vmin' }}>Y esto recién empieza: pronto, badges, logros y notificaciones 👀</p>
      <p className="deck-url" style={{ fontSize: '3vmin', marginTop: '6vmin', color: '#fff' }}>app-controlables.vercel.app</p>
    </>,
  },
]

export default function PresentacionEquipo() {
  return <Deck slides={slides} />
}
