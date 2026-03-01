import { supabase } from '@/lib/supabase'
import type { Jogo, NovoJogo } from '@/types/jogo'

/** Busca todos os jogos ordenados por data de criação (mais recente primeiro) */
export async function buscarJogos(): Promise<Jogo[]> {
  const { data, error } = await supabase
    .from('jogos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Erro ao buscar jogos: ${error.message}`)
  return data as Jogo[]
}

/** Busca um único jogo pelo id */
export async function buscarJogoPorId(id: string): Promise<Jogo | null> {
  const { data, error } = await supabase
    .from('jogos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Jogo
}

/** Insere um novo jogo e retorna o registro criado */
export async function inserirJogo(jogo: NovoJogo): Promise<Jogo> {
  const { data, error } = await supabase
    .from('jogos')
    .insert([jogo])
    .select()
    .single()

  if (error) throw new Error(`Erro ao inserir jogo: ${error.message}`)
  return data as Jogo
}

/** Atualiza um jogo existente */
export async function atualizarJogo(
  id: string,
  dados: Partial<NovoJogo>
): Promise<Jogo> {
  const { data, error } = await supabase
    .from('jogos')
    .update(dados)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Erro ao atualizar jogo: ${error.message}`)
  return data as Jogo
}

/** Remove um jogo pelo id */
export async function deletarJogo(id: string): Promise<void> {
  const { error } = await supabase
    .from('jogos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Erro ao deletar jogo: ${error.message}`)
}
