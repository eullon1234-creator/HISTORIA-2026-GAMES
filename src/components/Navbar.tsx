'use client'

import type { StatusJogo } from '@/types/jogo'

interface Props {
  total: number
  filtroStatus: StatusJogo | 'Todos'
  filtroPesquisa: string
  onFiltroStatus: (s: StatusJogo | 'Todos') => void
  onFiltroPesquisa: (v: string) => void
  onNovoJogo: () => void
}

const STATUS_OPTIONS: (StatusJogo | 'Todos')[] = [
  'Todos', 'Jogando', 'Zerei', 'Pausa', 'Desisti', 'Querendo...',
]

export function Navbar({
  total,
  filtroStatus,
  filtroPesquisa,
  onFiltroStatus,
  onFiltroPesquisa,
  onNovoJogo,
}: Props) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05050a]/80 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Logo + contador */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/30 group-hover:scale-110 transition-transform">
              <span className="text-xl">🎮</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">
                HISTORY <span className="text-purple-500">2026</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Game Tracker
              </span>
            </div>
          </div>
        </div>

        {/* Busca e Ações */}
        <div className="flex flex-1 items-center gap-4 justify-end">
          <div className="relative flex-1 max-w-md group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar na sua biblioteca..."
              value={filtroPesquisa}
              onChange={(e) => onFiltroPesquisa(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                         text-sm text-slate-200 placeholder:text-slate-600
                         focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.08]
                         transition-all shadow-inner"
            />
          </div>

          <button
            onClick={onNovoJogo}
            className="group px-5 py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 
                       hover:from-purple-500 hover:to-blue-500
                       text-white text-sm font-bold transition-all
                       shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40
                       flex items-center gap-2 active:scale-95"
          >
            <span className="text-lg group-hover:rotate-90 transition-transform inline-block">+</span>
            Novo Jogo
          </button>
        </div>
      </div>

      {/* Filtros de status */}
      <div className="max-w-screen-2xl mx-auto px-6 pb-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onFiltroStatus(s)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold transition-all relative
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
        </div>
        
        <div className="ml-auto flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
           <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
           {total} {total === 1 ? 'Título' : 'Títulos'}
        </div>
      </div>
    </header>
  )
}

