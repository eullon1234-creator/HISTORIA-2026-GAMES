'use client'

import { useMemo, useState } from 'react'
import type { Jogo } from '@/types/jogo'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  jogos: Jogo[]
}

export function AIAssistant({ jogos }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Sou seu bot gamer 🤖. Posso resumir progresso, gastos e sugerir o próximo jogo.',
    },
  ])

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

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão com o bot.' },
      ])
    } finally {
      setLoading(false)
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
        <div className="fixed z-50 bottom-20 right-5 w-[360px] max-w-[calc(100vw-2rem)]
                        h-[520px] bg-[#13132a] border border-white/10 rounded-2xl
                        shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 bg-[#181834]">
            <h3 className="text-sm font-bold text-white">Assistente Gamer IA</h3>
            <p className="text-xs text-slate-400">Resumo, recomendação e estratégia do catálogo</p>
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
