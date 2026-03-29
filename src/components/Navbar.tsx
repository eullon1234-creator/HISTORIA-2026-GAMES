'use client'

import { useState } from 'react'
import type { StatusJogo } from '@/types/jogo'

interface Props {
  total: number
  filtroStatus: StatusJogo | 'Todos'
  filtroPesquisa: string
  ordenacao: 'recentes' | 'nome-asc' | 'nota-desc' | 'status'
  onFiltroStatus: (s: StatusJogo | 'Todos') => void
  onFiltroPesquisa: (v: string) => void
  onOrdenacao: (ord: 'recentes' | 'nome-asc' | 'nota-desc' | 'status') => void
  onLimparFiltros: () => void
  onNovoJogo: () => void
  onSair: () => void
}

const STATUS_OPTIONS: (StatusJogo | 'Todos')[] = [
  'Todos', 'Jogando', 'Zerei', 'Pausa', 'Desisti', 'Querendo...',
]

export function Navbar({
  total,
  filtroStatus,
  filtroPesquisa,
  ordenacao,
  onFiltroStatus,
  onFiltroPesquisa,
  onOrdenacao,
  onLimparFiltros,
  onNovoJogo,
  onSair,
}: Props) {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d0d1a]/90 backdrop-blur-md">
      {/* Linha principal */}
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* Logo + contador */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🕹️</span>
          <span className="text-base font-extrabold text-white tracking-wide uppercase leading-none">
            Historia <span className="text-fuchsia-400">2026</span>
          </span>
          <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-fuchsia-900/45 text-fuchsia-300 font-semibold uppercase tracking-wider border border-fuchsia-500/30">
            {total} {total === 1 ? 'Item' : 'Itens'}
          </span>
        </div>

        {/* Busca — cresce no meio */}
        <div className="flex-1 min-w-0">
          <input
            type="search"
            placeholder="Buscar jogo..."
            value={filtroPesquisa}
            onChange={(e) => onFiltroPesquisa(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                       text-sm text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:border-purple-500/60 focus:bg-white/8
                       transition-colors"
          />
        </div>

        {/* Ações do lado direito */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Ordenação — visível só em telas maiores */}
          <select
            value={ordenacao}
            onChange={(e) => onOrdenacao(e.target.value as 'recentes' | 'nome-asc' | 'nota-desc' | 'status')}
            className="hidden sm:block px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-purple-500/60"
          >
            <option value="recentes">Mais recentes</option>
            <option value="nome-asc">Nome (A-Z)</option>
            <option value="nota-desc">Melhor nota</option>
            <option value="status">Status</option>
          </select>

          {/* Botão principal */}
          <button
            onClick={onNovoJogo}
            className="px-3 sm:px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500
                     text-white text-sm font-semibold transition-colors
                     shadow-lg shadow-purple-900/40 whitespace-nowrap"
          >
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ Novo Jogo</span>
          </button>

          {/* Menu extra no mobile / Sair no desktop */}
          <button
            onClick={onSair}
            className="hidden sm:block px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
          >
            Sair
          </button>

          {/* Hamburguer no mobile */}
          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="sm:hidden p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAberto
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Menu expandido no mobile */}
      {menuAberto && (
        <div className="sm:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-3 bg-[#0d0d1a]">
          <div className="flex items-center gap-2">
            <select
              value={ordenacao}
              onChange={(e) => {
                onOrdenacao(e.target.value as 'recentes' | 'nome-asc' | 'nota-desc' | 'status')
                setMenuAberto(false)
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-slate-200 text-sm focus:outline-none"
            >
              <option value="recentes">Mais recentes</option>
              <option value="nome-asc">Nome (A-Z)</option>
              <option value="nota-desc">Melhor nota</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => { onLimparFiltros(); setMenuAberto(false) }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
            >
              Limpar
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-fuchsia-300 font-semibold">
              {total} {total === 1 ? 'item' : 'itens'} encontrados
            </span>
            <button
              onClick={() => { onSair(); setMenuAberto(false) }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Linha de controles extra no desktop */}
      <div className="hidden sm:flex max-w-screen-2xl mx-auto px-4 pb-2 items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onFiltroStatus(s)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${filtroStatus === s
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto shrink-0">
          <button
            onClick={onLimparFiltros}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Filtros de status no mobile — linha horizontal scrollável */}
      <div className="sm:hidden max-w-screen-2xl mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onFiltroStatus(s)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition-colors
              ${filtroStatus === s
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
          >
            {s}
          </button>
        ))}
      </div>
    </header>
  )
}
