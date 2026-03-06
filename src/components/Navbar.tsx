'use client'

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
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0d0d1a]/90 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Logo + contador */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕹️</span>
            <span className="text-lg font-extrabold text-white tracking-wide uppercase">
              Historia <span className="text-fuchsia-400">2026</span>
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-fuchsia-900/45 text-fuchsia-300 font-semibold uppercase tracking-wider border border-fuchsia-500/30">
            {total} {total === 1 ? 'Item' : 'Itens'}
          </span>
        </div>

        {/* Busca */}
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Buscar jogo..."
            value={filtroPesquisa}
            onChange={(e) => onFiltroPesquisa(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                       text-sm text-slate-200 placeholder:text-slate-500
                       focus:outline-none focus:border-purple-500/60 focus:bg-white/8
                       transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={ordenacao}
            onChange={(e) => onOrdenacao(e.target.value as 'recentes' | 'nome-asc' | 'nota-desc' | 'status')}
            className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-slate-200 text-sm focus:outline-none focus:border-purple-500/60"
          >
            <option value="recentes">Mais recentes</option>
            <option value="nome-asc">Nome (A-Z)</option>
            <option value="nota-desc">Melhor nota</option>
            <option value="status">Status</option>
          </select>

          <button
            onClick={onLimparFiltros}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
          >
            Limpar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNovoJogo}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500
                     text-white text-sm font-semibold transition-colors
                     shadow-lg shadow-purple-900/40 whitespace-nowrap"
          >
            + Novo Jogo
          </button>

          <button
            onClick={onSair}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-sm font-semibold transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Filtros de status */}
      <div className="max-w-screen-2xl mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
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
