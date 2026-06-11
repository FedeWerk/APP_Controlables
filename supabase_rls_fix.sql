-- =============================================
-- FIX RLS — IC VCP
-- Reactiva RLS en public.usuarios y completa las políticas
-- faltantes en el resto de las tablas.
-- Idempotente: se puede correr más de una vez sin error.
-- =============================================

-- ---------------------------------------------
-- Función helper: rol del usuario autenticado.
-- SECURITY DEFINER para que las políticas sobre public.usuarios
-- puedan consultar la misma tabla sin recursión infinita.
-- ---------------------------------------------
create or replace function public.rol_actual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.usuarios where id = auth.uid();
$$;

revoke all on function public.rol_actual() from public;
grant execute on function public.rol_actual() to authenticated;

-- ---------------------------------------------
-- USUARIOS
-- Lectura: cualquier usuario autenticado (el leaderboard y la
-- carga de turno necesitan nombre/rol de todos).
-- Escritura: solo gerente.
-- ---------------------------------------------
alter table public.usuarios enable row level security;

drop policy if exists "usuarios_select" on public.usuarios;
create policy "usuarios_select" on public.usuarios
  for select to authenticated
  using (true);

drop policy if exists "usuarios_insert_gerente" on public.usuarios;
create policy "usuarios_insert_gerente" on public.usuarios
  for insert to authenticated
  with check (public.rol_actual() = 'gerente');

drop policy if exists "usuarios_update_gerente" on public.usuarios;
create policy "usuarios_update_gerente" on public.usuarios
  for update to authenticated
  using (public.rol_actual() = 'gerente');

drop policy if exists "usuarios_delete_gerente" on public.usuarios;
create policy "usuarios_delete_gerente" on public.usuarios
  for delete to authenticated
  using (public.rol_actual() = 'gerente');

-- ---------------------------------------------
-- TURNOS
-- Lectura: todos. Insert/Update: gerente, manager, entrenador
-- (la carga usa upsert ⇒ necesita ambas).
-- ---------------------------------------------
drop policy if exists "turnos_lectura" on public.turnos;
create policy "turnos_lectura" on public.turnos
  for select to authenticated
  using (true);

drop policy if exists "turnos_carga" on public.turnos;
create policy "turnos_carga" on public.turnos
  for insert to authenticated
  with check (public.rol_actual() in ('gerente','manager','entrenador'));

drop policy if exists "turnos_update" on public.turnos;
create policy "turnos_update" on public.turnos
  for update to authenticated
  using (public.rol_actual() in ('gerente','manager','entrenador'));

-- ---------------------------------------------
-- PUNTAJES
-- Lectura: todos (leaderboard). Escritura: quienes cargan turno.
-- ---------------------------------------------
drop policy if exists "crew_puntajes" on public.puntajes;
drop policy if exists "puntajes_lectura_todos" on public.puntajes;
create policy "puntajes_lectura_todos" on public.puntajes
  for select to authenticated
  using (true);

drop policy if exists "puntajes_insert" on public.puntajes;
create policy "puntajes_insert" on public.puntajes
  for insert to authenticated
  with check (public.rol_actual() in ('gerente','manager','entrenador'));

drop policy if exists "puntajes_update" on public.puntajes;
create policy "puntajes_update" on public.puntajes
  for update to authenticated
  using (public.rol_actual() in ('gerente','manager','entrenador'));

-- ---------------------------------------------
-- STAT DIARIO
-- Lectura: todos. Escritura (upsert): quienes cargan turno.
-- ---------------------------------------------
drop policy if exists "stat_lectura" on public.stat_diario;
create policy "stat_lectura" on public.stat_diario
  for select to authenticated
  using (true);

drop policy if exists "stat_insert" on public.stat_diario;
create policy "stat_insert" on public.stat_diario
  for insert to authenticated
  with check (public.rol_actual() in ('gerente','manager','entrenador'));

drop policy if exists "stat_update" on public.stat_diario;
create policy "stat_update" on public.stat_diario
  for update to authenticated
  using (public.rol_actual() in ('gerente','manager','entrenador'));

-- ---------------------------------------------
-- HORARIOS SEMANA
-- Lectura: todos. Escritura: solo gerente (sube el PDF).
-- ---------------------------------------------
drop policy if exists "horarios_lectura" on public.horarios_semana;
create policy "horarios_lectura" on public.horarios_semana
  for select to authenticated
  using (true);

drop policy if exists "horarios_escritura_gerente" on public.horarios_semana;
create policy "horarios_escritura_gerente" on public.horarios_semana
  for all to authenticated
  using (public.rol_actual() = 'gerente')
  with check (public.rol_actual() = 'gerente');

-- ---------------------------------------------
-- ASIGNACIONES
-- Lectura: todos (la carga de turno arma el crew desde acá).
-- Escritura: solo gerente (insert masivo + delete al re-subir).
-- ---------------------------------------------
drop policy if exists "asignaciones_lectura" on public.asignaciones;
create policy "asignaciones_lectura" on public.asignaciones
  for select to authenticated
  using (true);

drop policy if exists "asignaciones_escritura_gerente" on public.asignaciones;
create policy "asignaciones_escritura_gerente" on public.asignaciones
  for all to authenticated
  using (public.rol_actual() = 'gerente')
  with check (public.rol_actual() = 'gerente');

-- ---------------------------------------------
-- INDICADORES MENSUALES — solo gerente
-- ---------------------------------------------
drop policy if exists "mensual_gerente" on public.indicadores_mensuales;
create policy "mensual_gerente" on public.indicadores_mensuales
  for all to authenticated
  using (public.rol_actual() = 'gerente')
  with check (public.rol_actual() = 'gerente');

-- ---------------------------------------------
-- ALERTAS
-- Solo gerente las ve y las resuelve. El insert lo hace
-- verificar_horario_proximo() (security definer / service role).
-- ---------------------------------------------
drop policy if exists "alertas_gerente" on public.alertas;
create policy "alertas_gerente" on public.alertas
  for all to authenticated
  using (public.rol_actual() = 'gerente')
  with check (public.rol_actual() = 'gerente');

-- ---------------------------------------------
-- Las funciones de mantenimiento corren como definer así
-- el cron (o quien sea) no depende de políticas de tabla.
-- ---------------------------------------------
alter function public.activar_horario_semana() security definer set search_path = public;
alter function public.verificar_horario_proximo() security definer set search_path = public;

revoke all on function public.activar_horario_semana() from public;
revoke all on function public.verificar_horario_proximo() from public;

-- =============================================
-- VERIFICACIÓN RÁPIDA (correr después de aplicar):
--   select tablename, policyname from pg_policies where schemaname = 'public' order by 1;
--   select relname, relrowsecurity from pg_class
--     where relnamespace = 'public'::regnamespace and relkind = 'r';
-- =============================================
