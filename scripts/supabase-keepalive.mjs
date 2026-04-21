import fs from 'node:fs'
import path from 'node:path'

function readEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return {}

  const raw = fs.readFileSync(envPath, 'utf8')
  const map = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    map[key] = value
  }

  return map
}

const envLocal = readEnvLocal()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? envLocal.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? envLocal.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas.')
  process.exit(1)
}

const intervalArg = process.argv.find((arg) => arg.startsWith('--interval='))
const intervalMinutes = intervalArg ? Number(intervalArg.split('=')[1]) : 360
const loop = process.argv.includes('--loop')

async function pingSupabase() {
  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/jogos?select=id&limit=1`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ping falhou (${response.status}): ${body}`)
  }

  const now = new Date().toISOString()
  console.log(`[${now}] Ping Supabase OK`)
}

async function run() {
  await pingSupabase()

  if (!loop) return

  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) {
    throw new Error('Intervalo inválido. Use --interval=<minutos> com valor > 0.')
  }

  const ms = intervalMinutes * 60_000
  console.log(`Modo keepalive ativo. Próximo ping a cada ${intervalMinutes} minuto(s).`)

  setInterval(() => {
    pingSupabase().catch((err) => {
      console.error(err instanceof Error ? err.message : String(err))
    })
  }, ms)
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
