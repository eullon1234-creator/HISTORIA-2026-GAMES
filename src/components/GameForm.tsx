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
  data_finalizada: null,
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
        data_finalizada: jogo.data_finalizada,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
                    bg-[#13132a] border border-white/10 rounded-2xl shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#13132a] border-b border-white/10">
          <h2 className="text-lg font-bold text-white">
            {editando ? '✏️ Editar Jogo' : '🎮 Adicionar Novo Jogo'}
          </h2>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                       hover:text-white hover:bg-white/10 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Preview da capa */}
          <div className="flex gap-5 items-start">
            <div className="relative shrink-0 w-28 h-40 rounded-xl overflow-hidden border border-white/10 bg-[#1e1b4b]">
              <Image
                src={previewUrl || PLACEHOLDER_IMG}
                alt="Preview da capa"
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMG
                }}
              />
            </div>

            <div className="flex-1 flex flex-col gap-3">
              {/* Nome */}
              <div>
                <label className={labelClass}>Nome do Jogo *</label>
                <input
                  type="text"
                  value={form.nome_do_jogo}
                  onChange={(e) => set('nome_do_jogo', e.target.value)}
                  placeholder="Ex: God of War Ragnarök"
                  className={inputClass}
                  required
                />
              </div>

              {/* URL da capa */}
              <div>
                <label className={labelClass}>URL da Capa</label>
                <input
                  type="url"
                  value={form.capa_url || ''}
                  onChange={(e) => set('capa_url', e.target.value || null)}
                  placeholder="https://exemplo.com/capa.jpg"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Plataforma + Gênero */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Plataforma</label>
              <input
                type="text"
                list="plataformas-sugeridas"
                value={form.plataforma}
                onChange={(e) => set('plataforma', e.target.value.toUpperCase())}
                placeholder="Ex: STEAM, HYDRA, SWITCH, RETROARCH..."
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
                placeholder="Ex: RPG, Ação, Aventura..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    form.status === s
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-transparent border-white/15 text-slate-400 hover:border-white/30 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Nota + Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Nota Pessoal
                <span className="ml-1 text-slate-500 font-normal">(0–10)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={form.nota_pessoal ?? 0}
                  onChange={(e) => set('nota_pessoal', e.target.value === '' ? null : Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="w-8 text-center text-sm font-bold text-purple-300">
                  {form.nota_pessoal ?? '–'}
                </span>
                {form.nota_pessoal !== null && (
                  <button
                    type="button"
                    onClick={() => set('nota_pessoal', null)}
                    className="text-xs text-slate-500 hover:text-slate-300"
                  >
                    limpar
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Valor Pago (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.valor_pago ?? ''}
                onChange={(e) => set('valor_pago', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="0,00"
                className={inputClass}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Data de Início</label>
              <input
                type="date"
                value={form.data_inicio || ''}
                onChange={(e) => set('data_inicio', e.target.value || null)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Data Finalizada</label>
              <input
                type="date"
                value={form.data_finalizada || ''}
                onChange={(e) => set('data_finalizada', e.target.value || null)}
                className={inputClass}
                disabled={form.status !== 'Zerei'}
              />
              {form.status !== 'Zerei' && (
                <p className="text-xs text-slate-600 mt-1">Disponível somente com status &quot;Zerei&quot;</p>
              )}
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="px-4 py-3 rounded-lg bg-red-900/40 border border-red-500/40 text-red-300 text-sm">
              ⚠️ {erro}
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            {/* Deletar */}
            {editando && (
              <div className="flex items-center gap-2">
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors"
                  >
                    Excluir jogo
                  </button>
                ) : (
                  <>
                    <span className="text-xs text-red-400">Tem certeza?</span>
                    <button
                      type="button"
                      onClick={handleDeletar}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Excluindo...' : 'Confirmar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            )}

            {!editando && <div />}

            {/* Salvar + Cancelar */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800
                           text-white text-sm font-semibold transition-colors shadow-lg shadow-purple-900/40
                           disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {loading ? 'Salvando...' : editando ? 'Salvar alterações' : 'Adicionar jogo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Utilitários de estilo
const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5'
const inputClass = `
  w-full px-3 py-2 rounded-lg
  bg-white/5 border border-white/10
  text-sm text-slate-200
  placeholder:text-slate-600
  focus:outline-none focus:border-purple-500/60 focus:bg-white/8
  disabled:opacity-40 disabled:cursor-not-allowed
  transition-colors
`
