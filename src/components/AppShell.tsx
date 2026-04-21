'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Jogo } from '@/types/jogo'
import { Dashboard } from './Dashboard'
import { GameForm } from './GameForm'
import { buscarJogos } from '@/services/jogos'
import { isSupabaseConfigured } from '@/lib/supabase'

interface Props {
  jogosList?: Jogo[]
}

export function AppShell({ jogosList = [] }: Props) {
  const [jogos, setJogos] = useState<Jogo[]>(jogosList)
  const [modalAberto, setModalAberto] = useState(false)
  const [jogoEditando, setJogoEditando] = useState<Jogo | null>(null)
  const [loadingJogos, setLoadingJogos] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const carregarJogos = useCallback(async () => {
    setLoadingJogos(true)
    setErro(null)
    try {
      const lista = await buscarJogos()
      setJogos(lista)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      if (msg.includes('Failed to fetch')) {
        setErro('O banco de dados está acordando... Por favor, aguarde 1 minuto e atualize a página. ☕')
      } else {
        setErro(msg)
      }
      setJogos([])
    } finally {
      setLoadingJogos(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setErro('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      return
    }

    void carregarJogos()
  }, [carregarJogos])

  const handleSair = useCallback(() => {
    // Agora o botão sair apenas reseta o estado local, já que removemos o login
    setJogos([])
    void carregarJogos()
  }, [carregarJogos])

  const handleNovoJogo = useCallback(() => {
    setJogoEditando(null)
    setModalAberto(true)
  }, [])

  const handleEditJogo = useCallback((jogo: Jogo) => {
    setJogoEditando(jogo)
    setModalAberto(true)
  }, [])

  const handleSalvar = useCallback((jogoSalvo: Jogo) => {
    setJogos((prev) => {
      const existe = prev.find((j) => j.id === jogoSalvo.id)
      if (existe) {
        return prev.map((j) => (j.id === jogoSalvo.id ? jogoSalvo : j))
      }
      return [jogoSalvo, ...prev]
    })
    setModalAberto(false)
  }, [])

  const handleDeletar = useCallback((id: string) => {
    setJogos((prev) => prev.filter((j) => j.id !== id))
    setModalAberto(false)
  }, [])

  return (
    <>
      <Dashboard
        jogos={jogos}
        onNovoJogo={handleNovoJogo}
        onEditJogo={handleEditJogo}
        onSair={handleSair}
        carregando={loadingJogos}
        erro={erro}
      />

      {modalAberto && (
        <GameForm
          jogo={jogoEditando}
          onSalvar={handleSalvar}
          onDeletar={handleDeletar}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </>
  )
}
