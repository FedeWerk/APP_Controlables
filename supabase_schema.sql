-- =============================================
-- SCHEMA IC VCP — McDonald's Villa Carlos Paz
-- =============================================

-- USUARIOS
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text unique not null,
  rol text not null check (rol in ('gerente','manager','entrenador','crew')),
  activo boolean default true,
  created_at timestamptz default now()
);

-- SEMANAS DE HORARIOS
-- Solo almacena la semana vigente y la próxima. Nunca historial.
create table public.horarios_semana (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null unique,  -- siempre lunes
  semana_fin date not null,            -- siempre domingo
  subido_por uuid references public.usuarios(id),
  subido_at timestamptz default now(),
  activo boolean default false         -- true solo para la semana en curso
);

-- ASIGNACIONES DE TURNO (extraídas del PDF, se descartan al rotar semana)
create table public.asignaciones (
  id uuid primary key default gen_random_uuid(),
  semana_id uuid references public.horarios_semana(id) on delete cascade,
  usuario_id uuid references public.usuarios(id),
  nombre_pdf text not null,            -- nombre tal como viene del PDF
  fecha date not null,
  hora_inicio numeric not null,        -- hora decimal, ej: 18.5 = 18:30
  hora_fin numeric not null,
  horas_semana numeric not null,       -- total hs asignadas esa semana
  turno_principal text not null check (turno_principal in ('desayuno','almuerzo','merienda','cena','open')),
  prop_turno numeric default 1.0       -- proporción si cruza turnos
);

-- TURNOS CARGADOS
create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  franja text not null check (franja in ('desayuno','almuerzo','merienda','cena','open')),
  manager_id uuid references public.usuarios(id),
  venta numeric,                       -- $ venta del turno
  completo_monto numeric,              -- $ desperdicio completo
  incompleto_monto numeric,            -- $ desperdicio incompleto
  mfy_segundos integer,                -- tiempo MFY en segundos
  pts_base integer default 0,
  multiplicador numeric default 1.0,
  pts_total numeric default 0,
  pen_mfy_bajo boolean default false,
  pen_vencimiento boolean default false,
  pen_otro boolean default false,
  pen_detalle text,
  cargado_at timestamptz default now(),
  unique(fecha, franja)
);

-- STAT DIARIO
create table public.stat_diario (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,
  venta_total numeric not null,
  stat_monto numeric not null,         -- puede ser negativo
  stat_pct numeric not null,
  dentro_objetivo boolean not null,
  cargado_por uuid references public.usuarios(id),
  cargado_at timestamptz default now()
);

-- PUNTAJES INDIVIDUALES (histórico permanente)
create table public.puntajes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id),
  turno_id uuid references public.turnos(id),
  fecha date not null,
  franja text not null,
  pts_turno numeric default 0,         -- pts del turno × factor equidad × prop
  pts_stat numeric default 0,          -- +8 si stat OK
  pts_total numeric default 0,
  factor_equidad numeric default 1.0,
  horas_semana numeric,
  created_at timestamptz default now()
);

-- INDICADORES MENSUALES
create table public.indicadores_mensuales (
  id uuid primary key default gen_random_uuid(),
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  food_otros_pct numeric,
  paper_otros_pct numeric,
  food_ok boolean,
  paper_ok boolean,
  cargado_por uuid references public.usuarios(id),
  cargado_at timestamptz default now(),
  unique(anio, mes)
);

-- ALERTAS DEL SISTEMA
create table public.alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,                  -- 'horario_faltante', 'objetivo_incumplido'
  mensaje text not null,
  resuelta boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.usuarios enable row level security;
alter table public.horarios_semana enable row level security;
alter table public.asignaciones enable row level security;
alter table public.turnos enable row level security;
alter table public.stat_diario enable row level security;
alter table public.puntajes enable row level security;
alter table public.indicadores_mensuales enable row level security;
alter table public.alertas enable row level security;

-- Crew y entrenador: solo ven sus propios puntajes
create policy "crew_puntajes" on public.puntajes
  for select using (usuario_id = auth.uid());

-- Todos los roles autenticados ven turnos y leaderboard
create policy "turnos_lectura" on public.turnos
  for select using (auth.role() = 'authenticated');

create policy "puntajes_lectura_todos" on public.puntajes
  for select using (auth.role() = 'authenticated');

-- Manager y entrenador pueden insertar turnos
create policy "turnos_carga" on public.turnos
  for insert with check (
    exists (
      select 1 from public.usuarios
      where id = auth.uid()
      and rol in ('gerente','manager','entrenador')
    )
  );

-- Solo gerente puede cargar indicadores mensuales y ver alertas
create policy "mensual_gerente" on public.indicadores_mensuales
  for all using (
    exists (select 1 from public.usuarios where id = auth.uid() and rol = 'gerente')
  );

-- =============================================
-- FUNCIÓN: activar horario del lunes
-- =============================================
create or replace function public.activar_horario_semana()
returns void language plpgsql as $$
begin
  -- Desactivar todos
  update public.horarios_semana set activo = false;
  -- Activar el de la semana en curso (lunes de esta semana)
  update public.horarios_semana
  set activo = true
  where semana_inicio = date_trunc('week', current_date)::date;
end;
$$;

-- =============================================
-- FUNCIÓN: alerta viernes sin horario
-- =============================================
create or replace function public.verificar_horario_proximo()
returns void language plpgsql as $$
declare
  proximo_lunes date;
  existe boolean;
begin
  proximo_lunes := date_trunc('week', current_date + interval '7 days')::date;
  select exists(
    select 1 from public.horarios_semana where semana_inicio = proximo_lunes
  ) into existe;

  if not existe and extract(dow from current_date) = 5 then
    insert into public.alertas (tipo, mensaje)
    values (
      'horario_faltante',
      'No se subió el horario para la semana del ' || proximo_lunes::text || '. Recordá subirlo antes del fin de semana.'
    )
    on conflict do nothing;
  end if;
end;
$$;

-- =============================================
-- ÍNDICES DE PERFORMANCE
-- =============================================
create index idx_puntajes_usuario on public.puntajes(usuario_id);
create index idx_puntajes_fecha on public.puntajes(fecha);
create index idx_turnos_fecha on public.turnos(fecha);
create index idx_asignaciones_semana on public.asignaciones(semana_id);
