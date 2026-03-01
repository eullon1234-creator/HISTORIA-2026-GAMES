import type { StatusJogo } from '@/types/jogo'

const config: Record<StatusJogo, { label: string; bg: string; text: string; dot: string }> = {
  'Zerei':       { label: 'Zerei',      bg: 'bg-emerald-900/60', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  'Jogando':     { label: 'Jogando',    bg: 'bg-blue-900/60',    text: 'text-blue-300',    dot: 'bg-blue-400'    },
  'Pausa':       { label: 'Pausa',      bg: 'bg-yellow-900/60',  text: 'text-yellow-300',  dot: 'bg-yellow-400'  },
  'Desisti':     { label: 'Desisti',    bg: 'bg-red-900/60',     text: 'text-red-300',     dot: 'bg-red-400'     },
  'Querendo...': { label: 'Querendo...', bg: 'bg-purple-900/60', text: 'text-purple-300',  dot: 'bg-purple-400'  },
}

export function StatusBadge({ status }: { status: StatusJogo }) {
  const c = config[status] ?? config['Querendo...']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
