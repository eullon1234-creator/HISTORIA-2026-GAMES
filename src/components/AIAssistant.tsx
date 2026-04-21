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
  const scrollRef = useRef<HTMLDivElement>(null)

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
    // Scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const placeholder = useMemo(() => {
    if (!jogos.length) return 'Diga algo...'
    return 'Dúvida ou comando gamer?'
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
        className="fixed z-50 bottom-6 right-6 w-14 h-14 rounded-2xl
                   bg-linear-to-br from-purple-600 to-blue-600 hover:scale-110 active:scale-95
                   text-white text-2xl flex items-center justify-center
                   shadow-2xl shadow-purple-900/40 transition-all group"
      >
        <span className="group-hover:rotate-12 transition-transform">
           {open ? '×' : '🤖'}
        </span>
      </button>

      {open && (
        <div className="fixed z-50 bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)]
            h-[500px] bg-[#0a0a14] border border-white/10 rounded-3xl
                        shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                   🤖
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">Bot História</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={clearMemory}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 font-bold uppercase tracking-widest transition-all"
              >
                Reset
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-sm'
                  }`}
                >
                  {msg.content}

                  {msg.role === 'assistant' && (msg.meta?.strategy || msg.meta?.model) && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-slate-500 flex gap-2">
                      <span>{msg.meta?.strategy}</span>
                      <span>•</span>
                      <span>{msg.meta?.model}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white/5 border border-white/5 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none text-xs flex gap-1 items-center">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                 </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                         text-sm text-slate-100 placeholder:text-slate-600
                         focus:outline-none focus:border-purple-500/40 transition-all"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void sendMessage()
                }
              }}
            />

            <button
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50
                         text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-purple-900/20"
            >
              🚀
            </button>
          </div>
        </div>
      )}
    </>
  )
}

