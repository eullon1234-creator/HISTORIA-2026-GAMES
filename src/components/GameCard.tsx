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

export function GameCard({ jogo, onEdit }: Props) {
  const nota = jogo.nota_pessoal !== null && jogo.nota_pessoal !== undefined

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden cursor-pointer
                 bg-[#13132a] border border-white/5
                 shadow-lg shadow-black/40
                 transition-all duration-300
                 hover:scale-[1.04] hover:border-purple-500/50 hover:shadow-purple-900/40 hover:shadow-xl"
      onClick={() => onEdit?.(jogo)}
    >
      {/* Imagem de capa */}
      <div className="relative w-full aspect-2/3 overflow-hidden">
        <Image
          src={jogo.capa_url || PLACEHOLDER}
          alt={jogo.nome_do_jogo}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement
            img.src = PLACEHOLDER
          }}
        />

        {/* Overlay gradiente no hover */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Nota — canto superior direito */}
        {nota && (
          <div className="absolute top-2 right-2 flex items-center justify-center
                          w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm
                          border border-purple-500/50 text-sm font-bold text-purple-300">
            {Number(jogo.nota_pessoal).toFixed(0)}
          </div>
        )}

        {/* Plataforma — canto superior esquerdo */}
        <div className="absolute top-2 left-2">
          <PlatformBadge plataforma={jogo.plataforma} />
        </div>
      </div>

      {/* Informações abaixo da capa */}
      <div className="flex flex-col gap-1.5 p-3">
        <p className="text-sm font-semibold text-slate-100 leading-tight line-clamp-2">
          {jogo.nome_do_jogo}
        </p>

        <div className="flex items-center justify-between flex-wrap gap-1">
          <StatusBadge status={jogo.status} />
          {jogo.genero && (
            <span className="text-xs text-slate-500 truncate max-w-22.5">{jogo.genero}</span>
          )}
        </div>
      </div>
    </div>
  )
}
