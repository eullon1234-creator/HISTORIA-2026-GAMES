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
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05050a]/80 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-4">
        
        {/* Top Row: Logo and Mobile Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-110 transition-transform">
              <span className="text-lg md:text-xl">🎮</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black text-white tracking-tighter leading-none">
                HISTORY <span className="text-purple-500">2026</span>
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Game Tracker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onNovoJogo}
              className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 active:scale-95 transition-all"
            >
              <span className="text-xl font-bold">+</span>
            </button>
            <button
              onClick={onSair}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center active:scale-95 transition-all"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Search and Desktop Actions */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
          <div className="relative w-full md:flex-1 group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar jogo..."
              value={filtroPesquisa}
              onChange={(e) => onFiltroPesquisa(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                         text-sm text-slate-200 placeholder:text-slate-600
                         focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.08]
                         transition-all shadow-inner"
            />
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
             <select
                value={ordenacao}
                onChange={(e) => onOrdenacao(e.target.value as any)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold focus:outline-none focus:border-purple-500/40 transition-all cursor-pointer"
              >
                <option value="recentes">Mais recentes</option>
                <option value="nome-asc">Nome (A-Z)</option>
                <option value="nota-desc">Melhor nota</option>
                <option value="status">Status</option>
              </select>

              <button
                onClick={onNovoJogo}
                className="group px-6 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 
                           hover:from-purple-500 hover:to-blue-500
                           text-white text-sm font-bold transition-all
                           shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40
                           flex items-center gap-2 active:scale-95"
              >
                <span className="text-lg group-hover:rotate-90 transition-transform inline-block leading-none">+</span>
                <span>Novo Jogo</span>
              </button>

              <button
                onClick={onSair}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
                title="Sair"
              >
                🚪
              </button>
          </div>
          
          {/* Mobile Order Select (below search) */}
          <div className="md:hidden w-full">
            <select
              value={ordenacao}
              onChange={(e) => onOrdenacao(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold focus:outline-none focus:border-purple-500/40 transition-all"
            >
              <option value="recentes">Ordenar por: Recentes</option>
              <option value="nome-asc">Ordenar por: Nome (A-Z)</option>
              <option value="nota-desc">Ordenar por: Melhor nota</option>
              <option value="status">Ordenar por: Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 pb-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onFiltroStatus(s)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[11px] md:text-xs font-bold transition-all relative
                ${filtroStatus === s
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                }`}
            >
              {s}
              {filtroStatus === s && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500 shadow-glow" />
              )}
            </button>
          ))}
          
          <div className="w-px h-4 bg-white/5 mx-1" />
          
          <button
            onClick={onLimparFiltros}
            className="text-[10px] px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-400 font-black uppercase tracking-widest transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  )
}
