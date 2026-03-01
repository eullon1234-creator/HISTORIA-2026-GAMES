export type Plataforma = 'STEAM' | 'STEAM TOOLS' | 'HYDRA' | 'GAME PASS' | 'PS5' | 'PS4' | 'EPIC' | 'GOG' | 'OUTRO'

export type StatusJogo =
  | 'Zerei'
  | 'Desisti'
  | 'Pausa'
  | 'Querendo...'
  | 'Jogando'

export interface Jogo {
  id: string
  nome_do_jogo: string
  plataforma: Plataforma
  genero: string
  status: StatusJogo
  valor_pago: number | null
  data_inicio: string | null       // ISO date string: "YYYY-MM-DD"
  nota_pessoal: number | null      // 0 a 10
  data_finalizada: string | null   // ISO date string: "YYYY-MM-DD"
  desistiu: boolean
  capa_url: string | null
  created_at?: string
}

export type NovoJogo = Omit<Jogo, 'id' | 'created_at'>
