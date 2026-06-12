// Genera los manuales de usuario en docs/ — uso: node tools/gen-manuales.cjs
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, Header, Footer, PageNumber, PageBreak,
} = require('docx')

const ROJO = 'DA291C'
const GRIS = '73726C'
const A4 = { width: 11906, height: 16838 }
const MARGEN = 1440
const ANCHO = A4.width - MARGEN * 2 // 9026

// ---------- helpers ----------
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] })
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] })
const p = (...runs) => new Paragraph({
  spacing: { after: 120 },
  children: runs.map(r => typeof r === 'string' ? new TextRun(r) : new TextRun(r)),
})
const bullet = (...runs) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 },
  children: runs.map(r => typeof r === 'string' ? new TextRun(r) : new TextRun(r)),
})
const paso = (...runs) => new Paragraph({
  numbering: { reference: 'pasos', level: 0 }, spacing: { after: 60 },
  children: runs.map(r => typeof r === 'string' ? new TextRun(r) : new TextRun(r)),
})
const nota = (t) => new Paragraph({
  spacing: { after: 120 }, indent: { left: 360 },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: ROJO, space: 8 } },
  children: [new TextRun({ text: '💡 ', size: 22 }), new TextRun({ text: t, italics: true, color: '444444' })],
})
const salto = () => new Paragraph({ children: [new PageBreak()] })

const bordes = (() => {
  const b = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  return { top: b, bottom: b, left: b, right: b }
})()

function tabla(headers, filas, anchos) {
  const total = anchos.reduce((a, b) => a + b, 0)
  const celda = (texto, esHeader, ancho) => new TableCell({
    borders: bordes, width: { size: ancho, type: WidthType.DXA },
    shading: esHeader ? { fill: 'FBEAE8', type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: texto, bold: esHeader, size: 21 })] })],
  })
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: anchos,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((t, i) => celda(t, true, anchos[i])) }),
      ...filas.map(f => new TableRow({ children: f.map((t, i) => celda(String(t), false, anchos[i])) })),
    ],
  })
}

function portada(titulo, subtitulo) {
  return [
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'IC VCP', size: 72, bold: true, color: ROJO })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 240 },
      children: [new TextRun({ text: 'Índice de Controlables — McDonald’s Villa Carlos Paz', size: 26, color: GRIS })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 1200 },
      children: [new TextRun({ text: titulo, size: 44, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 240 },
      children: [new TextRun({ text: subtitulo, size: 26, color: GRIS })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 2400 },
      children: [new TextRun({ text: 'app-controlables.vercel.app', size: 24, color: ROJO })],
    }),
    salto(),
  ]
}

function crearDoc(titulo, children) {
  return new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: ROJO },
          paragraph: { spacing: { before: 320, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial' },
          paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'pasos', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'pasos2', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: 'pasos3', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ],
    },
    sections: [{
      properties: { page: { size: A4, margin: { top: MARGEN, right: MARGEN, bottom: MARGEN, left: MARGEN } } },
      headers: { default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 4 } },
        children: [new TextRun({ text: titulo, size: 18, color: GRIS })],
      })] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Página ', size: 18, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRIS })],
      })] }) },
      children,
    }],
  })
}

// =====================================================
// MANUAL 1 — CREW Y ENTRENADORES
// =====================================================
const manualCrew = crearDoc('IC VCP — Manual para Crew y Entrenadores', [
  ...portada('Manual para Crew y Entrenadores', 'Cómo entrar, ver tu ranking y sumar puntos'),

  h1('¿Qué es IC VCP?'),
  p('Es la app del local donde ', { text: 'sumás puntos por cuidar los controlables', bold: true },
    ' en cada turno que trabajás: el desperdicio (completo e incompleto), el tiempo de MFY y el stat del día. Cuanto mejor le va al turno, más puntos sumás vos. Los puntos se ven en un ranking que compite por semana y por mes.'),

  h1('Cómo entrar por primera vez'),
  paso('Abrí ', { text: 'app-controlables.vercel.app', bold: true }, ' en el navegador de tu celular.'),
  paso('Tocá ', { text: 'Ingresar con Google', bold: true }, ' y elegí tu cuenta de Gmail (la misma que le diste al gerente).'),
  paso('Listo: entrás directo al ranking.'),
  nota('También podés entrar con email y contraseña. Si el gerente te creó el usuario, la contraseña inicial es McVCP2025! — cambiala apenas puedas.'),
  h2('Instalala como app'),
  p('Para tenerla como una app más del teléfono (sin abrir el navegador):'),
  bullet({ text: 'Android (Chrome): ', bold: true }, 'menú ⋮ → “Agregar a pantalla principal” / “Instalar app”.'),
  bullet({ text: 'iPhone (Safari): ', bold: true }, 'botón compartir → “Agregar a pantalla de inicio”.'),

  h1('El ranking'),
  p('Es la pantalla principal. Tiene dos vistas:'),
  bullet({ text: 'Empleados: ', bold: true }, 'el ranking individual. Tu fila aparece marcada con la etiqueta “vos”. Los entrenadores compiten junto al crew y se identifican con su etiqueta verde.'),
  bullet({ text: 'Turnos: ', bold: true }, 'la competencia entre franjas (desayuno, almuerzo, merienda, cena y open).'),
  p('Arriba a la derecha podés cambiar el período: ', { text: 'esta semana', bold: true }, ' o ', { text: 'este mes', bold: true }, '.'),

  h1('Cómo se ganan (y se pierden) puntos'),
  p('Cuando el manager carga los resultados del turno, los puntos se reparten automáticamente entre todos los que trabajaron ese turno según el horario de Orquest.'),
  tabla(['Resultado del turno', 'Puntos'], [
    ['Completo dentro del objetivo (≤ 0,10% de la venta)', '+10'],
    ['Completo en $0 — cero absoluto', '+20'],
    ['Incompleto dentro del objetivo (≤ 0,44% de la venta)', '+10'],
    ['Incompleto en $0 — cero absoluto', '+20'],
    ['MFY entre 35″ y 50″', '+10'],
    ['MFY menor a 35″ (se considera adulteración)', '−10'],
    ['Stat del día dentro de ±0,10% (para todos los que trabajaron ese día)', '+8'],
    ['Penalización aplicada por el gerente (MFY adulterado, vencimientos, otro incumplimiento)', '−10 c/u'],
  ], [6800, 2226]),

  h2('Multiplicadores: no todos los turnos valen lo mismo'),
  p('Los puntos del turno se multiplican según la franja y el día:'),
  tabla(['Franja', 'Multiplicador'], [
    ['Desayuno (06–11)', 'x1.0'],
    ['Almuerzo (11–16)', 'x2.0'],
    ['Merienda (16–20)', 'x1.0'],
    ['Cena (20–01)', 'x2.0'],
    ['Open (01–06)', 'x1.5'],
    ['Fin de semana (sábado y domingo)', 'x2.0 adicional'],
  ], [6800, 2226]),
  nota('Ejemplo: una cena de sábado vale x2.0 por franja y x2.0 por fin de semana = los puntos del turno multiplicados x4.'),

  h2('Factor de equidad'),
  p('Para que la competencia sea pareja entre quienes trabajan pocas y muchas horas, si tenés ', { text: 'entre 12 y 15 horas semanales', bold: true }, ' tus puntos de turno se multiplican x1.25. Con 16 horas o más (o menos de 12), el factor es neutro (x1.0).'),

  h2('¿A qué turno pertenezco?'),
  p('Al turno donde hacés la mayor parte de tus horas (80% o más). Si tu horario cruza varias franjas sin llegar a ese 80%, los puntos se reparten proporcionalmente entre las franjas que cubrís.'),

  h1('Solo para entrenadores'),
  p('Además de competir en el ranking, los entrenadores pueden ', { text: 'cargar los resultados del turno', bold: true },
    ' desde el menú “Cargar turno”. El paso a paso está en el Manual de Gestión — pedíselo al gerente.'),

  h1('Preguntas frecuentes'),
  h2('Entré y dice “Verificando acceso...” y no avanza'),
  p('Tu email todavía no está dado de alta en el sistema o no coincide con el que le diste al gerente. Avisale para que lo verifique (tené en cuenta que el email registrado figura en minúsculas).'),
  h2('Trabajé un turno y no veo mis puntos'),
  p('Los puntos aparecen cuando el manager carga los resultados del turno, no en el momento. Si pasó un día y siguen sin aparecer, consultá a tu manager.'),
  h2('¿Puedo ver los puntos de otros?'),
  p('Sí, el ranking es visible para todo el equipo: es parte de la dinámica de la competencia.'),
])

// =====================================================
// MANUAL 2 — MANAGERS Y GERENTE
// =====================================================
const pasoN = (ref) => (...runs) => new Paragraph({
  numbering: { reference: ref, level: 0 }, spacing: { after: 60 },
  children: runs.map(r => typeof r === 'string' ? new TextRun(r) : new TextRun(r)),
})
const paso2 = pasoN('pasos2')
const paso3 = pasoN('pasos3')

const manualGestion = crearDoc('IC VCP — Manual de Gestión (Managers y Gerente)', [
  ...portada('Manual de Gestión', 'Para managers, entrenadores que cargan turno y gerente'),

  h1('Qué hace cada rol'),
  tabla(['Rol', 'Compite / suma pts', 'Carga turno', 'Penalizaciones', 'Horarios, indicadores y reportes'], [
    ['Crew', '✓', '—', '—', '—'],
    ['Entrenador', '✓', '✓', '—', '—'],
    ['Manager', '—', '✓', '—', '—'],
    ['Gerente', '—', '✓', '✓', '✓'],
  ], [1800, 2000, 1700, 1900, 1626]),
  p('El acceso es con Google (o email y contraseña) en ', { text: 'app-controlables.vercel.app', bold: true },
    '. El menú se adapta al rol: un manager ve “Ranking” y “Cargar turno”; el gerente ve además “Horarios”, “Indicadores” y “Reportes”.'),

  h1('Cargar un turno'),
  p('Es la operación diaria más importante: con esta carga se calculan y reparten los puntos al equipo.'),
  paso('Entrá a ', { text: 'Cargar turno', bold: true }, ' y elegí fecha y franja. La app ya te muestra el multiplicador vigente (y avisa si aplica el x2 de fin de semana).'),
  paso('Cargá la ', { text: 'venta del turno', bold: true }, ' en pesos.'),
  paso('Cargá ', { text: 'Completo ($)', bold: true }, ' e ', { text: 'Incompleto ($)', bold: true },
    '. La app calcula el % sobre la venta al instante y lo pinta en verde (dentro de objetivo) o rojo (fuera). Objetivos: completo ≤ 0,10% — incompleto ≤ 0,44%.'),
  paso('Cargá el ', { text: 'MFY en segundos', bold: true }, '. Objetivo: entre 35″ y 50″. Debajo de 35″ la app lo marca como adulteración (resta puntos).'),
  paso({ text: 'Stat del día', bold: true }, ' (una sola vez por día, en cualquier turno): monto del stat (puede ser negativo) y venta total del día. Si queda dentro de ±0,10%, todos los que trabajaron ese día reciben +8.'),
  paso('Revisá el ', { text: 'crew del turno', bold: true }, ': la app lo arma sola desde el horario de Orquest de esa fecha y franja. Podés sacar con la ✕ a quien no haya venido. Si está vacío, falta subir el horario de la semana.'),
  paso('Tocá ', { text: 'Guardar y asignar puntos', bold: true }, '. Los puntos se calculan con el multiplicador y el factor de equidad de cada persona, y aparecen al instante en el ranking.'),
  nota('¿Te equivocaste? Volvé a cargar la misma fecha y franja: la nueva carga reemplaza a la anterior (y recalcula los puntos del equipo que quede en la lista).'),

  h1('Penalizaciones (solo gerente)'),
  p('En la misma pantalla de carga, el gerente puede aplicar penalizaciones de −10 puntos cada una al turno:'),
  bullet('MFY por debajo de 35″ (adulteración del tiempo).'),
  bullet('Productos fuera de vencimiento secundario.'),
  bullet('Otro incumplimiento de procedimiento (con campo de detalle).'),

  h1('Subir horarios de Orquest (solo gerente)'),
  paso2('Exportá el ', { text: 'PDF de horarios semanales', bold: true }, ' desde Orquest.'),
  paso2('En ', { text: 'Horarios', bold: true }, ', elegí la ', { text: 'semana de aplicación', bold: true }, ' (el lunes) y subí el PDF.'),
  paso2('Revisá la ', { text: 'vista previa', bold: true }, ': empleados detectados, horarios, horas semanales, turno principal y proporción si cruzan franjas.'),
  paso2('Confirmá. El horario queda guardado y ', { text: 'se activa solo el lunes a las 00:05', bold: true }, '.'),
  nota('El PDF se procesa en tu navegador y no se guarda en ningún lado (privacidad). Si llega el viernes y no subiste el horario de la semana siguiente, la app te genera una alerta automática (la ves como badge rojo arriba).'),

  h1('Indicadores mensuales (solo gerente)'),
  p('A mes cerrado, cargá en ', { text: 'Indicadores', bold: true }, ' los dos indicadores que vienen del P&L:'),
  bullet({ text: 'Food Otros: ', bold: true }, 'objetivo ≤ 0,84%.'),
  bullet({ text: 'Paper Otros: ', bold: true }, 'objetivo ≤ 0,74%.'),
  p('La app valida contra el objetivo, guarda el historial de los últimos meses y los integra al reporte mensual.'),

  h1('Reportes (solo gerente)'),
  p('La pantalla ', { text: 'Reportes', bold: true }, ' arma el resumen del mes para presentar a la franquicia:'),
  bullet({ text: 'Tarjetas de resumen: ', bold: true }, 'venta del mes, completo e incompleto (en $ y %), MFY promedio, días con stat en objetivo y Food/Paper Otros.'),
  bullet({ text: 'Evolución diaria: ', bold: true }, 'gráfico de línea por indicador (completo %, incompleto %, stat %, MFY) con la línea de objetivo marcada.'),
  bullet({ text: 'Detalle diario: ', bold: true }, 'tabla día por día con todos los valores en verde/rojo según objetivo.'),
  h2('Exportar'),
  bullet({ text: '⬇ Excel: ', bold: true }, 'descarga un CSV listo para abrir en Excel (formato argentino: separador ; y coma decimal).'),
  bullet({ text: '🖨 PDF: ', bold: true }, 'abre el diálogo de impresión del navegador; elegí “Guardar como PDF”. El layout de impresión oculta menús y deja solo el reporte.'),

  h1('Administración de usuarios'),
  bullet('Los usuarios se gestionan en Supabase (tabla usuarios): nombre, email, rol y activo.'),
  bullet({ text: 'Los emails van siempre en minúsculas', bold: true }, ' y deben coincidir con la cuenta de Google de la persona.'),
  bullet('Usuarios creados por SQL tienen contraseña inicial McVCP2025!.'),
  bullet('Si alguien ve “Verificando acceso...” al entrar, su email no está en la tabla o no coincide.'),

  h1('Automatizaciones'),
  bullet({ text: 'Lunes 00:05: ', bold: true }, 'se activa automáticamente el horario de la semana en curso.'),
  bullet({ text: 'Viernes 09:00: ', bold: true }, 'si no está subido el horario de la semana siguiente, se genera una alerta para el gerente.'),

  salto(),
  h1('Apéndice — Objetivos y puntajes de referencia'),
  h2('Objetivos de indicadores'),
  tabla(['Indicador', 'Objetivo'], [
    ['Completo', '≤ 0,10% sobre venta del turno'],
    ['Incompleto', '≤ 0,44% sobre venta del turno'],
    ['Stat', '± 0,10% sobre venta del día'],
    ['MFY', 'entre 35″ y 50″'],
    ['Food Otros (mensual)', '≤ 0,84%'],
    ['Paper Otros (mensual)', '≤ 0,74%'],
  ], [4513, 4513]),
  h2('Puntos base por turno'),
  tabla(['Condición', 'Pts'], [
    ['Completo dentro de objetivo', '+10'],
    ['Completo = $0', '+20 (reemplaza al anterior)'],
    ['Incompleto dentro de objetivo', '+10'],
    ['Incompleto = $0', '+20 (reemplaza al anterior)'],
    ['MFY entre 35″ y 50″', '+10'],
    ['MFY < 35″ (adulteración)', '−10'],
    ['MFY > 50″', '0'],
    ['Stat OK al cierre del día', '+8 para todos los que trabajaron'],
    ['Penalización (cada una)', '−10'],
  ], [4513, 4513]),
  h2('Multiplicadores'),
  tabla(['Franja', 'Multiplicador'], [
    ['Desayuno (06–11)', 'x1.0'],
    ['Almuerzo (11–16)', 'x2.0'],
    ['Merienda (16–20)', 'x1.0'],
    ['Cena (20–01)', 'x2.0'],
    ['Open (01–06)', 'x1.5'],
    ['Fin de semana', 'x2.0 adicional (automático)'],
  ], [4513, 4513]),
  h2('Factor de equidad'),
  tabla(['Horas semanales', 'Factor'], [
    ['Menos de 12 hs', 'x1.0'],
    ['12 a 15 hs', 'x1.25'],
    ['16 hs o más', 'x1.0'],
  ], [4513, 4513]),
])

// ---------- escribir ----------
const outDir = path.join(__dirname, '..', 'docs')
fs.mkdirSync(outDir, { recursive: true })
Promise.all([
  Packer.toBuffer(manualCrew).then(b => fs.writeFileSync(path.join(outDir, 'Manual_Crew_IC_VCP.docx'), b)),
  Packer.toBuffer(manualGestion).then(b => fs.writeFileSync(path.join(outDir, 'Manual_Gestion_IC_VCP.docx'), b)),
]).then(() => console.log('✓ docs/Manual_Crew_IC_VCP.docx\n✓ docs/Manual_Gestion_IC_VCP.docx'))
