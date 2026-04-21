'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Jogo, NovoJogo, StatusJogo } from '@/types/jogo'
import { inserirJogo, atualizarJogo, deletarJogo } from '@/services/jogos'

const PLATAFORMAS = ['STEAM', 'STEAM TOOLS', 'HYDRA', 'GAME PASS', 'PS5', 'PS4', 'EPIC', 'GOG', 'OUTRO']
const STATUS_OPTIONS: StatusJogo[] = ['Jogando', 'Zerei', 'Pausa', 'Desisti', 'Querendo...']
const PLACEHOLDER_IMG = 'https://placehold.co/300x420/1e1b4b/a78bfa?text=Sem+Capa'

const ESTADO_INICIAL: NovoJogo = {
  nome_do_jogo: '',
  plataforma: 'STEAM',
  genero: '',
  status: 'Querendo...',
  valor_pago: null,
  data_inicio: null,
  nota_pessoal: null,
  desistiu: false,
  capa_url: null,
}

interface Props {
  jogo?: Jogo | null
  onSalvar: (jogo: Jogo) => void
  onDeletar: (id: string) => void
  onFechar: () => void
}

export function GameForm({ jogo, onSalvar, onDeletar, onFechar }: Props) {
  const [form, setForm] = useState<NovoJogo>(ESTADO_INICIAL)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const editando = !!jogo

  // Preenche formulário ao editar
  useEffect(() => {
    if (jogo) {
      setForm({
        nome_do_jogo: jogo.nome_do_jogo,
        plataforma: jogo.plataforma,
        genero: jogo.genero,
        status: jogo.status,
        valor_pago: jogo.valor_pago,
        data_inicio: jogo.data_inicio,
        nota_pessoal: jogo.nota_pessoal,
        desistiu: jogo.desistiu,
        capa_url: jogo.capa_url,
      })
      setPreviewUrl(jogo.capa_url || null)
    } else {
      setForm(ESTADO_INICIAL)
      setPreviewUrl(null)
    }
  }, [jogo])

  // Fecha ao clicar no overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onFechar()
  }

  // Atualiza campo genérico
  const set = <K extends keyof NovoJogo>(key: K, value: NovoJogo[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'capa_url') setPreviewUrl(value as string | null)
  }

  // Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome_do_jogo.trim()) {
      setErro('O nome do jogo é obrigatório.')
      return
    }
    setLoading(true)
    setErro(null)
    try {
      const dados: NovoJogo = {
        ...form,
        desistiu: form.status === 'Desisti',
      }
      let jogoSalvo: Jogo
      if (editando && jogo) {
        jogoSalvo = await atualizarJogo(jogo.id, dados)
      } else {
        jogoSalvo = await inserirJogo(dados)
      }
      onSalvar(jogoSalvo)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido.')
    } finally {
      setLoading(false)
    }
  }

  // Exclusão
  const handleDeletar = async () => {
    if (!jogo) return
    setLoading(true)
    setErro(null)
    try {
      await deletarJogo(jogo.id)
      onDeletar(jogo.id)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao deletar.')
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md sm:p-4 animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto
                    bg-[#0a0a14] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-purple-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 bg-[#0a0a14]/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                {editando ? '✏️' : '🎮'}
             </div>
             <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
               {editando ? 'Editar Jogo' : 'Novo Jogo'}
             </h2>
          </div>
          <button
            onClick={onFechar}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500
                       hover:text-white hover:bg-white/5 transition-all text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">
          {/* Preview da capa + Infos Básicas */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="relative shrink-0 w-32 md:w-44 aspect-2/3 rounded-2xl overflow-hidden border border-white/10 bg-white/5 group shadow-2xl shadow-black self-center md:self-start">
              <Image
                src={previewUrl || PLACEHOLDER_IMG}
                alt="Preview da capa"
                fill
                className="object-cover transition-transform group-hover:scale-105"
                unoptimized
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex-1 w-full flex flex-col gap-5">
              {/* Nome */}
              <div>
                <label className={labelClass}>Nome do Jogo</label>
                <input
                  type="text"
                  value={form.nome_do_jogo}
                  onChange={(e) => set('nome_do_jogo', e.target.value)}
                  placeholder="Ex: Elden Ring"
                  className={inputClass}
                  required
                />
              </div>

              {/* URL da capa */}
              <div>
                <label className={labelClass}>Link da Capa (URL)</label>
                <input
                  type="url"
                  value={form.capa_url || ''}
                  onChange={(e) => set('capa_url', e.target.value || null)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          {/* Plataforma + Gênero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="relative">
              <label className={labelClass}>Plataforma</label>
              <input
                type="text"
                list="plataformas-sugeridas"
                value={form.plataforma}
                onChange={(e) => set('plataforma', e.target.value.toUpperCase())}
                placeholder="STEAM, PS5..."
                className={inputClass}
              />
              <datalist id="plataformas-sugeridas">
                {PLATAFORMAS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Gênero</label>
              <input
                type="text"
                value={form.genero}
                onChange={(e) => set('genero', e.target.value)}
                placeholder="RPG, Ação..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Progresso</label>
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/[0.02] border border-white/5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 min-w-[90px] px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    form.status === s
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                      : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Nota + Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <div className="glass p-4 sm:p-5 rounded-2xl border-white/5">
              <div className="flex items-center justify-between mb-3">
                <label className={labelClass + ' mb-0'}>Nota</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-purple-400">
                    {form.nota_pessoal ?? '—'}
                  </span>
                  {form.nota_pessoal !== null && (
                    <button
                      type="button"
                      onClick={() => set('nota_pessoal', null)}
                      className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={form.nota_pessoal ?? 0}
                onChange={(e) => set('nota_pessoal', e.target.value === '' ? null : Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="glass p-4 sm:p-5 rounded-2xl border-white/5">
              <label className={labelClass}>Valor Pago (R$)</label>
              <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold">R$</span>
                 <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.valor_pago ?? ''}
                    onChange={(e) => set('valor_pago', e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="0,00"
                    className={inputClass + ' pl-10'}
                  />
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="glass p-4 sm:p-5 rounded-2xl border-white/5">
            <label className={labelClass}>Data de Início</label>
            <input
              type="date"
              value={form.data_inicio || ''}
              onChange={(e) => set('data_inicio', e.target.value || null)}
              className={inputClass}
            />
          </div>

          {/* Erro */}
          {erro && (
            <div className="px-5 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">
              ⚠️ {erro}
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
            {/* Deletar */}
            {editando ? (
              <div className="w-full sm:w-auto">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-colors uppercase tracking-widest"
                  >
                    Excluir Jogo
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2 bg-red-500/10 p-1.5 rounded-2xl border border-red-500/20">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest px-2">Confirma?</span>
                    <button
                      type="button"
                      onClick={handleDeletar}
                      disabled={loading}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black transition-all active:scale-95"
                    >
                      SIM
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-2 rounded-xl text-slate-400 text-[10px] font-bold"
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            ) : <div className="hidden sm:block" />}

            {/* Salvar + Cancelar */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onFechar}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-slate-500 hover:text-white transition-all font-bold text-sm"
              >
                Sair
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] sm:flex-none px-8 py-3 rounded-2xl bg-linear-to-r from-purple-600 to-blue-600 
                           text-white text-sm font-black transition-all shadow-xl shadow-purple-900/40
                           flex items-center justify-center gap-3 active:scale-95"
              >
                {loading && (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {editando ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Utilitários de estilo
const labelClass = 'block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5'
const inputClass = `
  w-full px-4 py-3 rounded-xl
  bg-white/5 border border-white/10
  text-sm text-slate-200
  placeholder:text-slate-700
  focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.08]
  disabled:opacity-40
  transition-all
`
