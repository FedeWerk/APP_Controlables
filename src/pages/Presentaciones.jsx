import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Presentaciones() {
  const { puedeVerReportes } = useAuth()

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: '0.5rem' }}>Presentaciones</h2>
      <p style={{ fontSize: 13, color: 'var(--texto-sec)', marginBottom: '1.5rem' }}>
        Se navegan con las flechas del teclado, deslizando el dedo o con los botones en pantalla. Salís con ✕ o Esc.
      </p>

      <Link to="/presentaciones/equipo" style={{ textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: '#DA291C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🍟</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>¡Tus turnos ahora suman puntos!</div>
            <div style={{ fontSize: 12.5, color: 'var(--texto-sec)', marginTop: 3 }}>
              Cómo funciona la competencia: puntos, multiplicadores y cómo empezar. Para todo el equipo.
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--texto-mute)' }}>›</div>
        </div>
      </Link>

      {puedeVerReportes && (
        <Link to="/presentaciones/franquicia" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--borde)', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: '#27251F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>📊</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Gamificación del Índice de Controlables</div>
              <div style={{ fontSize: 12.5, color: 'var(--texto-sec)', marginTop: 3 }}>
                Ventajas de negocio de la implementación. Para presentar a la franquicia / supervisión.
              </div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 18, color: 'var(--texto-mute)' }}>›</div>
          </div>
        </Link>
      )}
    </div>
  )
}
