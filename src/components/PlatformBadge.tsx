import type { Plataforma } from '@/types/jogo'

const config: Record<string, { label: string; color: string }> = {
  'STEAM':     { label: 'Steam',     color: 'bg-slate-700 text-slate-200' },
  'STEAM TOOLS': { label: 'Steam Tools', color: 'bg-indigo-900 text-indigo-300' },
  'HYDRA':     { label: 'Hydra',     color: 'bg-cyan-900 text-cyan-300' },
  'GAME PASS': { label: 'Game Pass', color: 'bg-green-900 text-green-300' },
  'PS5':       { label: 'PS5',       color: 'bg-blue-900 text-blue-300' },
  'PS4':       { label: 'PS4',       color: 'bg-blue-900 text-blue-300' },
  'EPIC':      { label: 'Epic',      color: 'bg-gray-800 text-gray-200' },
  'GOG':       { label: 'GOG',       color: 'bg-rose-900 text-rose-300' },
  'OUTRO':     { label: 'Outro',     color: 'bg-zinc-700 text-zinc-300' },
}

export function PlatformBadge({ plataforma }: { plataforma: Plataforma | string }) {
  const c = config[plataforma] ?? { label: plataforma, color: 'bg-zinc-700 text-zinc-300' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${c.color}`}>
      {c.label}
    </span>
  )
}
