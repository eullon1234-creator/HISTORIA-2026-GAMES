'use client'

import Image from 'next/image'
import type { Jogo } from '@/types/jogo'
import { StatusBadge } from './StatusBadge'
import { PlatformBadge } from './PlatformBadge'

const PLACEHOLDER = 'https://placehold.co/300x420/1e1b4b/a78bfa?text=Sem+Capa'

interface Props {
  jogo: Jogo
  onEdit?: (jogo: Jogo) => void
}

const STATUS_THEME: Record<
  Jogo['status'],
  { topGlow: string; pillBorder: string; dateBorder: string; dateLabel: string }
> = {
  Jogando: {
    topGlow: 'from-blue-500/30 via-cyan-400/10 to-transparent',
    pillBorder: 'border-cyan-400/40 text-cyan-200',
    dateBorder: 'border-cyan-500/30',
    dateLabel: 'text-cyan-300/90',
  },
  Zerei: {
    topGlow: 'from-emerald-500/30 via-green-400/10 to-transparent',
    pillBorder: 'border-emerald-400/40 text-emerald-200',
    dateBorder: 'border-emerald-500/30',
    dateLabel: 'text-emerald-300/90',
  },
  Pausa: {
    topGlow: 'from-yellow-500/30 via-amber-400/10 to-transparent',
    pillBorder: 'border-yellow-400/40 text-yellow-200',
    dateBorder: 'border-yellow-500/30',
    dateLabel: 'text-yellow-300/90',
  },
  Desisti: {
    topGlow: 'from-red-500/30 via-rose-400/10 to-transparent',
    pillBorder: 'border-rose-400/40 text-rose-200',
    dateBorder: 'border-rose-500/30',
    dateLabel: 'text-rose-300/90',
  },
  'Querendo...': {
    topGlow: 'from-fuchsia-500/30 via-purple-400/10 to-transparent',
    pillBorder: 'border-fuchsia-400/40 text-fuchsia-200',
    dateBorder: 'border-fuchsia-500/30',
    dateLabel: 'text-fuchsia-300/90',
  },
}

function formatNota(value: number | null): string {
  if (value === null || value === undefined) return ''
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatDateBr(value: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return '—'
  return `${day}/${month}/${year}`
}

export function GameCard({ jogo, onEdit }: Props) {
  const nota = jogo.nota_pessoal !== null && jogo.nota_pessoal !== undefined
  const theme = STATUS_THEME[jogo.status] ?? STATUS_THEME['Querendo...']

  return (
    <div
<<<<<<< HEAD
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
                 bg-white/[0.02] border border-white/5
                 shadow-2xl shadow-black/60
                 transition-all duration-500 ease-out
                 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-purple-900/20 hover:bg-white/[0.04]"
=======
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer
                 bg-[#13132a] border border-white/5
                 shadow-lg shadow-black/40
                 transition-all duration-300
                 hover:scale-[1.03] hover:border-fuchsia-500/50 hover:shadow-fuchsia-900/40 hover:shadow-xl"
>>>>>>> be609d2b091311418b95ce3de10281957cb08fbb
      onClick={() => onEdit?.(jogo)}
    >
      {/* Imagem de capa */}
      <div className="relative w-full aspect-2/3 overflow-hidden">
        <Image
          src={jogo.capa_url || PLACEHOLDER}
          alt={jogo.nome_do_jogo}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          unoptimized
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            img.src = PLACEHOLDER
          }}
        />

        <div className={`absolute inset-0 bg-linear-to-t ${theme.topGlow}`} />

        <div className="absolute inset-x-0 top-0 px-2 py-2 bg-linear-to-b from-black/85 via-black/40 to-transparent">
          <div className="flex items-start justify-between gap-2">
            <PlatformBadge plataforma={jogo.plataforma} />

            {nota && (
              <div className="flex items-center justify-center min-w-9 h-9 px-2 rounded-full bg-black/70 backdrop-blur-sm border border-fuchsia-400/50 text-sm font-bold text-fuchsia-200">
                {formatNota(jogo.nota_pessoal)}
              </div>
            )}
          </div>
        </div>

        {/* Overlay gradiente no hover */}
<<<<<<< HEAD
        <div className="absolute inset-0 bg-linear-to-t from-[#05050a] via-transparent to-transparent
                        opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Nota — canto superior direito */}
        {nota && (
          <div className="absolute top-3 right-3 flex items-center justify-center
                          w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md
                          border border-white/10 text-sm font-black text-white shadow-lg shadow-black/40">
            {formatNota(jogo.nota_pessoal)}
          </div>
        )}

        {/* Plataforma — canto superior esquerdo */}
        <div className="absolute top-3 left-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <PlatformBadge plataforma={jogo.plataforma} />
        </div>
        
        {/* Status — Badge flutuante */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
           <StatusBadge status={jogo.status} />
        </div>
=======
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-black/60 border uppercase tracking-wide ${theme.pillBorder}`}>
            Abrir detalhes
          </span>
        </div>

        {jogo.genero && (
          <div className="absolute bottom-2 left-2 max-w-[75%] rounded-md bg-black/55 border border-white/15 px-2 py-1 text-[10px] text-slate-200 backdrop-blur-sm truncate">
            {jogo.genero}
          </div>
        )}
>>>>>>> be609d2b091311418b95ce3de10281957cb08fbb
      </div>

      {/* Informações abaixo da capa */}
      <div className="flex flex-col gap-2 p-4 bg-linear-to-b from-transparent to-black/40 backdrop-blur-xs">
        <p className="text-sm font-bold text-white leading-snug line-clamp-2 min-h-10 group-hover:text-purple-300 transition-colors">
          {jogo.nome_do_jogo}
        </p>

<<<<<<< HEAD
        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2 mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-glow"></span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {formatDateBr(jogo.data_inicio)}
            </span>
          </div>
          {jogo.genero && (
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-slate-500 font-medium truncate max-w-24">
              {jogo.genero}
            </span>
          )}
        </div>
=======
        <div className="flex items-center justify-between flex-wrap gap-1">
          <StatusBadge status={jogo.status} />
        </div>

        <div className="mt-1 space-y-1.5 text-[11px]">
          <div className={`flex items-center justify-between rounded-md border bg-white/5 px-2 py-1.5 ${theme.dateBorder}`}>
            <span className={`inline-flex items-center gap-1 ${theme.dateLabel}`}>🟣 Início</span>
            <strong className="text-slate-200 font-semibold">{formatDateBr(jogo.data_inicio)}</strong>
          </div>

          <div className={`flex items-center justify-between rounded-md border bg-white/5 px-2 py-1.5 ${theme.dateBorder}`}>
            <span className={`inline-flex items-center gap-1 ${theme.dateLabel}`}>✅ Fim</span>
            <strong className="text-slate-200 font-semibold">{formatDateBr(jogo.data_finalizada)}</strong>
          </div>
        </div>
>>>>>>> be609d2b091311418b95ce3de10281957cb08fbb
      </div>
    </div>
  )
}
