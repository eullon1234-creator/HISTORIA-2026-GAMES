'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Jogo } from '@/types/jogo'
import { Dashboard } from './Dashboard'
import { GameForm } from './GameForm'
import { buscarJogos } from '@/services/jogos'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

interface Props {
  jogosList?: Jogo[]
}

export function AppShell({ jogosList = [] }: Props) {
  const [jogos, setJogos] = useState<Jogo[]>(jogosList)
  const [modalAberto, setModalAberto] = useState(false)
  const [jogoEditando, setJogoEditando] = useState<Jogo | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loadingJogos, setLoadingJogos] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [authActionLoading, setAuthActionLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const carregarJogos = useCallback(async () => {
    setLoadingJogos(true)
    setErro(null)
    try {
      const lista = await buscarJogos()
      setJogos(lista)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar jogos.')
      setJogos([])
    } finally {
      setLoadingJogos(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false)
      setErro('Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.')
      return
    }

    let ativo = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!ativo) return

      const logged = Boolean(data.session)
      setIsLoggedIn(logged)
      setAuthLoading(false)

      if (logged) {
        await carregarJogos()
      }
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const logged = Boolean(session)
      setIsLoggedIn(logged)
      setErro(null)

      if (!logged) {
        setJogos([])
        return
      }

      void carregarJogos()
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [carregarJogos])

  const handleEntrar = useCallback(async () => {
    if (!email.trim() || !senha.trim()) {
      setErro('Informe e-mail e senha.')
      return
    }

    setAuthActionLoading(true)
    setErro(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      setErro(error.message)
    }
    setAuthActionLoading(false)
  }, [email, senha])

  const handleCriarConta = useCallback(async () => {
    if (!email.trim() || !senha.trim()) {
      setErro('Informe e-mail e senha para criar conta.')
      return
    }

    setAuthActionLoading(true)
    setErro(null)
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      setErro(error.message)
    } else {
      setErro('Conta criada. Se a confirmação por e-mail estiver ativa, confirme antes de entrar.')
    }
    setAuthActionLoading(false)
  }, [email, senha])

  const handleSair = useCallback(async () => {
    await supabase.auth.signOut()
    setJogos([])
    setJogoEditando(null)
    setModalAberto(false)
  }, [])

  const handleNovoJogo = useCallback(() => {
    setJogoEditando(null)
    setModalAberto(true)
  }, [])

  const handleEditJogo = useCallback((jogo: Jogo) => {
    setJogoEditando(jogo)
    setModalAberto(true)
  }, [])

  const handleSalvar = useCallback((jogoSalvo: Jogo) => {
    setJogos((prev) => {
      const existe = prev.find((j) => j.id === jogoSalvo.id)
      if (existe) {
        return prev.map((j) => (j.id === jogoSalvo.id ? jogoSalvo : j))
      }
      return [jogoSalvo, ...prev]
    })
    setModalAberto(false)
  }, [])

  const handleDeletar = useCallback((id: string) => {
    setJogos((prev) => prev.filter((j) => j.id !== id))
    setModalAberto(false)
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] text-slate-300">
        Carregando sessão...
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#13132a] p-6 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-bold text-white mb-1">Entrar no Historia 2026</h1>
          <p className="text-sm text-slate-400 mb-6">Faça login para acessar somente seus jogos.</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1 block">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:border-purple-500/60"
                placeholder="voce@email.com"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-1 block">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-100 focus:outline-none focus:border-purple-500/60"
                placeholder="••••••••"
              />
            </div>

            {erro && (
              <p className="text-sm rounded-lg border border-red-500/30 bg-red-900/25 text-red-300 px-3 py-2">
                {erro}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void handleEntrar()}
                disabled={authActionLoading}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold"
              >
                {authActionLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <button
                type="button"
                onClick={() => void handleCriarConta()}
                disabled={authActionLoading}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-60 text-white font-semibold"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dashboard
        jogos={jogos}
        onNovoJogo={handleNovoJogo}
        onEditJogo={handleEditJogo}
        onSair={handleSair}
        carregando={loadingJogos}
        erro={erro}
      />

      {modalAberto && (
        <GameForm
          jogo={jogoEditando}
          onSalvar={handleSalvar}
          onDeletar={handleDeletar}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </>
  )
}
