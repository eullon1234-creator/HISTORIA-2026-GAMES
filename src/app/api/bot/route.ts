import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Jogo } from '@/types/jogo'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type BotRequest = {
  messages: ChatMessage[]
  jogos: Jogo[]
}

type BotMutation = {
  type: 'insert' | 'update' | 'delete'
  jogo?: Jogo
  id?: string
}

type ExtractedAction = {
  action: 'none' | 'add' | 'status' | 'nota' | 'delete' | 'plataforma'
  nome?: string
  status?: string
  nota?: number
  plataforma?: string
  genero?: string
  valor?: number
  inicio?: string
  fim?: string
  capa?: string
}

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function parseStatus(raw: string): Jogo['status'] | null {
  const value = normalizeText(raw).replace(/\.+$/g, '')
  if (value === 'zerei') return 'Zerei'
  if (value === 'desisti') return 'Desisti'
  if (value === 'pausa') return 'Pausa'
  if (value === 'jogando') return 'Jogando'
  if (value === 'querendo') return 'Querendo...'
  return null
}

function parseKeyValueArgs(text: string) {
  const result: Record<string, string> = {}
  const regex = /(\w+)=("[^"]*"|'[^']*'|\S+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const key = match[1].toLowerCase()
    const value = match[2].replace(/^['"]|['"]$/g, '')
    result[key] = value
  }

  return result
}

function parseNumber(value?: string): number | null {
  if (!value) return null
  const normalized = value.replace(',', '.')
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function parseDate(value?: string): string | null {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  return value
}

function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(supabaseUrl, supabaseKey)
}

async function findGameByName(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  jogos: Jogo[],
  rawName: string
): Promise<Jogo | null> {
  const name = rawName.trim().replace(/^['"]|['"]$/g, '')
  if (!name) return null

  const normalizedName = normalizeText(name)
  const local = jogos.find((j) => normalizeText(j.nome_do_jogo) === normalizedName)
    ?? jogos.find((j) => normalizeText(j.nome_do_jogo).includes(normalizedName))

  if (local) return local

  const { data } = await supabase
    .from('jogos')
    .select('*')
    .ilike('nome_do_jogo', `%${name}%`)
    .limit(1)

  return data?.[0] ?? null
}

async function handleCommandAction(
  input: string,
  jogos: Jogo[]
): Promise<{ reply: string; mutation?: BotMutation } | null> {
  const trimmed = input.trim()
  if (!trimmed) return null

  const supabase = getSupabaseServerClient()
  if (!supabase) {
    return {
      reply: 'Supabase não configurado no servidor para executar ações. Configure as variáveis de ambiente.',
    }
  }

  if (trimmed === '/help') {
    return {
      reply: [
        'Comandos disponíveis:',
        '/add nome="Jogo" plataforma=STEAM status=Jogando genero="Ação" nota=9.5 valor=59.9 inicio=2026-03-01 fim=2026-03-10 capa=https://...',
        '/status "Nome do Jogo" Zerei',
        '/nota "Nome do Jogo" 9.5',
        '/plataforma "Nome do Jogo" SWITCH',
        '/delete "Nome do Jogo"',
        'Também aceito frases: "muda status de Katana Zero para Zerei", "nota de Spider-Man Remastered para 9.5" ou "muda plataforma de Katana Zero para SWITCH".',
      ].join('\n'),
    }
  }

  if (trimmed.startsWith('/plataforma ')) {
    const match = trimmed.match(/^\/plataforma\s+"([^"]+)"\s+(.+)$/i)
      ?? trimmed.match(/^\/plataforma\s+(.+?)\s+(.+)$/i)

    if (!match) {
      return { reply: 'Formato inválido. Use: /plataforma "Nome do Jogo" SWITCH' }
    }

    const nome = match[1]
    const plataforma = match[2].trim().toUpperCase()

    if (!plataforma) return { reply: 'Plataforma inválida.' }

    const alvo = await findGameByName(supabase, jogos, nome)
    if (!alvo) return { reply: `Não encontrei o jogo "${nome}".` }

    const { data, error } = await supabase
      .from('jogos')
      .update({ plataforma })
      .eq('id', alvo.id)
      .select('*')
      .single()

    if (error) return { reply: `Erro ao atualizar plataforma: ${error.message}` }

    return {
      reply: `Plataforma de "${data.nome_do_jogo}" atualizada para ${data.plataforma}.`,
      mutation: { type: 'update', jogo: data as Jogo },
    }
  }

  if (trimmed.startsWith('/status ')) {
    const match = trimmed.match(/^\/status\s+"([^"]+)"\s+(.+)$/i)
      ?? trimmed.match(/^\/status\s+(.+?)\s+(zerei|desisti|pausa|querendo\.{0,3}|jogando)$/i)

    if (!match) {
      return { reply: 'Formato inválido. Use: /status "Nome do Jogo" Zerei' }
    }

    const nome = match[1]
    const status = parseStatus(match[2])
    if (!status) return { reply: 'Status inválido. Use: Zerei, Desisti, Pausa, Querendo..., Jogando.' }

    const alvo = await findGameByName(supabase, jogos, nome)
    if (!alvo) return { reply: `Não encontrei o jogo "${nome}".` }

    const patch: Partial<Jogo> = {
      status,
      desistiu: status === 'Desisti',
    }

    if (status === 'Zerei' && !alvo.data_finalizada) {
      patch.data_finalizada = new Date().toISOString().slice(0, 10)
    }

    const { data, error } = await supabase
      .from('jogos')
      .update(patch)
      .eq('id', alvo.id)
      .select('*')
      .single()

    if (error) return { reply: `Erro ao atualizar status: ${error.message}` }

    return {
      reply: `Status de "${data.nome_do_jogo}" atualizado para ${data.status}.`,
      mutation: { type: 'update', jogo: data as Jogo },
    }
  }

  if (trimmed.startsWith('/nota ')) {
    const match = trimmed.match(/^\/nota\s+"([^"]+)"\s+([\d.,]+)$/i)
      ?? trimmed.match(/^\/nota\s+(.+?)\s+([\d.,]+)$/i)

    if (!match) {
      return { reply: 'Formato inválido. Use: /nota "Nome do Jogo" 9.5' }
    }

    const nome = match[1]
    const nota = parseNumber(match[2])
    if (nota === null || nota < 0 || nota > 10) {
      return { reply: 'Nota inválida. Use um valor entre 0 e 10.' }
    }

    const alvo = await findGameByName(supabase, jogos, nome)
    if (!alvo) return { reply: `Não encontrei o jogo "${nome}".` }

    const { data, error } = await supabase
      .from('jogos')
      .update({ nota_pessoal: nota })
      .eq('id', alvo.id)
      .select('*')
      .single()

    if (error) return { reply: `Erro ao atualizar nota: ${error.message}` }

    return {
      reply: `Nota de "${data.nome_do_jogo}" atualizada para ${nota}.`,
      mutation: { type: 'update', jogo: data as Jogo },
    }
  }

  if (trimmed.startsWith('/delete ')) {
    const match = trimmed.match(/^\/delete\s+"([^"]+)"$/i)
      ?? trimmed.match(/^\/delete\s+(.+)$/i)

    if (!match) {
      return { reply: 'Formato inválido. Use: /delete "Nome do Jogo"' }
    }

    const nome = match[1]
    const alvo = await findGameByName(supabase, jogos, nome)
    if (!alvo) return { reply: `Não encontrei o jogo "${nome}".` }

    const { error } = await supabase
      .from('jogos')
      .delete()
      .eq('id', alvo.id)

    if (error) return { reply: `Erro ao deletar: ${error.message}` }

    return {
      reply: `Jogo "${alvo.nome_do_jogo}" removido do catálogo.`,
      mutation: { type: 'delete', id: alvo.id },
    }
  }

  if (trimmed.startsWith('/add ')) {
    const args = parseKeyValueArgs(trimmed.replace('/add', '').trim())
    const nome = args.nome

    if (!nome) {
      return { reply: 'Use /add com nome="...". Exemplo: /add nome="Hades" plataforma=STEAM status=Jogando' }
    }

    const status = parseStatus(args.status ?? 'Querendo...') ?? 'Querendo...'
    const nota = parseNumber(args.nota)
    const valor = parseNumber(args.valor)
    const inicio = parseDate(args.inicio)
    const fim = parseDate(args.fim)

    if (nota !== null && (nota < 0 || nota > 10)) {
      return { reply: 'Nota inválida no /add. Use entre 0 e 10.' }
    }

    const novoJogo = {
      nome_do_jogo: nome,
      plataforma: (args.plataforma ?? 'OUTRO').toUpperCase(),
      genero: args.genero ?? '',
      status,
      valor_pago: valor,
      data_inicio: inicio,
      nota_pessoal: nota,
      data_finalizada: fim,
      desistiu: status === 'Desisti',
      capa_url: args.capa ?? null,
    }

    const { data, error } = await supabase
      .from('jogos')
      .insert([novoJogo])
      .select('*')
      .single()

    if (error) return { reply: `Erro ao adicionar jogo: ${error.message}` }

    return {
      reply: `Jogo "${data.nome_do_jogo}" adicionado com sucesso.`,
      mutation: { type: 'insert', jogo: data as Jogo },
    }
  }

  const statusNatural = trimmed.match(/status\s+de\s+(.+?)\s+para\s+(zerei|desisti|pausa|querendo\.{0,3}|jogando)/i)
  if (statusNatural) {
    return handleCommandAction(`/status "${statusNatural[1]}" ${statusNatural[2]}`, jogos)
  }

  const notaNatural = trimmed.match(/nota\s+de\s+(.+?)\s+para\s+([\d.,]+)/i)
  if (notaNatural) {
    return handleCommandAction(`/nota "${notaNatural[1]}" ${notaNatural[2]}`, jogos)
  }

  const deleteNatural = trimmed.match(/(deletar|delet|apagar|apaga|remover|remove|excluir|exclui)\s+(.+)/i)
  if (deleteNatural) {
    return handleCommandAction(`/delete "${deleteNatural[2]}"`, jogos)
  }

  const plataformaNatural = trimmed.match(/plataforma\s+de\s+(.+?)\s+para\s+(.+)/i)
  if (plataformaNatural) {
    return handleCommandAction(`/plataforma "${plataformaNatural[1]}" ${plataformaNatural[2]}`, jogos)
  }

  const cadastraPlataformaNatural = trimmed.match(/(cadastra|adiciona|define)\s+(a\s+)?plataforma\s+(.+?)\s+(no|para\s+o)\s+jogo\s+(.+)/i)
  if (cadastraPlataformaNatural) {
    return handleCommandAction(`/plataforma "${cadastraPlataformaNatural[5]}" ${cadastraPlataformaNatural[3]}`, jogos)
  }

  return null
}

async function tryExtractActionWithAI(
  apiKey: string,
  model: string,
  input: string,
  jogos: Jogo[]
): Promise<ExtractedAction | null> {
  const prompt = [
    'Extraia ação de catálogo de jogos em JSON.',
    'Ações possíveis: none, add, status, nota, delete, plataforma.',
    'Campos: nome, status, nota, plataforma, genero, valor, inicio, fim, capa.',
    'Se não houver ação clara, retorne {"action":"none"}.',
    'Responda somente JSON puro.',
    `Mensagem do usuário: ${input}`,
    `Nomes de jogos existentes: ${jogos.map((j) => j.nome_do_jogo).join(' | ')}`,
  ].join('\n')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: 'system', content: 'Você extrai intenção para automações e responde em JSON.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content?.trim()
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as ExtractedAction
    if (!parsed?.action) return null
    return parsed
  } catch {
    return null
  }
}

function actionToCommand(action: ExtractedAction): string | null {
  if (!action || action.action === 'none') return null

  if (action.action === 'status' && action.nome && action.status) {
    return `/status "${action.nome}" ${action.status}`
  }

  if (action.action === 'nota' && action.nome && typeof action.nota === 'number') {
    return `/nota "${action.nome}" ${action.nota}`
  }

  if (action.action === 'delete' && action.nome) {
    return `/delete "${action.nome}"`
  }

  if (action.action === 'plataforma' && action.nome && action.plataforma) {
    return `/plataforma "${action.nome}" ${action.plataforma}`
  }

  if (action.action === 'add' && action.nome) {
    const parts = [
      `/add nome="${action.nome}"`,
      action.plataforma ? `plataforma="${action.plataforma}"` : '',
      action.status ? `status="${action.status}"` : '',
      action.genero ? `genero="${action.genero}"` : '',
      typeof action.nota === 'number' ? `nota=${action.nota}` : '',
      typeof action.valor === 'number' ? `valor=${action.valor}` : '',
      action.inicio ? `inicio=${action.inicio}` : '',
      action.fim ? `fim=${action.fim}` : '',
      action.capa ? `capa="${action.capa}"` : '',
    ].filter(Boolean)

    return parts.join(' ')
  }

  return null
}

function buildResumo(jogos: Jogo[]) {
  const total = jogos.length
  const zerei = jogos.filter((j) => j.status === 'Zerei').length
  const jogando = jogos.filter((j) => j.status === 'Jogando').length
  const pausa = jogos.filter((j) => j.status === 'Pausa').length
  const desisti = jogos.filter((j) => j.status === 'Desisti').length
  const querendo = jogos.filter((j) => j.status === 'Querendo...').length
  const gasto = jogos.reduce((acc, jogo) => acc + (jogo.valor_pago ?? 0), 0)

  return {
    total,
    zerei,
    jogando,
    pausa,
    desisti,
    querendo,
    gasto: Number(gasto.toFixed(2)),
  }
}

function fallbackAnswer(messages: ChatMessage[], jogos: Jogo[]) {
  const pergunta = (messages.at(-1)?.content ?? '').toLowerCase()
  const resumo = buildResumo(jogos)

  if (pergunta.includes('quanto') && (pergunta.includes('gastei') || pergunta.includes('gasto'))) {
    return `Você gastou aproximadamente R$ ${resumo.gasto.toFixed(2)} no catálogo atual.`
  }

  if (pergunta.includes('zerei') || pergunta.includes('zerados')) {
    return `Você já zerou ${resumo.zerei} jogo(s).`
  }

  if (pergunta.includes('jogando')) {
    return `Você está jogando ${resumo.jogando} jogo(s) no momento.`
  }

  if (pergunta.includes('recom') || pergunta.includes('próximo')) {
    const candidato = jogos.find((j) => j.status === 'Jogando')
      ?? jogos.find((j) => j.status === 'Pausa')
      ?? jogos.find((j) => j.status === 'Querendo...')

    if (!candidato) {
      return 'Não encontrei jogos para recomendar agora. Adicione mais títulos no catálogo.'
    }

    return `Minha sugestão rápida: foque em "${candidato.nome_do_jogo}" (${candidato.status}).`
  }

  return [
    'Consigo te ajudar com estatísticas e recomendações do seu catálogo.',
    `Resumo atual: ${resumo.total} jogos, ${resumo.zerei} zerado(s), ${resumo.jogando} jogando, R$ ${resumo.gasto.toFixed(2)} gastos.`,
    'Se quiser IA completa, configure OPENAI_API_KEY no Vercel e no .env.local.',
  ].join(' ')
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BotRequest
    const messages = Array.isArray(body.messages) ? body.messages : []
    const jogos = Array.isArray(body.jogos) ? body.jogos : []

    if (!messages.length) {
      return NextResponse.json({ reply: 'Envie uma mensagem para começar.' }, { status: 400 })
    }

    const userInput = messages.at(-1)?.content ?? ''
    const actionResult = await handleCommandAction(userInput, jogos)
    if (actionResult) {
      return NextResponse.json({
        reply: actionResult.reply,
        mutation: actionResult.mutation,
        mode: 'action',
      })
    }

    const apiKey = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

    if (apiKey) {
      const extracted = await tryExtractActionWithAI(apiKey, model, userInput, jogos)
      const commandFromAI = extracted ? actionToCommand(extracted) : null
      if (commandFromAI) {
        const aiActionResult = await handleCommandAction(commandFromAI, jogos)
        if (aiActionResult) {
          return NextResponse.json({
            reply: `${aiActionResult.reply} (ação interpretada automaticamente)`,
            mutation: aiActionResult.mutation,
            mode: 'ai-action',
          })
        }
      }
    }

    if (!apiKey) {
      return NextResponse.json({ reply: fallbackAnswer(messages, jogos), mode: 'fallback' })
    }

    const resumo = buildResumo(jogos)
    const jogosCompactos = jogos.slice(0, 40).map((j) => ({
      nome: j.nome_do_jogo,
      plataforma: j.plataforma,
      genero: j.genero,
      status: j.status,
      nota: j.nota_pessoal,
      inicio: j.data_inicio,
      fim: j.data_finalizada,
      valor_pago: j.valor_pago,
    }))

    const system = [
      'Você é um assistente gamer em português do Brasil para o app Historia 2026 Games.',
      'Responda de forma curta, clara e útil.',
      'Pode recomendar próximos jogos, resumir estatísticas e identificar padrões de progresso.',
      'Nunca invente dados que não estejam no contexto.',
    ].join(' ')

    const contexto = {
      resumo,
      jogos: jogosCompactos,
    }

    const chatMessages = [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `Contexto do catálogo (JSON): ${JSON.stringify(contexto)}`,
      },
      ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: chatMessages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { reply: `Não consegui consultar a IA agora. (${response.status}) ${errorText.slice(0, 200)}` },
        { status: 200 }
      )
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()

    return NextResponse.json({
      reply: reply || 'Não consegui gerar resposta agora.',
      mode: 'ai',
    })
  } catch {
    return NextResponse.json({ reply: 'Erro ao processar mensagem do bot.' }, { status: 500 })
  }
}
