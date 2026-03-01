'use client'

import { useState, useCallback } from 'react'
import type { Jogo } from '@/types/jogo'
import { Dashboard } from './Dashboard'
import { GameForm } from './GameForm'
import { AIAssistant } from './AIAssistant'

type BotMutation = {
  type: 'insert' | 'update' | 'delete'
  jogo?: Jogo
  id?: string
}

interface Props {
  jogosList: Jogo[]
}

export function AppShell({ jogosList }: Props) {
  const [jogos, setJogos] = useState<Jogo[]>(jogosList)
  const [modalAberto, setModalAberto] = useState(false)
  const [jogoEditando, setJogoEditando] = useState<Jogo | null>(null)

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

  const handleBotMutation = useCallback((mutation: BotMutation) => {
    setJogos((prev) => {
      if (mutation.type === 'delete' && mutation.id) {
        return prev.filter((j) => j.id !== mutation.id)
      }

      if ((mutation.type === 'insert' || mutation.type === 'update') && mutation.jogo) {
        const exists = prev.some((j) => j.id === mutation.jogo?.id)
        if (exists) {
          return prev.map((j) => (j.id === mutation.jogo?.id ? mutation.jogo : j))
        }
        return [mutation.jogo, ...prev]
      }

      return prev
    })
  }, [])

  return (
    <>
      <Dashboard
        jogos={jogos}
        onNovoJogo={handleNovoJogo}
        onEditJogo={handleEditJogo}
      />

      {modalAberto && (
        <GameForm
          jogo={jogoEditando}
          onSalvar={handleSalvar}
          onDeletar={handleDeletar}
          onFechar={() => setModalAberto(false)}
        />
      )}

      <AIAssistant jogos={jogos} onMutation={handleBotMutation} />
    </>
  )
}
