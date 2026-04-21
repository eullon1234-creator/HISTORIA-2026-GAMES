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

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
                 bg-white/[0.02] border border-white/5
                 shadow-2xl shadow-black/60
                 transition-all duration-500 ease-out
                 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-purple-900/20 hover:bg-white/[0.04]"
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

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-linear-to-t from-[#05050a] via-transparent to-transparent
                        opacity-60 md:opacity-40 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Nota — canto superior direito */}
        {nota && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center
                          w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-black/60 backdrop-blur-md
                          border border-white/10 text-xs md:text-sm font-black text-white shadow-lg shadow-black/40">
            {formatNota(jogo.nota_pessoal)}
          </div>
        )}

        {/* Plataforma — canto superior esquerdo (Sempre visível no mobile) */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300 scale-90 md:scale-100 origin-top-left">
          <PlatformBadge plataforma={jogo.plataforma} />
        </div>
        
        {/* Status — Badge flutuante */}
        <div className="absolute bottom-2 left-2 right-2 md:bottom-3 md:left-3 md:right-3 flex justify-between items-end">
           <StatusBadge status={jogo.status} />
        </div>
      </div>

      {/* Informações abaixo da capa */}
      <div className="flex flex-col gap-1.5 md:gap-2 p-3 md:p-4 bg-linear-to-b from-transparent to-black/40 backdrop-blur-xs">
        <p className="text-xs md:text-sm font-bold text-white leading-tight md:leading-snug line-clamp-2 min-h-8 md:min-h-10 group-hover:text-purple-300 transition-colors">
          {jogo.nome_do_jogo}
        </p>

        <div className="flex items-center justify-between gap-1 border-t border-white/5 pt-2 mt-auto">
          <div className="flex items-center gap-1">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-purple-500 shadow-glow"></span>
            <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {formatDateBr(jogo.data_inicio)}
            </span>
          </div>
          {jogo.genero && (
            <span className="text-[8px] md:text-[10px] bg-white/5 px-1.5 py-0.5 rounded-md text-slate-600 font-medium truncate max-w-16 md:max-w-24">
              {jogo.genero}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
