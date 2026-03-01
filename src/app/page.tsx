import { buscarJogos } from '@/services/jogos'
import { AppShell } from '@/components/AppShell'
import type { Jogo } from '@/types/jogo'

export const revalidate = 0 // sempre busca dados frescos

const JOGOS_PLACEHOLDER: Jogo[] = [
  {
    id: '1',
    nome_do_jogo: 'God of War',
    plataforma: 'PS5',
    genero: 'Ação/Aventura',
    status: 'Zerei',
    valor_pago: 0,
    data_inicio: '2025-01-10',
    nota_pessoal: 10,
    data_finalizada: '2025-02-01',
    desistiu: false,
    capa_url: 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg',
  },
  {
    id: '2',
    nome_do_jogo: 'GTA V',
    plataforma: 'STEAM',
    genero: 'Mundo Aberto',
    status: 'Pausa',
    valor_pago: 29.90,
    data_inicio: '2024-11-05',
    nota_pessoal: 8,
    data_finalizada: null,
    desistiu: false,
    capa_url: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
  },
  {
    id: '3',
    nome_do_jogo: 'Hollow Knight',
    plataforma: 'GAME PASS',
    genero: 'Metroidvania',
    status: 'Jogando',
    valor_pago: 0,
    data_inicio: '2026-02-20',
    nota_pessoal: null,
    data_finalizada: null,
    desistiu: false,
    capa_url: 'https://upload.wikimedia.org/wikipedia/en/6/60/Hollow_Knight_first_cover_art.jpg',
  },
  {
    id: '4',
    nome_do_jogo: 'Cyberpunk 2077',
    plataforma: 'STEAM',
    genero: 'RPG',
    status: 'Querendo...',
    valor_pago: 0,
    data_inicio: null,
    nota_pessoal: null,
    data_finalizada: null,
    desistiu: false,
    capa_url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
  },
  {
    id: '5',
    nome_do_jogo: 'The Last of Us Part I',
    plataforma: 'PS5',
    genero: 'Ação/Aventura',
    status: 'Zerei',
    valor_pago: 299.90,
    data_inicio: '2025-06-01',
    nota_pessoal: 10,
    data_finalizada: '2025-06-20',
    desistiu: false,
    capa_url: 'https://upload.wikimedia.org/wikipedia/en/4/46/The_Last_of_Us_%E2%80%93_Part_I_Cover.jpg',
  },
  {
    id: '6',
    nome_do_jogo: 'Tomb Raider (2013)',
    plataforma: 'STEAM',
    genero: 'Ação/Aventura',
    status: 'Zerei',
    valor_pago: 9.99,
    data_inicio: '2024-08-12',
    nota_pessoal: 9,
    data_finalizada: '2024-09-01',
    desistiu: false,
    capa_url: 'https://upload.wikimedia.org/wikipedia/en/0/0e/Tomb_Raider_2013_Cover.jpg',
  },
]

export default async function HomePage() {
  let jogos: Jogo[] = []

  try {
    jogos = await buscarJogos()
  } catch {
    // Se o Supabase ainda não estiver configurado, usa placeholders
    jogos = JOGOS_PLACEHOLDER
  }

  return <AppShell jogosList={jogos} />
}
