# 🎮 Historia 2026 Games

Catálogo pessoal de jogos estilo Netflix/Steam — substituto moderno de planilha de gerenciamento.

[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)

## 🚀 Demo ao Vivo

> **[▶ Abrir o App](https://historia-2026-games.vercel.app)**

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
git clone https://github.com/SEU_USER/historia-2026-games.git
cd historia-2026-games

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
