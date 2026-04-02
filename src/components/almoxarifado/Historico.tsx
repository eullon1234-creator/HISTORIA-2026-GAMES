'use client'

import { useState, useEffect, useMemo } from 'react'
import { listarMovimentacoes } from '@/services/almoxarifado'
import type { Movimentacao } from '@/types/almoxarifado'

type FiltroTipo = 'todos' | 'entrada' | 'saida'

export default function Historico() {
  const [movs, setMovs] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos')
  const [busca, setBusca] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [assinaturaSelecionada, setAssinaturaSelecionada] = useState<string | null>(null)

  useEffect(() => {
    listarMovimentacoes().then((m) => {
      setMovs(m)
      setLoading(false)
    })
  }, [])

  const filtrados = useMemo(() => {
    return movs.filter((m) => {
      if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false
      if (
        busca &&
        !m.produtoDescricao.toLowerCase().includes(busca.toLowerCase()) &&
        !m.produtoCodigo.toLowerCase().includes(busca.toLowerCase()) &&
        !(m.requisitante ?? '').toLowerCase().includes(busca.toLowerCase()) &&
        !(m.localAplicacao ?? '').toLowerCase().includes(busca.toLowerCase())
      )
        return false
      if (dataInicio && m.data < dataInicio) return false
      if (dataFim && m.data > dataFim + 'T23:59:59') return false
      return true
    })
  }, [movs, filtroTipo, busca, dataInicio, dataFim])

  const resumo = useMemo(() => {
    const entradas = filtrados.filter((m) => m.tipo === 'entrada')
    const saidas = filtrados.filter((m) => m.tipo === 'saida')
    const consumoPorProduto: Record<string, { descricao: string; codigo: string; total: number }> = {}
    saidas.forEach((m) => {
      if (!consumoPorProduto[m.produtoId]) {
        consumoPorProduto[m.produtoId] = { descricao: m.produtoDescricao, codigo: m.produtoCodigo, total: 0 }
      }
      consumoPorProduto[m.produtoId].total += m.quantidade
    })
    return {
      totalEntradas: entradas.reduce((a, m) => a + m.quantidade, 0),
      totalSaidas: saidas.reduce((a, m) => a + m.quantidade, 0),
      qtdEntradas: entradas.length,
      qtdSaidas: saidas.length,
      consumoPorProduto: Object.values(consumoPorProduto).sort((a, b) => b.total - a.total),
    }
  }, [filtrados])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Histórico de Movimentações</h2>
        <p className="text-sm text-slate-400">Rastreie todas as entradas e saídas do almoxarifado.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Registros', value: filtrados.length, color: 'violet' },
          { label: 'Entradas', value: resumo.qtdEntradas, color: 'emerald' },
          { label: 'Saídas', value: resumo.qtdSaidas, color: 'amber' },
          { label: 'Mov. Saídas (un)', value: resumo.totalSaidas.toLocaleString('pt-BR'), color: 'rose' },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-1"
          >
            <span className="text-xs text-slate-500 uppercase tracking-wider">{c.label}</span>
            <span className={`text-2xl font-bold text-${c.color}-400`}>{c.value}</span>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {(['todos', 'entrada', 'saida'] as FiltroTipo[]).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filtroTipo === t ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Buscar produto, requisitante, local..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
        />

        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
        />
      </div>

      {/* Consumo por produto (apenas quando filtro inclui saídas) */}
      {filtroTipo !== 'entrada' && resumo.consumoPorProduto.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Resumo de Consumo por Produto</h3>
          <div className="space-y-2">
            {resumo.consumoPorProduto.map((item) => {
              const pct = resumo.totalSaidas > 0 ? (item.total / resumo.totalSaidas) * 100 : 0
              return (
                <div key={item.codigo} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 font-mono text-violet-300 text-xs">{item.codigo}</span>
                  <span className="flex-1 text-slate-300 truncate">{item.descricao}</span>
                  <div className="w-24 bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-violet-500 h-1.5 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right tabular-nums">{item.total}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabela de movimentações */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Data/Hora</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Produto</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Detalhes</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Assinatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">Carregando...</td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">Nenhuma movimentação encontrada.</td>
                </tr>
              ) : (
                filtrados.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDate(m.data)}</td>
                    <td className="px-4 py-3">
                      {m.tipo === 'entrada' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-300">
                          ↑ Entrada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-300">
                          ↓ Saída
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white text-xs">{m.produtoDescricao}</div>
                      <div className="font-mono text-violet-400 text-xs">{m.produtoCodigo}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-white">{m.quantidade}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {m.tipo === 'entrada' ? (
                        <div>
                          <span className="text-slate-300">{m.fornecedor}</span>
                          <span className="ml-2 text-slate-500">NF: {m.nf}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="text-slate-300">{m.requisitante}</div>
                          <div className="text-violet-300/80 truncate max-w-[200px]">{m.localAplicacao}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.tipo === 'saida' && (
                        m.assinado ? (
                          <button
                            onClick={() => setAssinaturaSelecionada(m.assinatura ?? null)}
                            className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-xs text-violet-300 hover:bg-violet-500/25 transition-colors"
                          >
                            ✍ Ver
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal assinatura */}
      {assinaturaSelecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setAssinaturaSelecionada(null)}
        >
          <div
            className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Assinatura do Requisitante</h3>
              <button
                onClick={() => setAssinaturaSelecionada(null)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assinaturaSelecionada} alt="Assinatura" className="w-full" />
            </div>
            <p className="text-xs text-slate-500 text-center">Assinatura digital registrada no momento da retirada.</p>
          </div>
        </div>
      )}
    </div>
  )
}
