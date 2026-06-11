import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await login(email, password)
    if (err) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  async function handleGoogle() {
    setLoadingGoogle(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    })
    if (error) {
      setError('Error al conectar con Google')
      setLoadingGoogle(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7f4' }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #e0ddd4', padding: '2.5rem 2rem', width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🍟</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#1a1a1a' }}>IC VCP</div>
          <div style={{ fontSize: 13, color: '#73726c', marginTop: 4 }}>McDonald's Villa Carlos Paz</div>
        </div>

        {/* Botón Google */}
        <button
          onClick={handleGoogle}
          disabled={loadingGoogle}
          style={{
            width: '100%', padding: '10px', background: '#fff',
            border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14,
            fontWeight: 500, cursor: loadingGoogle ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, marginBottom: '1.25rem',
            opacity: loadingGoogle ? 0.7 : 1, color: '#1a1a1a'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.6-4.7l-6.3-5.2C29.4 35.6 26.8 36.5 24 36.5c-5.2 0-9.6-3-11.3-7.2l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.9 6l6.3 5.2C40.5 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {loadingGoogle ? 'Conectando...' : 'Ingresar con Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '0.5px', background: '#e0ddd4' }} />
          <span style={{ fontSize: 12, color: '#aaa' }}>o con email</span>
          <div style={{ flex: 1, height: '0.5px', background: '#e0ddd4' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 12, color: '#73726c', display: 'block', marginBottom: 5 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              style={{ width: '100%', padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 12, color: '#73726c', display: 'block', marginBottom: 5 }}>Contraseña</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required
              style={{ width: '100%', padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          {error && (
            <div style={{ background: '#FCEBEB', color: '#501313', fontSize: 13, padding: '8px 12px', borderRadius: 8, marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#DA291C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
