'use client'

import { useState, useEffect, useRef } from 'react'
import { listarProdutos, registrarSaida } from '@/services/almoxarifado'
import type { Produto } from '@/types/almoxarifado'
import SignaturePad, { type SignaturePadHandle } from './SignaturePad'

export default function RequisicaoForm() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const sigPadRef = useRef<SignaturePadHandle>(null)

  const [form, setForm] = useState({
    produtoId: '',
    quantidade: '',
    localAplicacao: '',
    requisitante: '',
  })

  useEffect(() => {
    listarProdutos().then((p) => {
      setProdutos(p)
      setLoading(false)
    })
  }, [])

  const produtoSelecionado = produtos.find((p) => p.id === form.produtoId)
  const qty = Number(form.quantidade)
  const saldoInsuficiente = !!produtoSelecionado && qty > 0 && qty > produtoSelecionado.saldo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (!form.produtoId || !form.quantidade || !form.localAplicacao || !form.requisitante) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }
    if (qty <= 0) {
      setErro('A quantidade deve ser maior que zero.')
      return
    }
    if (saldoInsuficiente) {
      setErro(`Saldo insuficiente. Disponível: ${produtoSelecionado!.saldo} ${produtoSelecionado!.unidade}`)
      return
    }
    if (sigPadRef.current?.isEmpty()) {
      setErro('A assinatura do requisitante é obrigatória.')
      return
    }

    const assinatura = sigPadRef.current?.toDataURL() ?? ''
    setSalvando(true)
    try {
      await registrarSaida(form.produtoId, qty, form.localAplicacao, form.requisitante, assinatura)
      setSucesso(true)
      setForm({ produtoId: '', quantidade: '', localAplicacao: '', requisitante: '' })
      sigPadRef.current?.clear()
      setTimeout(() => setSucesso(false), 5000)
      setProdutos(await listarProdutos())
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao registrar saída.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Requisição de Saída</h2>
        <p className="text-sm text-slate-400">Ficha de entrega de materiais com assinatura do requisitante.</p>
      </div>

      {sucesso && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-3">
          <span className="text-emerald-400 text-2xl">✓</span>
          <div>
            <p className="font-semibold text-emerald-300">Saída registrada com sucesso!</p>
            <p className="text-xs text-emerald-400/70">Assinatura salva e saldo atualizado.</p>
          </div>
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex items-center gap-3">
          <span className="text-red-400 text-xl">✕</span>
          <p className="text-red-300 text-sm">{erro}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
        {/* Produto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Item <span className="text-red-400">*</span>
          </label>
          <select
            required
            value={form.produtoId}
            onChange={(e) => setForm({ ...form, produtoId: e.target.value, quantidade: '' })}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/60 disabled:opacity-50"
          >
            <option value="">{loading ? 'Carregando...' : 'Selecione o item'}</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id} disabled={p.saldo === 0}>
                [{p.codigo}] {p.descricao} — {p.saldo} {p.unidade} disponível
              </option>
            ))}
          </select>
          {produtoSelecionado && (
            <div className="flex gap-4 text-xs mt-1">
              <span className="text-slate-400">
                Saldo: <strong className={produtoSelecionado.saldo === 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {produtoSelecionado.saldo} {produtoSelecionado.unidade}
                </strong>
              </span>
              <span className="text-slate-400">
                Local: <strong className="text-violet-300">{produtoSelecionado.localizacao}</strong>
              </span>
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
              max={produtoSelecionado?.saldo ?? undefined}
              placeholder="0"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              className={`flex-1 rounded-lg border px-3 py-2.5 text-sm text-white focus:outline-none ${
                saldoInsuficiente
                  ? 'border-red-500/60 bg-red-500/5 focus:border-red-500'
                  : 'border-white/10 bg-white/5 focus:border-violet-500/60'
              }`}
            />
            {produtoSelecionado && (
              <span className="flex items-center px-3 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-400">
                {produtoSelecionado.unidade}
              </span>
            )}
          </div>
          {saldoInsuficiente && (
            <p className="text-xs text-red-400">
              Quantidade excede o saldo disponível ({produtoSelecionado!.saldo} {produtoSelecionado!.unidade})
            </p>
          )}
        </div>

        {/* Local de Aplicação */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Local de Aplicação <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="Ex: Manutenção Setor B, Obra Bloco 3, Linha de Produção..."
            value={form.localAplicacao}
            onChange={(e) => setForm({ ...form, localAplicacao: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60"
          />
          <p className="text-xs text-slate-500">Informe onde exatamente o material será utilizado.</p>
        </div>

        {/* Nome do Requisitante */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Nome do Requisitante <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="Nome completo"
            value={form.requisitante}
            onChange={(e) => setForm({ ...form, requisitante: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/60"
          />
        </div>

        {/* Preview saída */}
        {produtoSelecionado && qty > 0 && !saldoInsuficiente && (
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 flex items-center justify-between text-sm">
            <div className="text-slate-400">Saldo após saída:</div>
            <div className="font-semibold text-base">
              {produtoSelecionado.saldo} − {qty} ={' '}
              <span className={produtoSelecionado.saldo - qty <= produtoSelecionado.estoqueMinimo ? 'text-amber-400' : 'text-emerald-400'}>
                {produtoSelecionado.saldo - qty} {produtoSelecionado.unidade}
              </span>
            </div>
          </div>
        )}

        {/* Assinatura Digital */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Assinatura Digital <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => sigPadRef.current?.clear()}
              className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
            >
              Limpar
            </button>
          </div>
          <div className="rounded-xl border border-dashed border-white/20 p-2">
            <SignaturePad ref={sigPadRef} height={150} />
          </div>
          <p className="text-xs text-slate-500">
            Assine acima usando o mouse ou o dedo (touch). A assinatura será salva junto ao registro.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={salvando || saldoInsuficiente}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 py-3 text-sm font-semibold text-white transition-colors"
          >
            {salvando ? 'Registrando...' : 'Confirmar Saída e Salvar Assinatura'}
          </button>
        </div>
      </form>
    </div>
  )
}
