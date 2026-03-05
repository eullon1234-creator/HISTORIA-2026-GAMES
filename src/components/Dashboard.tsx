'use client'

import { useState, useMemo } from 'react'
import type { Jogo, StatusJogo } from '@/types/jogo'
import { GameCard } from './GameCard'
import { Navbar } from './Navbar'

interface Props {
  jogos: Jogo[]
  onNovoJogo: () => void
  onEditJogo: (jogo: Jogo) => void
  onSair: () => void
  carregando?: boolean
  erro?: string | null
}

export function Dashboard({ jogos, onNovoJogo, onEditJogo, onSair, carregando = false, erro = null }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<StatusJogo | 'Todos'>('Todos')
  const [filtroPesquisa, setFiltroPesquisa] = useState('')

  const jogosFiltrados = useMemo(() => {
    return jogos.filter((j) => {
      const matchStatus = filtroStatus === 'Todos' || j.status === filtroStatus
      const matchPesquisa = j.nome_do_jogo
        .toLowerCase()
        .includes(filtroPesquisa.toLowerCase())
      return matchStatus && matchPesquisa
    })
  }, [jogos, filtroStatus, filtroPesquisa])

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1a' }}>
      <Navbar
        total={jogosFiltrados.length}
        filtroStatus={filtroStatus}
        filtroPesquisa={filtroPesquisa}
        onFiltroStatus={setFiltroStatus}
        onFiltroPesquisa={setFiltroPesquisa}
        onNovoJogo={onNovoJogo}
        onSair={onSair}
      />

      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        {carregando && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm">
            Carregando jogos...
          </div>
        )}

        {erro && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-sm">
            {erro}
          </div>
        )}

        {jogosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-500">
            <span className="text-5xl">🎮</span>
            <p className="text-lg font-semibold">Nenhum jogo encontrado</p>
            <p className="text-sm">
              {filtroPesquisa
                ? `Sem resultados para "${filtroPesquisa}"`
                : 'Adicione seu primeiro jogo!'}
            </p>
            <button
              onClick={onNovoJogo}
              className="mt-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              + Adicionar Jogo
            </button>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            }}
          >
            {jogosFiltrados.map((jogo) => (
              <GameCard key={jogo.id} jogo={jogo} onEdit={onEditJogo} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
