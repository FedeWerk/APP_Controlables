import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import CargarTurno from './pages/CargarTurno'
import Leaderboard from './pages/Leaderboard'
import SubirHorarios from './pages/SubirHorarios'
import IndicadoresMensuales from './pages/IndicadoresMensuales'
import Reportes from './pages/Reportes'
import Presentaciones from './pages/Presentaciones'
import PresentacionEquipo from './pages/PresentacionEquipo'
import PresentacionFranquicia from './pages/PresentacionFranquicia'
import AuthCallback from './pages/AuthCallback'
import './App.css'

// Tema: preferencia guardada o la del sistema. Se aplica antes del primer render.
function temaInicial() {
  const guardado = localStorage.getItem('ic-tema')
  if (guardado === 'dark' || guardado === 'light') return guardado
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
document.documentElement.dataset.theme = temaInicial()

function BotonTema() {
  const [tema, setTema] = useState(document.documentElement.dataset.theme)
  function alternar() {
    const nuevo = tema === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nuevo
    localStorage.setItem('ic-tema', nuevo)
    setTema(nuevo)
  }
  return (
    <button onClick={alternar} title={tema === 'dark' ? 'Modo claro' : 'Modo oscuro'}
      style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.4)', borderRadius: 6, color: '#fff', fontSize: 13, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.4 }}>
      {tema === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

function Layout() {
  const { usuario, logout, alertas, puedeCargarTurno, puedeSubirPDF, puedeVerReportes } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />

  if (!usuario.rol) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Verificando acceso...</div>
          <div style={{ fontSize: 13, color: 'var(--texto-sec)' }}>Contactá al gerente si el problema persiste.</div>
          <button onClick={logout} style={{ marginTop: '1.5rem', padding: '8px 16px', border: '0.5px solid var(--borde-input)', borderRadius: 8, background: 'transparent', color: 'var(--texto)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header style={{ background: '#DA291C', color: '#fff', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: 12, height: 52, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 20 }}>🍟</span>
        <span style={{ fontWeight: 500, fontSize: 15, flex: 1 }}>IC VCP</span>
        {alertas.length > 0 && (
          <span style={{ background: '#fff', color: '#DA291C', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10 }}>
            {alertas.length} alerta{alertas.length > 1 ? 's' : ''}
          </span>
        )}
        <div style={{ fontSize: 12, opacity: 0.85 }}>{usuario.nombre}</div>
        <BotonTema />
        <button onClick={logout} style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.4)', borderRadius: 6, color: '#fff', fontSize: 11, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Salir
        </button>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span>Ranking</span>
          </NavLink>
          {puedeCargarTurno && (
            <NavLink to="/turno" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span style={{ fontSize: 20 }}>📝</span>
              <span>Cargar turno</span>
            </NavLink>
          )}
          {puedeSubirPDF && (
            <NavLink to="/horarios" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span>Horarios</span>
            </NavLink>
          )}
          {puedeVerReportes && (
            <NavLink to="/indicadores" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span style={{ fontSize: 20 }}>📊</span>
              <span>Indicadores</span>
            </NavLink>
          )}
          {puedeVerReportes && (
            <NavLink to="/reportes" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span style={{ fontSize: 20 }}>📈</span>
              <span>Reportes</span>
            </NavLink>
          )}
          <NavLink to="/presentaciones" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 20 }}>🎤</span>
            <span>Presentación</span>
          </NavLink>
        </aside>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            {puedeCargarTurno && <Route path="/turno" element={<CargarTurno />} />}
            {puedeSubirPDF && <Route path="/horarios" element={<SubirHorarios />} />}
            {puedeVerReportes && <Route path="/indicadores" element={<IndicadoresMensuales />} />}
            {puedeVerReportes && <Route path="/reportes" element={<Reportes />} />}
            <Route path="/presentaciones" element={<Presentaciones />} />
            <Route path="/presentaciones/equipo" element={<PresentacionEquipo />} />
            {puedeVerReportes && <Route path="/presentaciones/franquicia" element={<PresentacionFranquicia />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <nav className="bottom-nav">
        <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <span>Ranking</span>
        </NavLink>
        {puedeCargarTurno && (
          <NavLink to="/turno" style={({ isActive }) => navStyle(isActive)}>
            <span style={{ fontSize: 20 }}>📝</span>
            <span>Cargar</span>
          </NavLink>
        )}
        {puedeSubirPDF && (
          <NavLink to="/horarios" style={({ isActive }) => navStyle(isActive)}>
            <span style={{ fontSize: 20 }}>📅</span>
            <span>Horarios</span>
          </NavLink>
        )}
        {puedeVerReportes && (
          <NavLink to="/indicadores" style={({ isActive }) => navStyle(isActive)}>
            <span style={{ fontSize: 20 }}>📊</span>
            <span>Indicad.</span>
          </NavLink>
        )}
        {puedeVerReportes && (
          <NavLink to="/reportes" style={({ isActive }) => navStyle(isActive)}>
            <span style={{ fontSize: 20 }}>📈</span>
            <span>Reportes</span>
          </NavLink>
        )}
        <NavLink to="/presentaciones" style={({ isActive }) => navStyle(isActive)}>
          <span style={{ fontSize: 20 }}>🎤</span>
          <span>Present.</span>
        </NavLink>
      </nav>
    </div>
  )
}

const navStyle = (isActive) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  fontSize: 11, textDecoration: 'none', padding: '4px 10px', borderRadius: 8,
  color: isActive ? 'var(--rojo)' : 'var(--texto-sec)', fontWeight: isActive ? 500 : 400,
})

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🍟</div>
        <div style={{ fontSize: 13, color: 'var(--texto-sec)' }}>Cargando...</div>
      </div>
    </div>
  )
}

function LoginGuard() {
  const { usuario, loading } = useAuth()
  if (loading) return <Loader />
  if (usuario?.rol) return <Navigate to="/" replace />
  return <Login />
}

function LayoutGuard() {
  const { loading } = useAuth()
  if (loading) return <Loader />
  return <Layout />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<LayoutGuard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
