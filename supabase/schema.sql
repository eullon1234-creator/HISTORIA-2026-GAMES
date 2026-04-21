-- ============================================================
--  HISTORIA 2026 GAMES — Script de criação da tabela "jogos"
--  Execute no Supabase: Dashboard > SQL Editor > New Query
-- ============================================================

-- Extensão para geração de UUIDs (já habilitada por padrão no Supabase)
create extension if not exists "pgcrypto";

-- Tabela principal
create table if not exists public.jogos (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          null,
  nome_do_jogo    text          not null,
  plataforma      text          not null,
  genero          text          not null default '',
  status          text          not null default 'Querendo...',
  valor_pago      numeric(10,2) null,
  data_inicio     date          null,
  nota_pessoal    numeric(3,1)  null check (nota_pessoal >= 0 and nota_pessoal <= 10),
  data_finalizada date          null,
  desistiu        boolean       not null default false,
  capa_url        text          null,
  created_at      timestamptz   not null default now()
);

-- Suporte para projetos já existentes
alter table public.jogos add column if not exists user_id uuid;
alter table public.jogos alter column user_id set default auth.uid();

-- Restrição: status só aceita valores válidos
alter table public.jogos
  add constraint jogos_status_check
  check (status in ('Zerei', 'Desisti', 'Pausa', 'Querendo...', 'Jogando'));

-- Índice para buscas por nome
create index if not exists jogos_nome_idx on public.jogos (nome_do_jogo);

-- Índice para filtros por status
create index if not exists jogos_status_idx on public.jogos (status);
create index if not exists jogos_user_id_idx on public.jogos (user_id);

-- ============================================================
--  Row Level Security (RLS)
--  Habilite se quiser autenticação por usuário.
--  Por enquanto, libera leitura/escrita pública para todos.
-- ============================================================

alter table public.jogos enable row level security;

drop policy if exists "Leitura pública de jogos" on public.jogos;
drop policy if exists "Inserção pública de jogos" on public.jogos;
drop policy if exists "Atualização pública de jogos" on public.jogos;
drop policy if exists "Exclusão pública de jogos" on public.jogos;

create policy "Leitura do próprio usuário"
  on public.jogos for select
  using (auth.uid() is not null and auth.uid() = user_id);

create policy "Inserção do próprio usuário"
  on public.jogos for insert
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Atualização do próprio usuário"
  on public.jogos for update
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Exclusão do próprio usuário"
  on public.jogos for delete
  using (auth.uid() is not null and auth.uid() = user_id);

-- ============================================================
--  Dados de exemplo para testar o layout (opcional)
--  Remova este bloco se não quiser dados fictícios.
-- ============================================================

insert into public.jogos
  (nome_do_jogo, plataforma, genero, status, valor_pago, data_inicio, nota_pessoal, data_finalizada, desistiu, capa_url)
values
  ('God of War', 'PS5', 'Ação/Aventura', 'Zerei', 0, '2025-01-10', 10, '2025-02-01', false,
   'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg'),

  ('GTA V', 'STEAM', 'Mundo Aberto', 'Pausa', 29.90, '2024-11-05', 8, null, false,
   'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png'),

  ('Tomb Raider (2013)', 'STEAM', 'Ação/Aventura', 'Zerei', 9.99, '2024-08-12', 9, '2024-09-01', false,
   'https://upload.wikimedia.org/wikipedia/en/0/0e/Tomb_Raider_2013_Cover.jpg'),

  ('Hollow Knight', 'GAME PASS', 'Metroidvania', 'Jogando', 0, '2026-02-20', null, null, false,
   'https://upload.wikimedia.org/wikipedia/en/6/60/Hollow_Knight_first_cover_art.jpg'),

  ('Cyberpunk 2077', 'STEAM', 'RPG', 'Querendo...', 0, null, null, null, false,
   'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg'),

  ('The Last of Us Part I', 'PS5', 'Ação/Aventura', 'Zerei', 299.90, '2025-06-01', 10, '2025-06-20', false,
   'https://upload.wikimedia.org/wikipedia/en/4/46/The_Last_of_Us_%E2%80%93_Part_I_Cover.jpg');
