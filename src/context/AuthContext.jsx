import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [alertas, setAlertas]   = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) cargarUsuario(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) cargarUsuario(session.user.id)
      else { setUsuario(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function cargarUsuario(uid) {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', uid)
      .single()
    setUsuario(data)
    setLoading(false)
    if (data?.rol === 'gerente') cargarAlertas()
  }

  async function cargarAlertas() {
    const { data } = await supabase
      .from('alertas')
      .select('*')
      .eq('resuelta', false)
      .order('created_at', { ascending: false })
    setAlertas(data || [])
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const puedeCargarTurno  = ['gerente', 'manager', 'entrenador'].includes(usuario?.rol)
  const puedeAplicarPenal = usuario?.rol === 'gerente'
  const puedeVerReportes  = usuario?.rol === 'gerente'
  const puedeSubirPDF     = usuario?.rol === 'gerente'

  return (
    <AuthContext.Provider value={{ usuario, loading, alertas, login, logout, puedeCargarTurno, puedeAplicarPenal, puedeVerReportes, puedeSubirPDF }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
