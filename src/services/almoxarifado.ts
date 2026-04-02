import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Produto, Movimentacao } from '@/types/almoxarifado'

const PRODUTOS_COL = 'almoxarifado_produtos'
const MOV_COL = 'almoxarifado_movimentacoes'

// ─── Produtos ────────────────────────────────────────────────────────────────

export async function listarProdutos(): Promise<Produto[]> {
  const snap = await getDocs(query(collection(db, PRODUTOS_COL), orderBy('descricao')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Produto))
}

export async function criarProduto(produto: Omit<Produto, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, PRODUTOS_COL), {
    ...produto,
    criadoEm: new Date().toISOString(),
  })
  return ref.id
}

export async function atualizarProduto(id: string, dados: Partial<Produto>): Promise<void> {
  await updateDoc(doc(db, PRODUTOS_COL, id), dados)
}

// ─── Movimentações ────────────────────────────────────────────────────────────

export async function listarMovimentacoes(): Promise<Movimentacao[]> {
  const snap = await getDocs(query(collection(db, MOV_COL), orderBy('data', 'desc')))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Movimentacao))
}

export async function registrarEntrada(
  produtoId: string,
  quantidade: number,
  fornecedor: string,
  nf: string,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const prodRef = doc(db, PRODUTOS_COL, produtoId)
    const prodSnap = await tx.get(prodRef)
    if (!prodSnap.exists()) throw new Error('Produto não encontrado')
    const produto = prodSnap.data() as Produto
    const novoSaldo = produto.saldo + quantidade
    tx.update(prodRef, { saldo: novoSaldo })
    const movRef = doc(collection(db, MOV_COL))
    tx.set(movRef, {
      tipo: 'entrada',
      produtoId,
      produtoDescricao: produto.descricao,
      produtoCodigo: produto.codigo,
      quantidade,
      data: new Date().toISOString(),
      fornecedor,
      nf,
    } satisfies Movimentacao)
  })
}

export async function registrarSaida(
  produtoId: string,
  quantidade: number,
  localAplicacao: string,
  requisitante: string,
  assinatura: string,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const prodRef = doc(db, PRODUTOS_COL, produtoId)
    const prodSnap = await tx.get(prodRef)
    if (!prodSnap.exists()) throw new Error('Produto não encontrado')
    const produto = prodSnap.data() as Produto
    if (produto.saldo < quantidade)
      throw new Error(`Saldo insuficiente. Disponível: ${produto.saldo} ${produto.unidade}`)
    const novoSaldo = produto.saldo - quantidade
    tx.update(prodRef, { saldo: novoSaldo })
    const movRef = doc(collection(db, MOV_COL))
    tx.set(movRef, {
      tipo: 'saida',
      produtoId,
      produtoDescricao: produto.descricao,
      produtoCodigo: produto.codigo,
      quantidade,
      data: new Date().toISOString(),
      localAplicacao,
      requisitante,
      assinatura,
      assinado: assinatura.length > 100,
    } satisfies Movimentacao)
  })
}

// suppress unused import warning for serverTimestamp / Timestamp
void serverTimestamp
void Timestamp
