# Aplicação na raiz do repositório

Migração da V1 em 24/10/2026. A aplicação deixou `prototype/` e passou a ocupar
a raiz de `beyond-site`.

## Estrutura atual

```text
beyond-site/
  src/
  public/
  scripts/
  docs/
  design/
  AGENTS.md
  README.md
  figma-layout.json
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  next.config.ts
  postcss.config.mjs
  tsconfig.json
  vercel.json
```

Os READMEs foram consolidados. O `AGENTS.md` mantém as convenções de V1 e as
instruções locais do Next.js. O `.gitignore` passa a permitir a aplicação na
raiz e continua ignorando dependências, caches, saída estática, derivados de
artwork e configurações locais.

Os caminhos ativos na documentação e no exemplo de exportação do Figma foram
atualizados. Registros históricos que descrevem a árvore antiga receberam
uma nota apontando para esta migração.

Os scripts já resolvem seus arquivos a partir da própria localização ou da
raiz da aplicação, sem depender do nome `prototype`. Imports, componentes,
estilos, vídeos, fontes e contratos visuais não precisaram de alterações.
As referências públicas continuam em `/assets/`.

## Instalação e validação

- Os hashes SHA-256 dos 397 arquivos movidos foram conferidos imediatamente
  após a movimentação, antes de atualizar a documentação.
- `node_modules/`, `.next/`, `out/` e o cache TypeScript antigos foram removidos
  somente após conferir os caminhos e reinstalar as dependências na raiz.
- `pnpm install --frozen-lockfile --offline`: lockfile preservado; dependências
  reinstaladas usando o cache local, sem atualização de versões.
- `pnpm test`: 19 testes aprovados.
- `pnpm typecheck`, `pnpm format:check`, `pnpm css:check` e `git diff --check`.
- `pnpm build`: home, design system e página 404 exportados em `out/`.
- `pnpm start`: prévia estática iniciada a partir da raiz.
- HTTP local: `/` e `/design-system/` retornaram 200; uma URL inexistente
  retornou 404. Foram verificadas 95 referências a assets nos atributos
  HTML e nas URLs CSS exportadas, sem arquivos ausentes.

Comandos de desenvolvimento e build devem ser executados na raiz do
repositório. A pasta `prototype/` não permanece como cópia ou ponto de entrada.

## Vercel

Antes do próximo deploy, em **Settings → Build and Deployment → Root Directory**,
remova `prototype`, deixe o campo vazio e salve. Essa configuração pertence
ao projeto no painel da Vercel; mover `vercel.json` não a altera remotamente.

O `vercel.json` agora está na raiz, mantendo:

| Configuração | Valor |
| --- | --- |
| Framework | Next.js |
| Instalação | `pnpm install --frozen-lockfile` |
| Build | `pnpm build` |
| Saída da integração Next.js | `.next` |

O site continua sendo exportado estaticamente. Não foi executado deploy nem
alterado o projeto remoto. Referência:
[configuração de build da Vercel](https://vercel.com/docs/builds/configure-a-build#root-directory).
