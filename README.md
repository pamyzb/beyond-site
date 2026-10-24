# Beyond — site institucional

A versão ativa do site (V1) fica na raiz deste repositório, com **Next.js App Router, React, TypeScript, Tailwind CSS 4 e GSAP**. O build gera um site estático em `out/`; Node.js é necessário somente para desenvolver e compilar. Estudos e experimentos visuais ficam em `design/`.

## Executar

Requisitos: Node.js 20.9+ e pnpm 10.26.0 (fixado em `packageManager`).

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Abra http://localhost:4173. O servidor usa somente loopback. Para gerar o
site estático e conferir localmente o resultado de produção:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

`pnpm build` limpa a saída gerada anterior e exporta HTML, CSS, JavaScript e assets para `out/`. As leituras
dos SVGs pelo Node.js acontecem durante o build. A hospedagem precisa servir
somente `out/`, sem executar o Next.js ou instalar Node.js em produção.
`trailingSlash: true` gera diretórios com `index.html` para as rotas, incluindo
`out/design-system/index.html`, permitindo acesso direto e recarga em hosts
estáticos convencionais.

`pnpm start` usa `serve`, uma dependência de desenvolvimento, apenas para
pré-visualizar `out/` no computador. Não há fallback de SPA: uma URL
inexistente deve retornar 404. Pare `pnpm dev` antes, pois ambos usam a porta 4173.

As versões exatas estão em `pnpm-lock.yaml`. O `pnpm-workspace.yaml` permite
os builds nativos de Sharp e Tailwind. Não use um segundo lockfile de outro
gerenciador.

## Publicação na Vercel

No painel da Vercel, em **Settings → Build and Deployment → Root Directory**,
remova `prototype` e deixe o campo vazio para usar a raiz do repositório.
O `vercel.json` na raiz define Next.js como framework, `pnpm install --frozen-lockfile` como
instalação, `pnpm build` como build e `out` como diretório de saída.
Não é necessário trocar o comando de build; a exportação estática é
ativada por `output: "export"` no `next.config.ts`. Envie as alterações e
faça um novo deploy para aplicar a configuração.

Recursos que exigem servidor (por exemplo Server Actions, cookies lidos no
servidor ou API interna) precisam de outra estratégia caso sejam adicionados
no futuro. O formulário real pode usar um serviço externo sem alterar a
publicação estática.

## Estrutura

- `src/app/`: App Router, metadata, layout, página e integração Tailwind/PostCSS.
- `src/components/ui/`: títulos, botões, artwork e cabeçalhos reutilizáveis.
- `src/components/layout/`: cabeçalho, navegação e rodapé.
- `src/components/sections/`: componentes, hooks e estilos organizados por seção.
- `src/components/motion/motion-root.tsx`: ciclo de vida das animações e trigger do tema.
- `src/lib/animation/`: registro GSAP e mapas de refração.
- `src/lib/figma/`: tipos, tipografia e adaptadores do layout exportado.
- `src/lib/server/`: leitura e preparação de SVGs durante o build.
- `src/data/`: navegação, destinos e modelos de conteúdo de Serviços e Cases.
- `figma-layout.json`: conteúdo e geometria rastreáveis ao frame original.
- `src/styles/`: fontes, tokens, composição base, temas e responsividade. `src/app/globals.css` registra os imports na ordem da cascata existente; o Preflight não é importado.
- `public/assets/`: fontes Poppins locais, fotografias, máscaras e SVGs.
- `design/`: estudos, experimentos e originais preservados fora da publicação.
- `scripts/figma/`: exportação e preparo dos assets; `scripts/tests/`: testes de conteúdo e geometria.
- `docs/animations.md`: como adicionar timelines, scrub, variantes responsivas e SVGs animáveis, com cleanup e movimento reduzido.

Os comandos acima são executados diretamente na raiz; não é necessário `cd prototype`.

Consulte [a migração para a raiz](docs/qa/root-migration.md), [a arquitetura](docs/architecture/structure.md), [a validação da refatoração](docs/qa/structure-refactor.md) e [a revisão de CSS e performance](docs/qa/css-performance.md).
`pnpm format` e `pnpm format:check` padronizam TypeScript/TSX, CSS e scripts JavaScript.
`pnpm css:check` identifica declarações idênticas já sobrescritas na mesma
cascata. `pnpm css:fix` remove apenas essas repetições, conservando seletores,
condições, prioridades e ordem; valores diferentes de fallback são preservados.

A página é pré-renderizada e exportada pelo Next.js. Não há fetch do layout
no navegador nem um script legado montando o DOM. Componentes interativos
são hidratados pelo React a partir dos arquivos estáticos.

## Tema e interações

O dark mode é acionado por ScrollTrigger quando o título "Aplicativo da Beyond" começa a aparecer na tela. Ao subir e o título sair pela borda inferior, o tema volta ao branco. A transição de 600 ms respeita `prefers-reduced-motion`; fotos e mockups mantêm suas cores.

Menu, FAQ e expansão do blog foram preservados. O formulário valida os
campos no navegador e simula a confirmação de envio; não há backend nem
envio real. O link separado de WhatsApp abre a conversa. A exportação
estática não altera esse comportamento. Respostas não fornecidas pelo
Figma não foram inventadas.

## Assets do Figma

Referência: https://www.figma.com/design/6GJ5Lmw6KLMBCBBnioehPF/Beyond-%7C-Site-institucional?node-id=15857-1601

Para reconstruir os assets a partir da raiz do projeto (Python com Pillow):

```sh
python scripts/figma/build-figma.py tmp/figma-reference/ia-friendly.svg --optimize
python scripts/figma/build-bleed-art.py
```

O exportador agora grava em `public/assets/figma/`. Ele preserva as versões clara/escura do aplicativo e o overlay inline da seção de conversa. A otimização continua verificando igualdade dos pixels antes de converter PNG para WebP lossless.

Antes de `dev` e `build`, `prepare-artwork.mjs` gera os derivados SVG inline em
`.generated/artwork/` e extrai imagens para `public/assets/generated/`, usando
hashes para compartilhar bytes idênticos. Ambos são ignorados pelo Git.
Os SVGs originais usados por `<img>` continuam autocontidos; apenas os derivados
inline usam referências externas. Para incluir um novo derivado, adicione sua
origem em `src/data/artwork-files.json`.

O mesmo preparo converte as sete fontes TTF locais para WOFF2, remove dos
derivados inline apenas fontes embutidas idênticas às compartilhadas e gera
um fundo leve do hero sem definições SVG não referenciadas. Os originais
continuam preservados. As gravações são atômicas e arquivos idênticos não
são regravados, reduzindo mudanças desnecessárias na prévia de desenvolvimento.

As variantes `*-bleed.svg` separam fundos fluidos, fotos ancoradas às bordas e elementos centrais de tamanho fixo. A largura vem do container da seção (`cqw`), sem incluir a barra de rolagem. A faixa de clientes usa conteúdo React repetido, com cópias ocultas de leitores de tela, e recorta somente na borda da página. A interface usa `rem`, com breakpoints em `em`; SVGs e cálculos de canvas mantêm coordenadas locais em pixels. Consulte [a revisão responsiva](docs/responsiveness-review.md) para critérios e validação.
