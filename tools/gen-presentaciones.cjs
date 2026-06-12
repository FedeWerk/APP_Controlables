// Genera las 2 presentaciones en docs/ — uso: node tools/gen-presentaciones.cjs
const pptxgen = require('pptxgenjs')
const path = require('path')

const ROJO = 'DA291C', ROJO_OSC = 'B81F14', DORADO = 'FFC72C', CARBON = '27251F'
const GRIS = '6B6861', BLANCO = 'FFFFFF', PANEL = 'F7F5F1', BORDE = 'E5E1DA'
const VERDE = '2E7D32'
const W = 10, H = 5.625

const sombra = () => ({ type: 'outer', color: '000000', blur: 8, offset: 2, angle: 135, opacity: 0.12 })

function tituloSlide(slide, texto, sub) {
  slide.addText(texto, { x: 0.5, y: 0.32, w: 9, h: 0.62, fontSize: 30, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0 })
  if (sub) slide.addText(sub, { x: 0.5, y: 0.92, w: 9, h: 0.34, fontSize: 13, color: GRIS, fontFace: 'Calibri', margin: 0 })
}

function emojiCirculo(pres, slide, emoji, x, y, d, fill) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill } })
  slide.addText(emoji, { x, y: y - 0.02, w: d, h: d, fontSize: d * 36, align: 'center', valign: 'middle', margin: 0 })
}

function card(pres, slide, { x, y, w, h, emoji, emojiFill, titulo, texto, grande }) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: BLANCO }, line: { color: BORDE, width: 1 }, rectRadius: 0.07, shadow: sombra() })
  let ty = y + 0.18
  if (emoji) { emojiCirculo(pres, slide, emoji, x + 0.22, ty, 0.5, emojiFill || PANEL); }
  if (grande) {
    slide.addText(grande, { x: x + 0.85, y: y + 0.12, w: w - 1.0, h: 0.6, fontSize: 26, bold: true, color: ROJO, fontFace: 'Trebuchet MS', margin: 0, valign: 'middle' })
  } else if (titulo) {
    slide.addText(titulo, { x: x + 0.85, y: y + 0.14, w: w - 1.0, h: 0.56, fontSize: 14.5, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0, valign: 'middle' })
  }
  if (texto) slide.addText(texto, { x: x + 0.25, y: y + 0.78, w: w - 0.5, h: h - 0.95, fontSize: 11.5, color: GRIS, fontFace: 'Calibri', margin: 0, valign: 'top' })
}

// ============================================================
// DECK 1 — FRANQUICIA
// ============================================================
function deckFranquicia() {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9'
  pres.author = 'Federico Werkmeister'
  pres.title = 'IC VCP — Gamificación del Índice de Controlables'

  // ---- S1: Portada (oscura)
  let s = pres.addSlide()
  s.background = { color: CARBON }
  emojiCirculo(pres, s, '🍟', 4.55, 0.85, 0.9, ROJO)
  s.addText('IC VCP', { x: 0.5, y: 1.95, w: 9, h: 0.95, fontSize: 60, bold: true, color: BLANCO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('Gamificación del Índice de Controlables', { x: 0.5, y: 2.95, w: 9, h: 0.5, fontSize: 22, color: DORADO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('McDonald’s Villa Carlos Paz  ·  Propuesta de implementación', { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 13, color: 'BDB9B0', align: 'center', fontFace: 'Calibri', margin: 0 })

  // ---- S2: El desafío
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'El desafío', 'Los controlables se definen en gerencia, pero se ganan o se pierden en el piso')
  const desafios = [
    ['🎯', 'El crew no ve el impacto', 'Quien opera la cocina no tiene visibilidad de cómo su turno afecta el desperdicio, el MFY o el stat.'],
    ['📉', 'El incentivo llega tarde', 'Los resultados del IC se conocen a fin de mes, cuando ya no se puede corregir el comportamiento diario.'],
    ['🗂️', 'Datos dispersos', 'La trazabilidad por turno y por persona se pierde entre planillas, fotos y mensajes.'],
  ]
  desafios.forEach((d, i) => card(pres, s, { x: 0.5 + i * 3.1, y: 1.55, w: 2.9, h: 2.55, emoji: d[0], emojiFill: PANEL, titulo: d[1], texto: d[2] }))
  s.addText([
    { text: 'La oportunidad: ', options: { bold: true, color: ROJO } },
    { text: 'convertir los objetivos del P&L en un juego diario que el equipo quiera ganar.', options: { color: CARBON } },
  ], { x: 0.5, y: 4.45, w: 9, h: 0.5, fontSize: 15, fontFace: 'Trebuchet MS', align: 'center', margin: 0 })

  // ---- S3: La solución
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'La solución', 'Una app instalable (PWA) que convierte el IC en competencia — sin tiendas de apps, en el celular de cada empleado')
  const sol = [
    ['📊', 'Medir cada turno', 'El manager carga venta, desperdicio, MFY y stat en 2 minutos. La app calcula los % contra objetivo al instante.'],
    ['🏆', 'Competir en equipo', 'Cada resultado en objetivo suma puntos que se reparten automáticamente entre quienes trabajaron ese turno.'],
    ['📈', 'Decidir con datos', 'La gerencia obtiene evolución diaria, resumen mensual y exportación a Excel y PDF para la franquicia.'],
  ]
  sol.forEach((d, i) => card(pres, s, { x: 0.5 + i * 3.1, y: 1.55, w: 2.9, h: 2.7, emoji: d[0], emojiFill: 'FDEAE8', titulo: d[1], texto: d[2] }))
  s.addText('app-controlables.vercel.app', { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 14, bold: true, color: ROJO, align: 'center', fontFace: 'Consolas', margin: 0 })

  // ---- S4: Cómo funciona (flujo)
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Cómo funciona', 'Un circuito cerrado: del piso al reporte sin pasos manuales intermedios')
  const pasos = [
    ['1', 'El manager carga el turno', 'Venta, completo, incompleto, MFY y stat del día. Validación inmediata contra objetivos.'],
    ['2', 'El motor calcula', 'Puntos base × multiplicador de franja × fin de semana × factor de equidad por persona.'],
    ['3', 'El crew suma', 'Los puntos se asignan según el horario real de Orquest y aparecen al instante en el ranking.'],
    ['4', 'La gerencia reporta', 'Evolución diaria, resumen mensual e indicadores Food/Paper Otros, exportables.'],
  ]
  pasos.forEach((d, i) => {
    const x = 0.42 + i * 2.42
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 2.18, h: 2.75, fill: { color: BLANCO }, line: { color: BORDE, width: 1 }, rectRadius: 0.07, shadow: sombra() })
    s.addShape(pres.shapes.OVAL, { x: x + 0.18, y: 1.9, w: 0.52, h: 0.52, fill: { color: ROJO } })
    s.addText(d[0], { x: x + 0.18, y: 1.9, w: 0.52, h: 0.52, fontSize: 20, bold: true, color: BLANCO, align: 'center', valign: 'middle', margin: 0 })
    s.addText(d[1], { x: x + 0.18, y: 2.55, w: 1.85, h: 0.62, fontSize: 13, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0 })
    s.addText(d[2], { x: x + 0.18, y: 3.2, w: 1.85, h: 1.1, fontSize: 10.5, color: GRIS, fontFace: 'Calibri', margin: 0 })
    if (i < 3) s.addText('→', { x: x + 2.13, y: 2.7, w: 0.36, h: 0.5, fontSize: 22, bold: true, color: DORADO, align: 'center', margin: 0 })
  })
  s.addText('Automatizado: el horario semanal se activa solo cada lunes y el sistema alerta el viernes si falta subir el de la semana siguiente.',
    { x: 0.5, y: 4.7, w: 9, h: 0.4, fontSize: 11.5, italic: true, color: GRIS, align: 'center', fontFace: 'Calibri', margin: 0 })

  // ---- S5: Incentivo alineado al P&L
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Un incentivo alineado al P&L', 'Los puntos premian exactamente los objetivos del Índice de Controlables')
  const filas = [
    [{ text: 'Indicador', options: { bold: true, color: BLANCO, fill: { color: ROJO } } }, { text: 'Objetivo', options: { bold: true, color: BLANCO, fill: { color: ROJO } } }, { text: 'Premio', options: { bold: true, color: BLANCO, fill: { color: ROJO } } }],
    ['Completo', '≤ 0,10% de la venta del turno', '+10 pts (+20 si es $0)'],
    ['Incompleto', '≤ 0,44% de la venta del turno', '+10 pts (+20 si es $0)'],
    ['MFY', 'entre 35″ y 50″', '+10 pts'],
    ['Stat diario', '± 0,10% de la venta del día', '+8 pts a todo el día'],
    ['Food / Paper Otros', '≤ 0,84% / ≤ 0,74% mensual', 'Seguimiento en reportes'],
  ]
  s.addTable(filas, { x: 0.5, y: 1.55, w: 5.6, colW: [1.55, 2.45, 1.6], fontSize: 11, fontFace: 'Calibri', color: CARBON, border: { pt: 0.75, color: BORDE }, fill: { color: BLANCO }, rowH: 0.42, valign: 'middle', margin: 0.06 })
  card(pres, s, { x: 6.4, y: 1.55, w: 3.1, h: 1.45, emoji: '⏰', emojiFill: 'FFF4D6', titulo: 'Picos valen doble', texto: 'Almuerzo y cena x2, open x1.5 y fin de semana x2 adicional: el esfuerzo va donde está la venta.' })
  card(pres, s, { x: 6.4, y: 3.2, w: 3.1, h: 1.45, emoji: '⚖️', emojiFill: 'EAF3DE', titulo: 'Equidad real', texto: 'Factor x1.25 para quienes tienen 12–15 hs semanales: la competencia no la define la cantidad de horas.' })

  // ---- S6: Ventajas para el negocio
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Ventajas para el negocio')
  const ventajas = [
    ['💰', 'Foco directo en rentabilidad', 'Cada punto premia una decisión que reduce desperdicio o protege la venta.'],
    ['📅', 'Trazabilidad diaria', 'Resultados por turno, por día y por persona, con historial permanente.'],
    ['📄', 'Reportes para la franquicia', 'Resumen mensual exportable a Excel y PDF en dos clics.'],
    ['🆓', 'Costo de infraestructura $0', 'Vercel + Supabase en planes gratuitos. Sin licencias ni servidores.'],
    ['🔐', 'Seguridad por roles', 'Crew, entrenador, manager y gerente ven solo lo que les corresponde (RLS en base de datos).'],
    ['⚙️', 'Sin carga administrativa', 'Horarios desde el PDF de Orquest, activación automática y alertas programadas.'],
  ]
  ventajas.forEach((d, i) => {
    const x = 0.5 + (i % 3) * 3.1, y = 1.45 + Math.floor(i / 3) * 1.85
    card(pres, s, { x, y, w: 2.9, h: 1.7, emoji: d[0], emojiFill: PANEL, titulo: d[1], texto: d[2] })
  })

  // ---- S7: Control y transparencia
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Control y transparencia', 'Gamificar no es relajar el control: el sistema penaliza lo que daña la operación')
  const controles = [
    ['🚫', 'Anti-adulteración de MFY', 'Un MFY por debajo de 35″ no suma: resta 10 puntos. Inflar tiempos para “ganar” sale caro.'],
    ['⚠️', 'Penalizaciones del gerente', 'Vencimientos secundarios e incumplimientos de procedimiento restan puntos al turno, con detalle registrado.'],
    ['🔒', 'Historial inmutable', 'Cada punto asignado queda en la base con fecha, turno y factor aplicado. El ranking siempre es auditable.'],
  ]
  controles.forEach((d, i) => {
    const y = 1.5 + i * 1.08
    emojiCirculo(pres, s, d[0], 0.6, y, 0.55, 'FDEAE8')
    s.addText(d[1], { x: 1.35, y: y - 0.02, w: 7.9, h: 0.32, fontSize: 14, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0 })
    s.addText(d[2], { x: 1.35, y: y + 0.3, w: 7.9, h: 0.55, fontSize: 11.5, color: GRIS, fontFace: 'Calibri', margin: 0 })
  })
  s.addText([
    { text: 'Privacidad: ', options: { bold: true, color: CARBON } },
    { text: 'el PDF de horarios se procesa en el navegador y nunca se almacena.', options: { color: GRIS } },
  ], { x: 0.6, y: 4.78, w: 8.8, h: 0.35, fontSize: 11.5, fontFace: 'Calibri', margin: 0 })

  // ---- S8: Costo y puesta en marcha
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Puesta en marcha', 'La implementación ya está operativa y lista para el testeo con el equipo')
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1.6, w: 3.4, h: 3.3, fill: { color: CARBON }, rectRadius: 0.07 })
  s.addText('$0', { x: 0.5, y: 2.05, w: 3.4, h: 1.2, fontSize: 64, bold: true, color: DORADO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('de costo mensual de infraestructura', { x: 0.7, y: 3.35, w: 3.0, h: 0.7, fontSize: 14, color: BLANCO, align: 'center', fontFace: 'Calibri', margin: 0 })
  const items = [
    ['✅', '84 usuarios ya cargados con sus roles'],
    ['✅', 'App instalable en cualquier celular, sin tiendas de apps'],
    ['✅', 'Login con Google corporativo o email y contraseña'],
    ['✅', 'Seguridad de datos activa (políticas por rol en la base)'],
    ['✅', 'Crons automáticos: activación de horarios y alertas'],
    ['🗓️', 'Siguiente paso: piloto con usuarios reales y ajuste de objetivos'],
  ]
  items.forEach((d, i) => {
    const y = 1.62 + i * 0.55
    s.addText(d[0], { x: 4.35, y, w: 0.42, h: 0.42, fontSize: 16, margin: 0, valign: 'middle' })
    s.addText(d[1], { x: 4.85, y, w: 4.7, h: 0.42, fontSize: 13, color: CARBON, fontFace: 'Calibri', margin: 0, valign: 'middle' })
  })

  // ---- S9: Cierre (oscura)
  s = pres.addSlide()
  s.background = { color: CARBON }
  s.addText('Los controlables se ganan en el piso.', { x: 0.5, y: 1.5, w: 9, h: 0.6, fontSize: 28, bold: true, color: BLANCO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('IC VCP pone a todo el equipo a jugar el mismo partido que el P&L.', { x: 0.5, y: 2.15, w: 9, h: 0.5, fontSize: 18, color: DORADO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  const roadmap = ['Badges y logros', 'Notificaciones push', 'Historial personal por empleado']
  roadmap.forEach((t, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.05 + i * 2.75, y: 3.1, w: 2.45, h: 0.55, fill: { color: '3A372F' }, rectRadius: 0.27 })
    s.addText(t, { x: 1.05 + i * 2.75, y: 3.1, w: 2.45, h: 0.55, fontSize: 12.5, color: BLANCO, align: 'center', valign: 'middle', fontFace: 'Calibri', margin: 0 })
  })
  s.addText('Próximas evoluciones del sistema', { x: 0.5, y: 3.78, w: 9, h: 0.35, fontSize: 11, italic: true, color: 'BDB9B0', align: 'center', fontFace: 'Calibri', margin: 0 })
  s.addText('Federico Werkmeister · Gerente · McDonald’s Villa Carlos Paz', { x: 0.5, y: 4.7, w: 9, h: 0.4, fontSize: 12, color: 'BDB9B0', align: 'center', fontFace: 'Calibri', margin: 0 })

  return pres.writeFile({ fileName: path.join(__dirname, '..', 'docs', 'IC_VCP_Presentacion_Franquicia.pptx') })
}

// ============================================================
// DECK 2 — EQUIPO
// ============================================================
function deckEquipo() {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9'
  pres.author = 'Federico Werkmeister'
  pres.title = 'IC VCP — ¡Sumá puntos en cada turno!'

  // ---- S1: Portada (roja)
  let s = pres.addSlide()
  s.background = { color: ROJO }
  s.addText('🍟', { x: 4.25, y: 0.7, w: 1.5, h: 1.1, fontSize: 60, align: 'center', margin: 0 })
  s.addText('¡Tus turnos ahora suman puntos!', { x: 0.5, y: 1.95, w: 9, h: 0.85, fontSize: 40, bold: true, color: BLANCO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('Llega IC VCP: la competencia oficial del local', { x: 0.5, y: 2.9, w: 9, h: 0.5, fontSize: 20, color: DORADO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('McDonald’s Villa Carlos Paz', { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 13, color: 'FFD9D5', align: 'center', fontFace: 'Calibri', margin: 0 })

  // ---- S2: ¿De qué se trata?
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, '¿De qué se trata?', 'Tu trabajo de siempre, pero ahora cada turno bien jugado suma puntos')
  s.addText([
    { text: 'Cada turno que trabajás, el local mide cuatro cosas: ', options: { color: CARBON } },
    { text: 'el desperdicio completo, el incompleto, el tiempo de MFY y el stat del día', options: { bold: true, color: CARBON } },
    { text: '. Si el turno las hace bien, todos los que estuvieron en ese turno suman puntos.', options: { color: CARBON } },
  ], { x: 0.5, y: 1.55, w: 5.4, h: 1.5, fontSize: 15, fontFace: 'Calibri', margin: 0 })
  s.addText([
    { text: 'No tenés que cargar nada', options: { bold: true, color: ROJO } },
    { text: ': el manager carga los resultados y tus puntos aparecen solos en el ranking, según tu horario de Orquest.', options: { color: CARBON } },
  ], { x: 0.5, y: 3.1, w: 5.4, h: 1.3, fontSize: 15, fontFace: 'Calibri', margin: 0 })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.3, y: 1.55, w: 3.2, h: 3.3, fill: { color: PANEL }, line: { color: BORDE, width: 1 }, rectRadius: 0.07 })
  ;['🥇  Ranking semanal', '🏅  Ranking mensual', '⚔️  Turnos vs. turnos', '🧑‍🍳  Crew y entrenadores'].forEach((t, i) => {
    s.addText(t, { x: 6.55, y: 1.8 + i * 0.72, w: 2.8, h: 0.5, fontSize: 14, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0, valign: 'middle' })
  })

  // ---- S3: Cómo sumás
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Cómo se suman puntos', 'Premia jugar limpio y cuidar el producto — quien incumple, resta')
  const pts = [
    ['+10', 'Desperdicio en objetivo', 'Completo ≤ 0,10% o incompleto ≤ 0,44% de la venta del turno.'],
    ['+20', 'Cero absoluto', 'Turno con completo o incompleto en $0: el doble de puntos.'],
    ['+10', 'MFY entre 35″ y 50″', 'Tiempo real y dentro de objetivo.'],
    ['+8', 'Stat del día OK', 'Si el día cierra dentro de ±0,10%, suman todos los que trabajaron.'],
  ]
  pts.forEach((d, i) => {
    const x = 0.5 + (i % 2) * 4.65, y = 1.5 + Math.floor(i / 2) * 1.45
    card(pres, s, { x, y, w: 4.45, h: 1.3, grande: d[0], titulo: null, texto: null })
    s.addText(d[1], { x: x + 1.75, y: y + 0.15, w: 2.6, h: 0.4, fontSize: 13.5, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0 })
    s.addText(d[2], { x: x + 1.75, y: y + 0.55, w: 2.6, h: 0.65, fontSize: 10.5, color: GRIS, fontFace: 'Calibri', margin: 0 })
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.62, fill: { color: 'FDEAE8' }, rectRadius: 0.07 })
  s.addText([
    { text: '−10  ', options: { bold: true, color: ROJO_OSC, fontSize: 15 } },
    { text: 'MFY menor a 35″ (adulterado), vencimientos secundarios u otro incumplimiento.', options: { color: '6B1F1A', fontSize: 12 } },
  ], { x: 0.75, y: 4.5, w: 8.5, h: 0.62, fontFace: 'Calibri', margin: 0, valign: 'middle' })

  // ---- S4: Multiplicadores
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'No todos los turnos valen lo mismo', 'Los picos de venta multiplican tus puntos')
  const mults = [['🌅', 'Desayuno', 'x1.0'], ['☀️', 'Almuerzo', 'x2.0'], ['🌤️', 'Merienda', 'x1.0'], ['🌙', 'Cena', 'x2.0'], ['🌃', 'Open', 'x1.5']]
  mults.forEach((d, i) => {
    const x = 0.55 + i * 1.85
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 1.65, h: 1.85, fill: { color: BLANCO }, line: { color: BORDE, width: 1 }, rectRadius: 0.07, shadow: sombra() })
    s.addText(d[0], { x, y: 1.72, w: 1.65, h: 0.5, fontSize: 24, align: 'center', margin: 0 })
    s.addText(d[1], { x, y: 2.26, w: 1.65, h: 0.34, fontSize: 12, bold: true, color: CARBON, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
    s.addText(d[2], { x, y: 2.6, w: 1.65, h: 0.66, fontSize: 26, bold: true, color: d[2] === 'x1.0' ? GRIS : ROJO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  })
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y: 3.75, w: 9.05, h: 1.3, fill: { color: 'FFF4D6' }, rectRadius: 0.07 })
  s.addText([
    { text: '🔥 Fin de semana: x2 adicional.  ', options: { bold: true, color: CARBON, fontSize: 16 } },
    { text: 'Cena de sábado = x2 × x2 = ', options: { color: CARBON, fontSize: 15 } },
    { text: '¡x4 tus puntos!', options: { bold: true, color: ROJO, fontSize: 18 } },
  ], { x: 0.85, y: 3.75, w: 8.5, h: 1.3, fontFace: 'Trebuchet MS', margin: 0, valign: 'middle' })

  // ---- S5: Es justo
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'La cancha está nivelada', 'El sistema está pensado para que cualquiera pueda ganar')
  const justo = [
    ['⚖️', '¿Pocas horas? Tenés ventaja', 'Si trabajás entre 12 y 15 horas semanales, tus puntos de turno se multiplican x1.25.'],
    ['🤝', 'Suma el turno, no el individuo', 'Los puntos se reparten entre todos los que estuvieron: cuidar los controlables es trabajo de equipo.'],
    ['🧑‍🏫', 'Entrenadores incluidos', 'Compiten en el mismo ranking que el crew, identificados con su etiqueta verde.'],
  ]
  justo.forEach((d, i) => {
    const y = 1.55 + i * 1.12
    emojiCirculo(pres, s, d[0], 0.6, y, 0.55, 'EAF3DE')
    s.addText(d[1], { x: 1.35, y: y - 0.02, w: 8, h: 0.34, fontSize: 15, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0 })
    s.addText(d[2], { x: 1.35, y: y + 0.32, w: 8, h: 0.6, fontSize: 12.5, color: GRIS, fontFace: 'Calibri', margin: 0 })
  })

  // ---- S6: Empezá hoy
  s = pres.addSlide()
  s.background = { color: BLANCO }
  tituloSlide(s, 'Empezá hoy: 3 pasos', 'En dos minutos ya estás participando')
  const arranque = [
    ['1', 'Entrá', 'Abrí app-controlables.vercel.app en tu celular e ingresá con tu cuenta de Google (la que le diste al gerente).'],
    ['2', 'Instalala', 'Desde el menú del navegador: “Agregar a pantalla de inicio”. Queda como una app más.'],
    ['3', 'Jugá', 'Mirá el ranking, defendé tu turno y sumá puntos en cada franja que trabajes.'],
  ]
  arranque.forEach((d, i) => {
    const x = 0.5 + i * 3.1
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 2.9, h: 2.6, fill: { color: BLANCO }, line: { color: BORDE, width: 1 }, rectRadius: 0.07, shadow: sombra() })
    s.addShape(pres.shapes.OVAL, { x: x + 0.22, y: 1.82, w: 0.6, h: 0.6, fill: { color: ROJO } })
    s.addText(d[0], { x: x + 0.22, y: 1.82, w: 0.6, h: 0.6, fontSize: 24, bold: true, color: BLANCO, align: 'center', valign: 'middle', margin: 0 })
    s.addText(d[1], { x: x + 1.0, y: 1.88, w: 1.75, h: 0.5, fontSize: 17, bold: true, color: CARBON, fontFace: 'Trebuchet MS', margin: 0, valign: 'middle' })
    s.addText(d[2], { x: x + 0.25, y: 2.6, w: 2.4, h: 1.45, fontSize: 11.5, color: GRIS, fontFace: 'Calibri', margin: 0 })
  })
  s.addText([
    { text: '¿No te deja entrar? ', options: { bold: true, color: ROJO } },
    { text: 'Avisale al gerente para que verifique tu email en el sistema.', options: { color: GRIS } },
  ], { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 12.5, align: 'center', fontFace: 'Calibri', margin: 0 })

  // ---- S7: Cierre (rojo)
  s = pres.addSlide()
  s.background = { color: ROJO }
  s.addText('El IC lo ganamos entre todos.', { x: 0.5, y: 1.7, w: 9, h: 0.8, fontSize: 38, bold: true, color: BLANCO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('Cada turno cuenta. Cada punto también.', { x: 0.5, y: 2.6, w: 9, h: 0.5, fontSize: 20, color: DORADO, align: 'center', fontFace: 'Trebuchet MS', margin: 0 })
  s.addText('Y esto recién empieza: pronto, badges, logros y notificaciones 👀', { x: 0.5, y: 3.55, w: 9, h: 0.45, fontSize: 14, italic: true, color: 'FFD9D5', align: 'center', fontFace: 'Calibri', margin: 0 })
  s.addText('app-controlables.vercel.app', { x: 0.5, y: 4.5, w: 9, h: 0.45, fontSize: 16, bold: true, color: BLANCO, align: 'center', fontFace: 'Consolas', margin: 0 })

  return pres.writeFile({ fileName: path.join(__dirname, '..', 'docs', 'IC_VCP_Presentacion_Equipo.pptx') })
}

Promise.all([deckFranquicia(), deckEquipo()]).then(() => {
  console.log('✓ docs/IC_VCP_Presentacion_Franquicia.pptx')
  console.log('✓ docs/IC_VCP_Presentacion_Equipo.pptx')
})
