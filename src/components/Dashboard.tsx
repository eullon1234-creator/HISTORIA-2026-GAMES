'use client'

import { useState, useMemo, useEffect } from 'react'
import type { Jogo, StatusJogo } from '@/types/jogo'
import { GameCard } from './GameCard'
import { Navbar } from './Navbar'

type OrdenacaoJogo = 'recentes' | 'nome-asc' | 'nota-desc' | 'status'
const PAGE_SIZE = 24

const STORAGE_STATUS = 'historia2026.filtroStatus'
const STORAGE_PESQUISA = 'historia2026.filtroPesquisa'
const STORAGE_ORDENACAO = 'historia2026.ordenacao'

function initialFiltroStatus(): StatusJogo | 'Todos' {
  if (typeof window === 'undefined') return 'Todos'
  const savedStatus = localStorage.getItem(STORAGE_STATUS)
  if (savedStatus === 'Todos' || savedStatus === 'Jogando' || savedStatus === 'Zerei' || savedStatus === 'Pausa' || savedStatus === 'Desisti' || savedStatus === 'Querendo...') {
    return savedStatus
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
    return savedOrdenacao
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
    <div className="min-h-screen" style={{ background: '#0d0d1a' }}>
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

      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="game-panel rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Em campanha</p>
            <p className="text-2xl font-bold text-cyan-300">{resumo.jogando}</p>
          </div>
          <div className="game-panel rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Concluídos</p>
            <p className="text-2xl font-bold text-emerald-300">{resumo.zerados}</p>
          </div>
          <div className="game-panel rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Backlog</p>
            <p className="text-2xl font-bold text-fuchsia-300">{resumo.backlog}</p>
          </div>
        </section>

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

        {jogosOrdenados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-500">
            <span className="text-6xl">🕹️</span>
            <p className="text-lg font-semibold text-slate-300">Nenhum jogo encontrado</p>
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
            {jogosVisiveis.map((jogo) => (
              <GameCard key={jogo.id} jogo={jogo} onEdit={onEditJogo} />
            ))}
          </div>
        )}

        {jogosOrdenados.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-xs text-slate-500">
              Mostrando {jogosVisiveis.length} de {jogosOrdenados.length} jogos
            </p>

            {hasMore && (
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
              >
                Carregar mais
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
