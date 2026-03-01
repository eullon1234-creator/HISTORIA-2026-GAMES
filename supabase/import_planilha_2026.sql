-- ============================================================
-- Importação dos dados da planilha HISTORIA 2026 GAMES
-- Execute no Supabase SQL Editor
-- ============================================================

begin;

-- Remove apenas os jogos desta importação para evitar duplicidade ao reexecutar
DELETE FROM public.jogos
WHERE nome_do_jogo IN (
  'Spider-Man: Miles Morales',
  'Esquadrão Suicida: Mate a Liga da Justiça',
  'Tomb Raider The Of Rise',
  'Red Dead Redemption 2',
  'Lords Of The Fallen',
  'Spider-Man Remastered',
  'God of War: Ragnarök',
  'Spider-Man 2',
  'The Last of Us 1 Remake',
  'Gears of War: Ultimate Edition',
  'God of War: 2018',
  'Katana Zero'
);

INSERT INTO public.jogos
(nome_do_jogo, plataforma, genero, status, valor_pago, data_inicio, nota_pessoal, data_finalizada, desistiu, capa_url)
VALUES
('Spider-Man: Miles Morales', 'STEAM', 'Ação e Aventura', 'Zerei', 60.98, '2025-12-23', 10, '2026-01-01', false, 'https://upload.wikimedia.org/wikipedia/en/e/e7/Spider-Man_Miles_Morales.jpeg'),
('Esquadrão Suicida: Mate a Liga da Justiça', 'STEAM', 'RPG de Ação e Tiro', 'Desisti', 13.99, '2026-02-11', 5, '2026-02-14', true, 'https://upload.wikimedia.org/wikipedia/en/5/57/Suicide_Squad_Kill_the_Justice_League_cover_art.jpg'),
('Tomb Raider The Of Rise', 'STEAM', 'Ação e Aventura de Sobrevivencia', 'Pausa', 13.00, '2026-01-20', null, null, false, 'https://upload.wikimedia.org/wikipedia/en/9/9e/Rise_of_the_Tomb_Raider_cover.jpg'),
('Red Dead Redemption 2', 'STEAM TOOLS', 'Aventura', 'Querendo...', null, null, null, '2023-11-05', false, 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg'),
('Lords Of The Fallen', 'STEAM', 'Soulslike, RPG Ação', 'Querendo...', 10.00, null, null, null, false, 'https://upload.wikimedia.org/wikipedia/en/5/5f/Lords_of_the_Fallen_2023_cover.jpg'),
('Spider-Man Remastered', 'HYDRA', 'Ação e Aventura', 'Zerei', 0.00, '2026-01-18', 10, '2026-02-10', false, 'https://upload.wikimedia.org/wikipedia/en/e/e0/Spider-Man_PS4_cover.jpg'),
('God of War: Ragnarök', 'STEAM TOOLS', 'Ação', 'Querendo...', null, null, null, null, false, 'https://upload.wikimedia.org/wikipedia/en/e/ee/God_of_War_Ragnar%C3%B6k_cover.jpg'),
('Spider-Man 2', 'STEAM TOOLS', 'Ação e Aventura', 'Querendo...', null, null, null, null, false, 'https://upload.wikimedia.org/wikipedia/en/3/32/Marvel%27s_Spider-Man_2_cover_art.jpg'),
('The Last of Us 1 Remake', 'STEAM TOOLS', 'Ação e Aventura', 'Zerei', 0.00, '2026-02-13', 10, '2026-02-19', false, 'https://upload.wikimedia.org/wikipedia/en/4/46/The_Last_of_Us_%E2%80%93_Part_I_Cover.jpg'),
('Gears of War: Ultimate Edition', 'GAME PASS', 'Ação e Aventura', 'Desisti', 0.00, '2026-02-20', null, '2026-02-20', true, 'https://upload.wikimedia.org/wikipedia/en/8/8f/Gears_of_War_Ultimate_Edition_cover.jpg'),
('God of War: 2018', 'HYDRA', 'Ação e Aventura', 'Zerei', 0.00, '2026-01-10', 10, '2026-01-18', false, 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg'),
('Katana Zero', 'STEAM TOOLS', 'Ação, Indie', 'Jogando', 0.00, '2026-02-28', null, null, false, 'https://upload.wikimedia.org/wikipedia/en/1/17/Katana_Zero_cover_art.jpg');

commit;
