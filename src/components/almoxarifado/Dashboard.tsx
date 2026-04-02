'use client'

import { useState, useEffect } from 'react'
import { listarProdutos, criarProduto } from '@/services/almoxarifado'
import type { Produto, Unidade } from '@/types/almoxarifado'

const UNIDADES: Unidade[] = ['UN', 'KG', 'M', 'CX', 'PC', 'L']

export default function Dashboard() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState<Omit<Produto, 'id'>>({
    codigo: '',
    descricao: '',
    unidade: 'UN',
    saldo: 0,
    estoqueMinimo: 5,
    localizacao: '',
  })

  const carregar = async () => {
    setLoading(true)
    try {
      setProdutos(await listarProdutos())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtrados = produtos.filter(
    (p) =>
      p.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      p.localizacao.toLowerCase().includes(busca.toLowerCase()),
  )

  const baixoEstoque = produtos.filter((p) => p.saldo <= p.estoqueMinimo)

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.codigo || !form.descricao || !form.localizacao) return
    setSalvando(true)
    try {
      await criarProduto(form)
      setForm({ codigo: '', descricao: '', unidade: 'UN', saldo: 0, estoqueMinimo: 5, localizacao: '' })
      setShowForm(false)
      await carregar()
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alertas de estoque baixo */}
      {baixoEstoque.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-lg">⚠</span>
            <span className="font-semibold text-amber-300">
              {baixoEstoque.length} {baixoEstoque.length === 1 ? 'item' : 'itens'} com estoque baixo
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {baixoEstoque.map((p) => (
              <span
                key={p.id}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs text-amber-300"
              >
                {p.descricao} — {p.saldo} {p.unidade}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Header + busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Estoque Geral</h2>
          <p className="text-sm text-slate-400">{produtos.length} itens cadastrados</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Buscar por código, descrição ou local..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 sm:w-72 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            + Produto
          </button>
        </div>
      </div>

      {/* Formulário novo produto */}
      {showForm && (
        <form
          onSubmit={handleSalvar}
          className="rounded-xl border border-white/10 bg-white/5 p-5 grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <h3 className="col-span-full text-base font-semibold text-violet-300">Cadastrar Produto</h3>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Código *</label>
            <input
              required
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="flex flex-col gap-1 col-span-full md:col-span-1">
            <label className="text-xs text-slate-400">Descrição *</label>
            <input
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Unidade</label>
            <select
              value={form.unidade}
              onChange={(e) => setForm({ ...form, unidade: e.target.value as Unidade })}
              className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
            >
              {UNIDADES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Saldo Inicial</label>
            <input
              type="number"
              min={0}
              value={form.saldo}
              onChange={(e) => setForm({ ...form, saldo: Number(e.target.value) })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Estoque Mínimo</label>
            <input
              type="number"
              min={0}
              value={form.estoqueMinimo}
              onChange={(e) => setForm({ ...form, estoqueMinimo: Number(e.target.value) })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Localização (Prateleira/Corredor) *</label>
            <input
              required
              placeholder="Ex: A-03 / Corredor 2"
              value={form.localizacao}
              onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="col-span-full flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {salvando ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      )}

      {/* Tabela */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">UN</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Localização</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Carregando estoque...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {busca ? 'Nenhum item encontrado para a busca.' : 'Nenhum produto cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => {
                  const baixo = p.saldo <= p.estoqueMinimo
                  return (
                    <tr key={p.id} className={`transition-colors hover:bg-white/5 ${baixo ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-4 py-3 font-mono text-violet-300">{p.codigo}</td>
                      <td className="px-4 py-3 text-white font-medium">{p.descricao}</td>
                      <td className="px-4 py-3 text-slate-400">{p.unidade}</td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${baixo ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.saldo.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.localizacao}</td>
                      <td className="px-4 py-3 text-center">
                        {baixo ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
