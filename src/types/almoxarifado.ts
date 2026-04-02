export type Unidade = 'UN' | 'KG' | 'M' | 'CX' | 'PC' | 'L'

export interface Produto {
  id?: string
  codigo: string
  descricao: string
  unidade: Unidade
  saldo: number
  estoqueMinimo: number
  localizacao: string
  criadoEm?: string
}

export interface Movimentacao {
  id?: string
  tipo: 'entrada' | 'saida'
  produtoId: string
  produtoDescricao: string
  produtoCodigo: string
  quantidade: number
  data: string
  // Entrada
  fornecedor?: string
  nf?: string
  // Saida
  localAplicacao?: string
  requisitante?: string
  assinatura?: string // base64 do canvas
  assinado?: boolean
}

export type Modulo = 'dashboard' | 'entrada' | 'requisicao' | 'historico'
