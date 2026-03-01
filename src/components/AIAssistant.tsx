'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Jogo } from '@/types/jogo'

type Message = {
  role: 'user' | 'assistant'
  content: string
  meta?: {
    strategy?: 'fast' | 'smart'
    provider?: 'openai' | 'gemini'
    model?: string
  }
}

type BotMutation = {
  type: 'insert' | 'update' | 'delete'
  jogo?: Jogo
  id?: string
}

interface Props {
  jogos: Jogo[]
  onMutation?: (mutation: BotMutation) => void
}

const BOT_STORAGE_KEY = 'historia2026.bot.messages.v1'

const DEFAULT_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: [
      'Sou seu bot gamer 🤖. Posso resumir progresso, gastos e sugerir o próximo jogo.',
      'Também executo ações reais no catálogo com comandos:',
      '/status "Nome do Jogo" Zerei',
      '/nota "Nome do Jogo" 9.5',
      '/plataforma "Nome do Jogo" SWITCH',
      '/delete "Nome do Jogo"',
      '/add nome="Hades" plataforma=STEAM status=Jogando nota=9.0',
      'Também entende frase natural: "muda plataforma de Katana Zero para SWITCH".',
      'Digite /help para ver tudo.',
    ].join('\n'),
  },
]

export function AIAssistant({ jogos, onMutation }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const loadedRef = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BOT_STORAGE_KEY)
      if (!raw) {
        loadedRef.current = true
        return
      }

      const parsed = JSON.parse(raw) as Message[]
      if (!Array.isArray(parsed) || !parsed.length) {
        loadedRef.current = true
        return
      }

      const normalized = parsed.filter(
        (msg) => msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string'
      )

      if (normalized.length) {
        setMessages(normalized)
      }
    } catch {
      setMessages(DEFAULT_MESSAGES)
    } finally {
      loadedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!loadedRef.current) return
    try {
      const limited = messages.slice(-120)
      localStorage.setItem(BOT_STORAGE_KEY, JSON.stringify(limited))
    } catch {
      // ignora limite de storage
    }
  }, [messages])

  const placeholder = useMemo(() => {
    if (!jogos.length) return 'Ex: me ajuda a organizar meu catálogo'
    return 'Ex: qual jogo eu deveria zerar agora?'
  }, [jogos.length])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          jogos,
        }),
      })

      const data = await response.json()
      const reply = data?.reply ?? 'Não consegui responder agora.'

      if (data?.mutation && onMutation) {
        onMutation(data.mutation as BotMutation)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          meta: {
            strategy: data?.strategy,
            provider: data?.provider,
            model: data?.model,
          },
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão com o bot.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearMemory = () => {
    setMessages(DEFAULT_MESSAGES)
    try {
      localStorage.removeItem(BOT_STORAGE_KEY)
    } catch {
      // noop
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed z-50 bottom-5 right-5 px-4 py-3 rounded-full
                   bg-purple-600 hover:bg-purple-500 text-white font-semibold
                   shadow-xl shadow-purple-900/50 transition-colors"
      >
        {open ? 'Fechar bot' : 'Bot IA'}
      </button>

      {open && (
        <div className="fixed z-50 bottom-20 right-5 w-90 max-w-[calc(100vw-2rem)]
            h-130 bg-[#13132a] border border-white/10 rounded-2xl
                        shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-[#181834]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Assistente Gamer IA</h3>
                <p className="text-xs text-slate-400">Resumo, recomendação e ações reais no catálogo</p>
              </div>
              <button
                type="button"
                onClick={clearMemory}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              >
                Limpar memória
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`max-w-[90%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'ml-auto bg-purple-600 text-white'
                    : 'bg-white/5 text-slate-200'
                }`}
              >
                {msg.content}

                {msg.role === 'assistant' && (msg.meta?.strategy || msg.meta?.model) && (
                  <div className="mt-1 text-[10px] text-slate-400">
                    {msg.meta?.strategy ? `modo: ${msg.meta.strategy}` : 'modo: n/a'}
                    {msg.meta?.provider ? ` • provider: ${msg.meta.provider}` : ''}
                    {msg.meta?.model ? ` • modelo: ${msg.meta.model}` : ''}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="bg-white/5 text-slate-300 max-w-[80%] px-3 py-2 rounded-xl text-sm">
                Pensando...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={placeholder}
              rows={2}
              className="flex-1 resize-none px-3 py-2 rounded-lg bg-white/5 border border-white/10
                         text-sm text-slate-100 placeholder:text-slate-500
                         focus:outline-none focus:border-purple-500/60"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void sendMessage()
                }
              }}
            />

            <button
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/60
                         text-white text-sm font-semibold transition-colors disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
