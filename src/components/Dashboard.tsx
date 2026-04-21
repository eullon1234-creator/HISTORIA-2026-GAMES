'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Jogo, StatusJogo } from '@/types/jogo'
import { GameCard } from './GameCard'
import { Navbar } from './Navbar'
import versionData from '../version.json'

type OrdenacaoJogo = 'recentes' | 'nome-asc' | 'nota-desc' | 'status'
const PAGE_SIZE = 24

const STORAGE_STATUS = 'historia2026.filtroStatus'
const STORAGE_PESQUISA = 'historia2026.filtroPesquisa'
const STORAGE_ORDENACAO = 'historia2026.ordenacao'

function initialFiltroStatus(): StatusJogo | 'Todos' {
  if (typeof window === 'undefined') return 'Todos'
  const savedStatus = localStorage.getItem(STORAGE_STATUS)
  if (savedStatus === 'Todos' || savedStatus === 'Jogando' || savedStatus === 'Zerei' || savedStatus === 'Pausa' || savedStatus === 'Desisti' || savedStatus === 'Querendo...') {
    return savedStatus as StatusJogo | 'Todos'
  }
  return 'Todos'
}

function initialFiltroPesquisa(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(STORAGE_PESQUISA) ?? ''
}

function initialOrdenacao(): OrdenacaoJogo {
  if (typeof window === 'undefined') return 'recentes'
  const savedOrdenacao = localStorage.getItem(STORAGE_ORDENACAO)
  if (savedOrdenacao === 'recentes' || savedOrdenacao === 'nome-asc' || savedOrdenacao === 'nota-desc' || savedOrdenacao === 'status') {
    return savedOrdenacao as OrdenacaoJogo
  }
  return 'recentes'
}

interface Props {
  jogos: Jogo[]
  onNovoJogo: () => void
  onEditJogo: (jogo: Jogo) => void
  onSair: () => void
  carregando?: boolean
  erro?: string | null
}

export function Dashboard({ jogos, onNovoJogo, onEditJogo, onSair, carregando = false, erro = null }: Props) {
  const [filtroStatus, setFiltroStatus] = useState<StatusJogo | 'Todos'>(() => initialFiltroStatus())
  const [filtroPesquisa, setFiltroPesquisa] = useState(() => initialFiltroPesquisa())
  const [ordenacao, setOrdenacao] = useState<OrdenacaoJogo>(() => initialOrdenacao())
  const [page, setPage] = useState(1)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STATUS, filtroStatus)
      localStorage.setItem(STORAGE_PESQUISA, filtroPesquisa)
      localStorage.setItem(STORAGE_ORDENACAO, ordenacao)
    } catch {
      // ignora falha de storage
    }
  }, [filtroStatus, filtroPesquisa, ordenacao])

  const jogosFiltrados = useMemo(() => {
    return jogos.filter((j) => {
      const matchStatus = filtroStatus === 'Todos' || j.status === filtroStatus
      const matchPesquisa = j.nome_do_jogo
        .toLowerCase()
        .includes(filtroPesquisa.toLowerCase())
      return matchStatus && matchPesquisa
    })
  }, [jogos, filtroStatus, filtroPesquisa])

  const jogosOrdenados = useMemo(() => {
    const lista = [...jogosFiltrados]

    switch (ordenacao) {
      case 'nome-asc':
        return lista.sort((a, b) => a.nome_do_jogo.localeCompare(b.nome_do_jogo, 'pt-BR'))
      case 'nota-desc':
        return lista.sort((a, b) => (b.nota_pessoal ?? -1) - (a.nota_pessoal ?? -1))
      case 'status':
        return lista.sort((a, b) => a.status.localeCompare(b.status, 'pt-BR'))
      case 'recentes':
      default:
        return lista.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
          return bTime - aTime
        })
    }
  }, [jogosFiltrados, ordenacao])

  const resumo = useMemo(() => {
    const jogando = jogos.filter((j) => j.status === 'Jogando').length
    const zerados = jogos.filter((j) => j.status === 'Zerei').length
    const backlog = jogos.filter((j) => j.status === 'Querendo...').length
    return { jogando, zerados, backlog }
  }, [jogos])

  const visibleCount = page * PAGE_SIZE

  const jogosVisiveis = useMemo(() => {
    return jogosOrdenados.slice(0, visibleCount)
  }, [jogosOrdenados, visibleCount])

  const hasMore = jogosOrdenados.length > jogosVisiveis.length

  const handleFiltroStatus = (status: StatusJogo | 'Todos') => {
    setFiltroStatus(status)
    setPage(1)
  }

  const handleFiltroPesquisa = (pesquisa: string) => {
    setFiltroPesquisa(pesquisa)
    setPage(1)
  }

  const handleOrdenacao = (ord: OrdenacaoJogo) => {
    setOrdenacao(ord)
    setPage(1)
  }

  const limparFiltros = () => {
    setFiltroStatus('Todos')
    setFiltroPesquisa('')
    setOrdenacao('recentes')
    setPage(1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#05050a]">
      <Navbar
        total={jogosOrdenados.length}
        filtroStatus={filtroStatus}
        filtroPesquisa={filtroPesquisa}
        ordenacao={ordenacao}
        onFiltroStatus={handleFiltroStatus}
        onFiltroPesquisa={handleFiltroPesquisa}
        onOrdenacao={handleOrdenacao}
        onLimparFiltros={limparFiltros}
        onNovoJogo={onNovoJogo}
        onSair={onSair}
      />

      <main className="flex-1 max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-10 w-full">
        {/* Painel de Resumo - Mais compacto no mobile */}
        <section className="mb-8 md:mb-10 grid grid-cols-3 gap-3 md:gap-6">
          <div className="glass rounded-xl md:rounded-2xl px-3 py-3 md:px-6 md:py-5 border-white/5 bg-cyan-500/5 text-center sm:text-left">
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 md:mb-1">Jogando</p>
            <p className="text-xl md:text-3xl font-black text-cyan-400 tracking-tighter">{resumo.jogando}</p>
          </div>
          <div className="glass rounded-xl md:rounded-2xl px-3 py-3 md:px-6 md:py-5 border-white/5 bg-emerald-500/5 text-center sm:text-left">
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 md:mb-1">Zerados</p>
            <p className="text-xl md:text-3xl font-black text-emerald-400 tracking-tighter">{resumo.zerados}</p>
          </div>
          <div className="glass rounded-xl md:rounded-2xl px-3 py-3 md:px-6 md:py-5 border-white/5 bg-fuchsia-500/5 text-center sm:text-left">
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 md:mb-1">Backlog</p>
            <p className="text-xl md:text-3xl font-black text-fuchsia-400 tracking-tighter">{resumo.backlog}</p>
          </div>
        </section>

        <div className="mb-6 md:mb-8 flex items-baseline gap-2">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
            Sua <span className="text-purple-500">Coleção</span>
          </h1>
          <div className="h-1 w-8 md:w-12 bg-linear-to-r from-purple-600 to-blue-600 rounded-full"></div>
        </div>

        {carregando && (
          <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 text-xs md:text-sm font-bold flex items-center gap-3">
            <span className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            Sincronizando biblioteca...
          </div>
        )}

        {erro && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs md:text-sm font-bold">
            ⚠️ {erro}
          </div>
        )}

        {jogosOrdenados.length === 0 && !carregando ? (
          <div className="flex flex-col items-center justify-center py-20 md:py-40 gap-6 glass rounded-3xl border-white/5 animate-float mx-2">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/5 flex items-center justify-center text-4xl md:text-5xl shadow-inner border border-white/10">
               🎮
            </div>
            <div className="text-center px-6">
              <p className="text-lg md:text-xl font-bold text-white">Nenhum jogo encontrado</p>
              <p className="text-xs md:text-sm text-slate-500 max-w-xs mt-2 mx-auto">
                {filtroPesquisa
                  ? `Não encontramos resultados para "${filtroPesquisa}".`
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
            className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          >
            {jogosVisiveis.map((jogo) => (
              <GameCard key={jogo.id} jogo={jogo} onEdit={onEditJogo} />
            ))}
          </div>
        )}

        {jogosOrdenados.length > 0 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              {jogosVisiveis.length} de {jogosOrdenados.length} títulos
            </p>

            {hasMore && (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="w-full sm:w-auto px-10 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-black transition-all active:scale-95 shadow-xl"
              >
                Carregar Mais
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="w-full py-6 px-4 md:px-6 border-t border-white/5 bg-black/20 backdrop-blur-sm mt-auto">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <span>© 2026 History Game Tracker</span>
          </div>
          
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-glow"></span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
              Versão {versionData.version}
            </span>
          </div>
          
          <div className="text-slate-600 text-[9px] font-medium italic">
            Atualizado em: {versionData.last_update}
          </div>
        </div>
      </footer>
    </div>
  )
}
