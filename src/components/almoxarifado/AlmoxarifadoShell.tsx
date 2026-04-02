'use client'

import { useState } from 'react'
import type { Modulo } from '@/types/almoxarifado'
import Dashboard from './Dashboard'
import EntradaForm from './EntradaForm'
import RequisicaoForm from './RequisicaoForm'
import Historico from './Historico'

const MODULOS: { id: Modulo; label: string; icon: string; desc: string }[] = [
  { id: 'dashboard', label: 'Estoque', icon: '▦', desc: 'Visão geral do inventário' },
  { id: 'entrada', label: 'Entrada', icon: '↑', desc: 'Registrar recebimento' },
  { id: 'requisicao', label: 'Requisição', icon: '↓', desc: 'Solicitar saída de material' },
  { id: 'historico', label: 'Histórico', icon: '≡', desc: 'Movimentações e relatórios' },
]

export default function AlmoxarifadoShell() {
  const [modulo, setModulo] = useState<Modulo>('dashboard')

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-[#e2e8f0]">
      {/* Top bar */}
      <header className="border-b border-white/8 bg-black/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-sm">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-none">Almoxarifado</div>
              <div className="text-xs text-slate-500 leading-none mt-0.5">Controle de Estoque</div>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden sm:flex ml-6 gap-1">
            {MODULOS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModulo(m.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  modulo === m.id
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs opacity-70">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Nav mobile */}
      <div className="sm:hidden border-b border-white/8 bg-black/20">
        <div className="flex overflow-x-auto px-4 py-2 gap-2 no-scrollbar">
          {MODULOS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModulo(m.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                modulo === m.id
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <span className="opacity-70">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {modulo === 'dashboard' && <Dashboard />}
        {modulo === 'entrada' && <EntradaForm />}
        {modulo === 'requisicao' && <RequisicaoForm />}
        {modulo === 'historico' && <Historico />}
      </main>
    </div>
  )
}
