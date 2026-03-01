import { NextRequest, NextResponse } from 'next/server'
import type { Jogo } from '@/types/jogo'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type BotRequest = {
  messages: ChatMessage[]
  jogos: Jogo[]
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

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: fallbackAnswer(messages, jogos), mode: 'fallback' })
    }

    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

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
