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

Para testar os arquivos de produção em navegadores automatizados, após o build:

```sh
pnpm exec playwright install chromium webkit
pnpm test:e2e
```

O Playwright serve `out/` na porta 4181 e testa Chromium em desktop, tablet e
mobile, além de WebKit desktop/mobile. `pnpm test:e2e:ui` abre os cenários interativos.
O workflow `Quality` verifica tipos, testes unitários, CSS, formatação, build e
navegadores em pushes e pull requests. Consulte os limites e a organização em
[Sustentabilidade da V1](docs/architecture/maintenance.md).

`pnpm build` limpa a saída gerada anterior e exporta HTML, CSS, JavaScript e assets para `out/`. As leituras
dos SVGs pelo Node.js acontecem durante o build. A hospedagem precisa servir
somente `out/`, sem executar o Next.js ou instalar Node.js em produção.
`trailingSlash: true` gera diretórios com `index.html` para as rotas, incluindo
`out/design-system/index.html`, permitindo acesso direto e recarga em hosts
estáticos convencionais.

`pnpm start` usa `serve`, uma dependência de desenvolvimento, apenas para
pré-visualizar `out/` no computador. Não há fallback de SPA: uma URL
inexistente deve retornar 404. Pare `pnpm dev` antes, pois ambos usam a porta 4173.

Para testar no Safari de um iPhone na mesma rede do computador:

```sh
node scripts/figma/prepare-artwork.mjs
pnpm exec next dev --hostname 0.0.0.0 --port 4173
```

Pare o servidor anterior e abra `http://<IPv4-do-computador>:4173` no iPhone.
O computador pode estar conectado por cabo ao mesmo roteador. Consulte o IPv4
com `ipconfig` no Windows e permita o Node no firewall apenas para a rede de
teste confiável. `allowedDevOrigins` em `next.config.ts` permite os endereços
IPv4 locais detectados ao iniciar o servidor; após trocar de rede, reinicie-o.
Essa configuração só vale para desenvolvimento. Em caso de falha, confira se
o menu abre, os erros do navegador e a preferência “Reduzir Movimento” do iOS.

As versões exatas estão em `pnpm-lock.yaml`. O `pnpm-workspace.yaml` permite
os builds nativos de Sharp e Tailwind. Não use um segundo lockfile de outro
gerenciador.

## Publicação na Vercel

No painel da Vercel, em **Settings → Build and Deployment → Root Directory**,
remova `prototype` e deixe o campo vazio para usar a raiz do repositório.
O `vercel.json` na raiz define Next.js como framework, `pnpm install --frozen-lockfile` como
instalação, `pnpm build` como build e `.next` como diretório de saída da integração Next.js.
Essa integração precisa dos manifestos em `.next`; apontar para `out` causa
o erro de `routes-manifest.json` ausente. A pasta `out` contém a exportação
estática para servir localmente ou em outra hospedagem.
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

O dark mode é acionado por `conversation-scroll-theme` quando o fim de
`#conversa` alcança o fim da viewport (`start: 'bottom bottom'`). Ao subir
acima desse ponto, o tema volta ao branco. A transição respeita
`prefers-reduced-motion`; fotos e mockups mantêm suas cores. Os contratos
estão em [Modos de cor](docs/themes.md).

O hero acompanha o mouse a partir de `90em` com hover e ponteiro fino; nos
demais layouts, usa uma lente menor com refração e percurso automático em
faixas de Z, com retorno, desaceleração e pausas. Os controles de Serviços
ficam abaixo dos cards nos layouts compactos, e os robôs ficam na faixa
superior visível. O Aplicativo desenha o contorno e os elementos da tela
progressivamente, inclusive em telas de toque. Veja [Animações](docs/animations.md)
e [Vidro do hero](docs/hero-3d.md) para limites e variantes.

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

`normalize-phone-screens.mjs` move a transformação dos SVGs internos das
telas para grupos `<g>`, preservando as coordenadas, dimensões e referências.
Isso corrige a renderização no Safari sem editar os exports originais.

O mesmo preparo converte as sete fontes TTF locais para WOFF2, remove dos
derivados inline apenas fontes embutidas idênticas às compartilhadas e gera
um fundo leve do hero sem definições SVG não referenciadas. Os originais
continuam preservados. As gravações são atômicas e arquivos idênticos não
são regravados, reduzindo mudanças desnecessárias na prévia de desenvolvimento.

As variantes `*-bleed.svg` separam fundos fluidos, fotos ancoradas às bordas e elementos centrais de tamanho fixo. A largura vem do container da seção (`cqw`), sem incluir a barra de rolagem. A faixa de clientes usa conteúdo React repetido, com cópias ocultas de leitores de tela, e recorta somente na borda da página. A interface usa `rem`, com breakpoints em `em`; SVGs e cálculos de canvas mantêm coordenadas locais em pixels. Consulte [a revisão responsiva](docs/responsiveness-review.md) para critérios e validação.

## Manutenção e validação

Após `pnpm install`, o Husky ativa os hooks locais. O commit exige `pnpm check`
(preparo de assets e tipos, TypeScript, formatação, cascata CSS e testes unitários).
O push exige `pnpm verify`, que acrescenta build e testes de navegador sobre a
exportação recém-gerada. Instale os navegadores uma vez com
`pnpm exec playwright install chromium webkit`. Os dois comandos também podem
ser executados manualmente; o workflow `Quality` executa `pnpm verify` no CI.

Os hooks verificam o estado atual dos arquivos, incluindo alterações ainda não
adicionadas ao stage. Hooks locais podem ser ignorados pelo Git; para exigir o
resultado no servidor, configure `Quality / validate` como check obrigatório na
proteção da branch no GitHub. Essa configuração remota não é feita pelo Husky.

Os testes cobrem conteúdo, geometria, fontes, preparo de SVGs e interações;
não substituem uma conferência visual do site em navegadores.
Teste menu, carrosséis e animações em desktop, tela compacta e Safari no
iPhone, incluindo movimento reduzido. Um build local que falhou não deve
ser registrado como validado porque o TypeScript ou os testes passaram.

As prioridades e limitações estruturais estão em
[Sustentabilidade da V1](docs/architecture/maintenance.md). Documentos em
`docs/qa/` registram validações históricas; seus resultados descrevem o estado
naquela revisão, sem comprovar automaticamente alterações posteriores.
