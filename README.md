# 🎮 Historia 2026 Games

Catálogo pessoal de jogos estilo Netflix/Steam — substituto moderno de planilha de gerenciamento.

[![Deploy on Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://netlify.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

## 🚀 Demo ao Vivo

> **[▶ Publicado no Netlify](https://app.netlify.com/)**

---

## ✨ Funcionalidades

- 🎨 **Dark mode** com tema roxo/azul escuro
- 🃏 **Grid responsivo** estilo Netflix com foco nas capas dos jogos
- 🔍 **Busca em tempo real** por nome do jogo
- 🏷️ **Filtros por status** (Jogando, Zerei, Pausa, Desisti, Querendo...)
- ➕ **Adicionar / Editar / Excluir** jogos via modal
- 🖼️ **Preview da capa** em tempo real ao colar a URL
- 💾 **Banco de dados** Supabase com RLS configurado

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Framework principal |
| TypeScript | Tipagem estática |
| Tailwind CSS v4 | Estilização |
| Supabase | Banco de dados (PostgreSQL) |

## ⚙️ Rodando localmente

```bash
# 1. Clone o repositório
git clone https://github.com/eullon1234-creator/HISTORIA-2026-GAMES.git
cd HISTORIA-2026-GAMES

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# Preencha com suas chaves do Supabase

# 4. Execute o schema no Supabase
# Cole o conteúdo de supabase/schema.sql no SQL Editor do Supabase

# 5. Rode o servidor
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 🗄️ Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

## 🔄 Keepalive do Supabase (plano gratuito)

No plano gratuito, o Supabase pode pausar por inatividade. Para manter atividade, você pode usar:

```bash
# Faz 1 ping agora
npm run supabase:ping

# Mantém ping a cada 6 horas (enquanto o processo estiver rodando)
npm run supabase:keepalive
```

## 🔐 Auth + RLS (segurança por usuário)

O app agora exige login (e-mail/senha) e cada usuário só enxerga os próprios jogos.

1. No Supabase, habilite `Email/Password` em **Authentication → Providers**.
2. Execute novamente o SQL de [supabase/schema.sql](supabase/schema.sql) para aplicar as políticas RLS por `user_id`.
3. Se você já tinha jogos antigos, atribua ao seu usuário:

```sql
update public.jogos
set user_id = '<SEU_USER_ID>'
where user_id is null;
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy no Netlify

Este projeto já está preparado para Netlify com `netlify.toml` e plugin oficial do Next.js.

1. Conecte o repositório no Netlify.
2. Em **Site configuration → Environment variables**, adicione:
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Faça o deploy (o comando de build já é `npm run build`).
