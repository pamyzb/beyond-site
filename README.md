# Beyond — site institucional

A versão ativa do site (V1) está em `prototype/`, construída com Next.js, React e TypeScript.

## Desenvolvimento

```sh
cd prototype
npm ci
npm run dev
```

Abra http://localhost:4173.

## Validação

```sh
cd prototype
npm run typecheck
npm run build
```

## Publicação na Vercel

Importe este repositório e configure:

- **Root Directory:** `prototype`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command / Output Directory:** padrões do framework

Mais detalhes em [prototype/README.md](prototype/README.md).
