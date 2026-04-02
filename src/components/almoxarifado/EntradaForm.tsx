'use client'

import { useState, useEffect } from 'react'
import { listarProdutos, registrarEntrada } from '@/services/almoxarifado'
import type { Produto } from '@/types/almoxarifado'

export default function EntradaForm() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    produtoId: '',
    quantidade: '',
    fornecedor: '',
    nf: '',
  })

  useEffect(() => {
    listarProdutos().then((p) => {
      setProdutos(p)
      setLoading(false)
    })
  }, [])

  const produtoSelecionado = produtos.find((p) => p.id === form.produtoId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!form.produtoId || !form.quantidade || !form.fornecedor || !form.nf) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }
    const qty = Number(form.quantidade)
    if (qty <= 0) {
      setErro('A quantidade deve ser maior que zero.')
      return
    }
    setSalvando(true)
    try {
      await registrarEntrada(form.produtoId, qty, form.fornecedor, form.nf)
      setSucesso(true)
      setForm({ produtoId: '', quantidade: '', fornecedor: '', nf: '' })
      setTimeout(() => setSucesso(false), 4000)
      // Recarrega produtos para saldo atualizado
      setProdutos(await listarProdutos())
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao registrar entrada.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Registrar Entrada</h2>
        <p className="text-sm text-slate-400">Registre o recebimento de materiais e atualize o estoque.</p>
      </div>

      {sucesso && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3">
          <span className="text-emerald-400 text-xl">✓</span>
          <div>
            <p className="font-semibold text-emerald-300">Entrada registrada com sucesso!</p>
            <p className="text-xs text-emerald-400/70">O saldo do produto foi atualizado.</p>
          </div>
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-center gap-3">
          <span className="text-red-400 text-xl">✕</span>
          <p className="text-red-300 text-sm">{erro}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5"
      >
        {/* Produto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Produto <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={form.produtoId}
            onChange={(e) => setForm({ ...form, produtoId: e.target.value })}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60 disabled:opacity-50"
          >
            <option value="">{loading ? 'Carregando produtos...' : 'Selecione o produto'}</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.codigo}] {p.descricao}
              </option>
            ))}
          </select>
          {produtoSelecionado && (
            <div className="flex gap-4 text-xs text-slate-400 mt-1">
              <span>Saldo atual: <strong className="text-emerald-400">{produtoSelecionado.saldo} {produtoSelecionado.unidade}</strong></span>
              <span>Local: <strong className="text-violet-300">{produtoSelecionado.localizacao}</strong></span>
            </div>
          )}
        </div>

        {/* Quantidade */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Quantidade <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              required
              type="number"
              min={1}
              placeholder="0"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60"
            />
            {produtoSelecionado && (
              <span className="flex items-center px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-400">
                {produtoSelecionado.unidade}
              </span>
            )}
          </div>
        </div>

        {/* Fornecedor e NF lado a lado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Fornecedor <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Nome do fornecedor"
              value={form.fornecedor}
              onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Nota Fiscal (NF) <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Nº da nota fiscal"
              value={form.nf}
              onChange={(e) => setForm({ ...form, nf: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60"
            />
          </div>
        </div>

        {/* Preview da operação */}
        {produtoSelecionado && form.quantidade && Number(form.quantidade) > 0 && (
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 flex items-center justify-between text-sm">
            <div className="text-slate-400">Saldo após entrada:</div>
            <div className="font-semibold text-violet-300 text-base">
              {produtoSelecionado.saldo} + {form.quantidade} ={' '}
              <span className="text-emerald-400">
                {produtoSelecionado.saldo + Number(form.quantidade)} {produtoSelecionado.unidade}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={salvando}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 py-3 text-sm font-semibold text-white transition-colors"
          >
            {salvando ? 'Registrando...' : 'Confirmar Entrada no Estoque'}
          </button>
        </div>
      </form>
    </div>
  )
}
