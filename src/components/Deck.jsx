import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './deck.css'

// Visor de presentaciones: flechas del teclado, swipe en mobile,
// botones en pantalla y ✕ para volver a la app.
export default function Deck({ slides }) {
  const [i, setI] = useState(0)
  const navigate = useNavigate()
  const x0 = useRef(null)

  function mostrar(n) {
    setI(Math.max(0, Math.min(slides.length - 1, n)))
  }

  useEffect(() => {
    function onKey(e) {
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); setI(v => Math.min(slides.length - 1, v + 1)) }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); setI(v => Math.max(0, v - 1)) }
      if (e.key === 'Home') setI(0)
      if (e.key === 'End') setI(slides.length - 1)
      if (e.key === 'Escape') navigate('/presentaciones')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [slides.length, navigate])

  return (
    <div className="deck"
      onTouchStart={e => { x0.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (x0.current === null) return
        const dx = e.changedTouches[0].clientX - x0.current
        if (Math.abs(dx) > 50) mostrar(dx < 0 ? i + 1 : i - 1)
        x0.current = null
      }}>
      {slides.map((s, j) => (
        <section key={j} className={`deck-slide ${s.tipo ?? ''} ${j === i ? 'activa' : ''}`}>
          {s.contenido}
        </section>
      ))}
      <button className="deck-salir" onClick={() => navigate('/presentaciones')} aria-label="Salir">✕</button>
      <div className="deck-contador">{i + 1} / {slides.length}</div>
      <div className="deck-nav">
        <button onClick={() => mostrar(i - 1)} aria-label="Anterior">‹</button>
        <button onClick={() => mostrar(i + 1)} aria-label="Siguiente">›</button>
      </div>
    </div>
  )
}
