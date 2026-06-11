import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Procesando...')

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setStatus('Evento: ' + event)
      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => navigate('/', { replace: true }), 500)
      } else if (event === 'SIGNED_OUT' || !session) {
        setTimeout(() => navigate('/login', { replace: true }), 2000)
      }
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7f4' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🍟</div>
        <div style={{ fontSize: 14, color: '#1a1a1a', marginBottom: 8 }}>Verificando sesión...</div>
        <div style={{ fontSize: 12, color: '#73726c' }}>{status}</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 8, wordBreak: 'break-all', maxWidth: 400 }}>
          URL: {window.location.href.substring(0, 100)}
        </div>
      </div>
    </div>
  )
}