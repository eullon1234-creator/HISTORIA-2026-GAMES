'use client'

import { useState, useMemo } from 'react'
import type { Jogo, StatusJogo } from '@/types/jogo'
import { GameCard } from './GameCard'
import { Navbar } from './Navbar'

import versionData from '../version.json'

interface Props {
  jogos: Jogo[]
  onNovoJogo: () => void
  onEditJogo: (jogo: Jogo) => void
}

export function Dashboard({ jogos, onNovoJogo, onEditJogo }: Props) {
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
    <div className="min-h-screen flex flex-col">
      <Navbar
        total={jogosFiltrados.length}
        filtroStatus={filtroStatus}
        filtroPesquisa={filtroPesquisa}
        onFiltroStatus={setFiltroStatus}
        onFiltroPesquisa={setFiltroPesquisa}
        onNovoJogo={onNovoJogo}
      />

      <main className="flex-1 max-w-screen-2xl mx-auto px-6 py-10 w-full">
        <div className="mb-8 flex items-baseline gap-2">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            Sua <span className="text-purple-500">Coleção</span>
          </h1>
          <div className="h-1 w-12 bg-linear-to-r from-purple-600 to-blue-600 rounded-full"></div>
        </div>

        {jogosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 glass rounded-3xl border-white/5 animate-float">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-5xl shadow-inner border border-white/10">
               🎮
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">Onde estão os jogos?</p>
              <p className="text-sm text-slate-500 max-w-xs mt-2">
                {filtroPesquisa
                  ? `Nenhum título encontrado para "${filtroPesquisa}". Tente outros termos.`
                  : 'Sua biblioteca está vazia. Comece a registrar sua história gamer agora mesmo!'}
              </p>
            </div>
            <button
              onClick={onNovoJogo}
              className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              + Adicionar Jogo
            </button>
          </div>
        ) : (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            }}
          >
            {jogosFiltrados.map((jogo) => (
              <GameCard key={jogo.id} jogo={jogo} onEdit={onEditJogo} />
            ))}
          </div>
        )}
      </main>

      <footer className="w-full py-6 px-6 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span>© 2026 History Game Tracker</span>
          </div>
          
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-glow"></span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
              Versão {versionData.version}
            </span>
          </div>
          
          <div className="text-slate-600 text-[9px] font-medium italic">
            Última atualização: {versionData.last_update}
          </div>
        </div>
      </footer>
    </div>
  )
}
