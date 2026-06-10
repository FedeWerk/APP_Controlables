import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import CargarTurno from './pages/CargarTurno'
import Leaderboard from './pages/Leaderboard'
import SubirHorarios from './pages/SubirHorarios'
import './App.css'

function Layout() {
  const { usuario, logout, alertas, puedeCargarTurno, puedeSubirPDF } = useAuth()
  if (!usuario) return <Navigate to="/login" />
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <header style={{ background: '#DA291C', color: '#fff', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: 12, height: 52, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 20 }}>🍟</span>
        <span style={{ fontWeight: 500, fontSize: 15, flex: 1 }}>IC VCP</span>
        {alertas.length > 0 && (
          <span style={{ background: '#fff', color: '#DA291C', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10 }}>
            {alertas.length} alerta{alertas.length > 1 ? 's' : ''}
          </span>
        )}
        <div style={{ fontSize: 12, opacity: 0.85 }}>{usuario.nombre}</div>
        <button onClick={logout} style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.4)', borderRadius: 6, color: '#fff', fontSize: 11, padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
          Salir
        </button>
      </header>
      <main style={{ padding: '1.5rem 0', maxWidth: 680, margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          {puedeCargarTurno && <Route path="/turno" element={<CargarTurno />} />}
          {puedeSubirPDF && <Route path="/horarios" element={<SubirHorarios />} />}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <nav style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '0.5px solid #e0ddd4', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px' }}>
        <NavLink to="/" end style={({ isActive }) => navStyle(isActive)}>
          <span style={{ fontSize: 20 }}>🏆</span>
          <span>Ranking</span>
        </NavLink>
        {puedeCargarTurno && (
          <NavLink to="/turno" style={({ isActive }) => navStyle(isActive)}>
            <span style={{ fontSize: 20 }}>📝</span>
            <span>Cargar turno</span>
          </NavLink>
        )}
        {puedeSubirPDF && (
          <NavLink to="/horarios" style={({ isActive }) => navStyle(isActive)}>
            <span style={{ fontSize: 20 }}>📅</span>
            <span>Horarios</span>
          </NavLink>
        )}
      </nav>
    </div>
  )
}

const navStyle = (isActive) => ({
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  fontSize: 11, textDecoration: 'none', padding: '4px 16px', borderRadius: 8,
  color: isActive ? '#DA291C' : '#73726c', fontWeight: isActive ? 500 : 400,
})

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function LoginGuard() {
  const { usuario, loading } = useAuth()
  if (loading) return null
  if (usuario) return <Navigate to="/" />
  return <Login />
}
