export type Plataforma = string

export type StatusJogo =
  | 'Zerei'
  | 'Desisti'
  | 'Pausa'
  | 'Querendo...'
  | 'Jogando'

export interface Jogo {
  id: string
  user_id?: string
  nome_do_jogo: string
  plataforma: Plataforma
  genero: string
  status: StatusJogo
  valor_pago: number | null
  data_inicio: string | null       // ISO date string: "YYYY-MM-DD"
  nota_pessoal: number | null      // 0 a 10
  desistiu: boolean
  capa_url: string | null
  created_at?: string
}

export type NovoJogo = Omit<Jogo, 'id' | 'created_at' | 'user_id'>
