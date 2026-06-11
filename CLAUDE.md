# IC VCP — Sistema de Gamificación de Índice de Controlables
## McDonald's Villa Carlos Paz
---
## Contexto del negocio
Aplicación web PWA para gamificar los resultados de rentabilidad de la sucursal McDonald's de Villa Carlos Paz (Argentina). El gerente es **Federico Werkmeister** (`fedewerk@gmail.com`).
El objetivo es involucrar al equipo (crew, entrenadores, managers) con los indicadores de Índice de Controlables (IC) de forma lúdica, asignando puntos por cumplimiento de objetivos por turno.
---
## Stack técnico
- **Frontend:** React + Vite (PWA instalable)
- **Auth:** Supabase Auth (Google OAuth activo)
- **DB:** Supabase (PostgreSQL)
- **Hosting:** Vercel → https://app-controlables.vercel.app
- **Repo:** GitHub → FedeWerk/APP_Controlables
### Variables de entorno (.env)
```
VITE_SUPABASE_URL=https://ifezgrgrzikjpgaoqzbq.supabase.co
VITE_SUPABASE_ANON_KEY=[ver en Supabase → Settings → API]
```
---
## Estructura del proyecto
```
src/
  lib/
    supabase.js          # Cliente Supabase
    puntuacion.js        # Motor de puntuación (lógica core)
  context/
    AuthContext.jsx      # Auth + roles
  pages/
    Login.jsx            # Login con Google + email/password
    AuthCallback.jsx     # Maneja redirect OAuth de Google
    CargarTurno.jsx      # Carga de resultados por turno
    Leaderboard.jsx      # Ranking empleados y turnos
    SubirHorarios.jsx    # Upload PDF de Orquest
    IndicadoresMensuales.jsx  # Carga Food/Paper Otros (gerente)
    Reportes.jsx         # Reportes mensuales + export CSV/PDF (gerente)
  App.jsx                # Router + Layout
  App.css                # Estilos globales + responsive + print
api/
  _supabase.js           # Helper RPC con service role key
  verificar-horario.js   # Cron viernes: alerta horario faltante
  activar-horario.js     # Cron lunes: activa horario de la semana
tools/
  gen-icons.mjs          # Genera iconos PWA con Playwright
  smoke.mjs              # Smoke test local (login + errores consola)
supabase_schema.sql      # Schema completo de la DB
supabase_rls_fix.sql     # Migración RLS (aplicar en SQL editor)
```
---
## Roles de usuario
| Rol | Opera / suma pts | Carga turno | Penalizaciones | PDF / reportes |
|---|---|---|---|---|
| crew | ✓ | — | — | — |
| entrenador | ✓ | ✓ | — | — |
| manager | — | ✓ | — | — |
| gerente | — | ✓ | ✓ | ✓ |
- Entrenador y Crew compiten juntos en el leaderboard (entrenador con badge distintivo)
- 84 usuarios cargados en la DB
---
## Lógica de puntuación (ver src/lib/puntuacion.js)
### Objetivos de indicadores
```js
completo:    0.10%  // sobre venta del turno
incompleto:  0.44%  // sobre venta del turno
stat:        0.10%  // sobre venta diaria (±)
mfy_max:     50"    // segundos
mfy_min:     35"    // bajo este valor = adulteración
food_otros:  0.84%  // mensual
paper_otros: 0.74%  // mensual
```
### Puntos base por turno
| Condición | Pts |
|---|---|
| Completo dentro de objetivo | +10 |
| Completo = $0 | +20 (reemplaza al anterior) |
| Incompleto dentro de objetivo | +10 |
| Incompleto = $0 | +20 (reemplaza al anterior) |
| MFY entre 35" y 50" | +10 |
| MFY < 35" (adulteración) | −10 |
| MFY > 50" | 0 |
| Stat OK al cierre del día | +8 para todos los que trabajaron |
| Penalización MFY < 35" | −10 |
| Penalización vencimiento secundario | −10 |
| Penalización otro incumplimiento | −10 |
### Multiplicadores
| Franja | Mult base |
|---|---|
| Desayuno (06-11) | x1.0 |
| Almuerzo (11-16) | x2.0 |
| Merienda (16-20) | x1.0 |
| Cena (20-01) | x2.0 |
| Open (01-06) | x1.5 |
| Fin de semana | x2.0 adicional (automático por fecha) |
Ejemplo: Cena en sábado = x2.0 × x2.0 = x4.0
### Factor de equidad crew
- < 12 hs semanales → x1.0 (caso borde)
- 12 a 15 hs semanales → x1.25 (plus fijo)
- 16+ hs semanales → x1.0 (neutro)
### Asignación de turno
Cada crew pertenece al turno donde aplica ≥80% de sus horas. Si no llega al 80%, los puntos se distribuyen proporcionalmente entre los turnos que cubre.
---
## Horarios (Orquest)
- El gerente exporta el PDF de horarios semanales desde Orquest y lo sube a la app
- Se procesa localmente con pdf.js (sin almacenar el PDF)
- Los horarios se activan automáticamente el **lunes 00:00**
- El sistema avisa si el viernes no se subió el horario de la semana siguiente
- La DB **no almacena historial de horarios**, solo los puntajes
---
## Base de datos (Supabase)
### Tablas principales
- `public.usuarios` — id, nombre, email, rol, activo
- `public.horarios_semana` — semana_inicio, semana_fin, activo
- `public.asignaciones` — crew asignado a turno/fecha
- `public.turnos` — resultados cargados por turno
- `public.stat_diario` — stat del día
- `public.puntajes` — historial permanente de puntos por persona
- `public.indicadores_mensuales` — food otros, paper otros
- `public.alertas` — alertas del sistema
### Estado actual del RLS
- Migración completa en `supabase_rls_fix.sql` (idempotente): reactiva RLS en `usuarios`
  (lectura para autenticados, escritura solo gerente vía función `rol_actual()` security definer)
  y completa políticas de asignaciones, horarios_semana, stat_diario, puntajes, alertas e
  indicadores_mensuales.
- **Hasta que se aplique:** `public.usuarios` → RLS desactivado temporalmente.
---
## Estado actual del desarrollo
### ✅ Funciona
- Login con Google OAuth
- Login con email/password
- Roles diferenciados (gerente ve todo, crew solo leaderboard)
- Layout responsive: sidebar en desktop, nav inferior en mobile
- Motor de puntuación completo
- Carga de turno con cálculo automático de % sobre venta
- Leaderboard de empleados y turnos
- Upload de PDF de Orquest con parser
- 84 usuarios cargados en DB
- Pantalla de reportes (evolución diaria, resumen mensual, export CSV Excel-AR + PDF vía print)
- UI de indicadores mensuales (Food Otros / Paper Otros a mes cerrado)
- Iconos PWA (icon-192/512, generados con tools/gen-icons.mjs)
- Crons en Vercel: viernes 09:00 ART alerta horario faltante, lunes 00:05 ART activa horario
### 🔧 Pendiente (pasos manuales)
1. **Aplicar `supabase_rls_fix.sql`** en Supabase → SQL editor (reactiva RLS de usuarios con políticas correctas)
2. **Env vars en Vercel** para los crons: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role) y opcional `CRON_SECRET`
3. **Probar login de crew real** con Google después de aplicar el RLS
### 📋 Próximas features
- Badges y logros (racha de días, cero desperdicio, etc.)
- Notificaciones push (PWA) cuando se publican resultados del turno
- Vista de historial personal para cada crew
---
## Comandos útiles
```bash
# Desarrollo local
npm run dev
# Build
npm run build
# Deploy (automático al hacer push a main)
git add . && git commit -m "mensaje" && git push
```
---
## Notas importantes
- Los emails en Supabase están en **minúsculas** — siempre normalizar con `.toLowerCase()`
- El PDF de Orquest se procesa en el browser y **nunca se almacena** (privacidad / licencia)
- Los horarios semanales se descartan al rotar semana — solo se guardan puntajes
- La contraseña inicial de los usuarios creados por SQL es `McVCP2025!`
- Google OAuth funciona — usuario debe estar en `public.usuarios` con el mismo email
