# Revisão da V1 — responsividade, unidades e animação

## Ajustes mobile da home — 30/10/2026

Revisão dos comentários de navegador: Softdex restaurada, CTA de mídia
reposicionado, arraste de serviços, ritmo 16/24px nos títulos, liquid glass
mobile, cards finais em duas colunas onde cabem e remoções responsivas de
fotos/itens do rodapé. Decisões anteriores conflitantes foram substituídas
pela revisão da usuária. Detalhes em
[home-mobile-comments.md](qa/home-mobile-comments.md).

Executado o plano da home, mantendo o desktop como referência. Menu e hero
foram simplificados no celular; empresas fecham no segundo toque; serviços
usam paginação pela geometria real. Cases percorrem os três projetos em fluxo
normal, com expansão por scroll e controles originais em movimento reduzido.
O marcador do processo passou a usar um percurso contínuo mobile, alinhado aos
badges, sem medir layout por frame. App, depoimentos, FAQ, cards finais e
rodapé receberam ajustes locais de tamanho, fluxo de texto e espaçamento.

As propostas abertas de duas linhas de marcas, cards em 2 + 1 e ocultação dos
botões finais não foram adotadas. A paleta existente foi preservada. Estilos
novos do menu e rodapé estão restritos à home; o blog não foi modificado nesta
execução. Relatório, comparativos e limites em
[home-mobile-execution.md](qa/home-mobile-execution.md).

Data: 24/10/2026. Escopo: implementação ativa na raiz do repositório, incluindo
`/` e `/design-system`. A composição de desktop permanece como referência.

## Diagnóstico e correções

- Download do app (26/10/2026): Android, iPhone e iPad recebem o botão
  primário verde com ícone de download. iPadOS em modo desktop é reconhecido
  pela identificação Macintosh com múltiplos pontos de toque. Computadores,
  inclusive notebooks Windows touch, mantêm o QR, independentemente da largura.
  Os links Android/iOS em `src/data/app-download.ts` usam os destinos fornecidos:
  busca por Beyond the Bytes no Google Play e página do app na App Store.
  O botão abre a loja correspondente ao sistema detectado. Tipos, cascata CSS
  e testes de identificação passaram. Conferência visual pendente.
- Hero mobile (26/10/2026): abaixo de 37.5em, título e descrição ficam
  centralizados, com a seta verde apontando para baixo acima da descrição e CTA na largura do
  conteúdo. O bloco principal é centralizado na área disponível entre o
  cabeçalho e o indicador de rolagem. Formatação e cascata CSS verificadas;
  conferência visual pendente porque o navegador de teste não iniciou no ambiente.
- O fundo dos depoimentos abaixo de 90em usa três SVGs independentes:
  cantos superior e inferior ancorados nas bordas e contorno proporcional.
  Isso evita que o recorte de uma imagem única esconda os demais elementos.
- A foto do FAQ abaixo de 60em usa `faq-team-mobile.svg`, derivado do original
  com viewport `60 11153.59 540 619`, sem as margens transparentes. Assim, sua
  área visível acompanha a largura e a proporção da foto de Contato.
- No rodapé abaixo de 56.25em, logo, navegação e conteúdo ficam centralizados,
  com espaçamento vertical de `--space-10` entre os grupos e `--space-6`
  entre o logo e a navegação.
- Abaixo de 60em, o cabeçalho de Processos ocupa toda a largura do grid de
  conteúdo, alinhado aos demais títulos. Apenas os cards mantêm o limite de
  largura e a centralização.
- Nos depoimentos abaixo de 90em, a arte do card mantém a proporção e fica
  ancorada no canto inferior direito. Nome e cargo usam tamanhos fluidos menores
  que a frase, tanto no card de texto quanto no de vídeo.
- Nos títulos de seção horizontais abaixo de 60em, o ícone fica à esquerda,
  antes do texto do rótulo. A composição vertical de desktop é preservada.
- As seções tinham geometria de desktop sem uma adaptação completa para
  larguras menores. Foram adicionados contratos para cabeçalho/menu, hero,
  métricas, serviços, cases, conversa, aplicativo, depoimentos, processo,
  sobre, blog, FAQ, contato e rodapé.
- Grades e campos agora podem encolher; em telas menores, conteúdos passam
  para uma coluna. Seções passam a crescer com o texto.
- Cases tinham overflow interno mesmo sem overflow do documento: a largura
  mínima implícita da grade cortava descrições. As colunas e o painel usam
  `minmax(0, 1fr)` e `min-width: 0`; as interfaces demonstrativas têm altura
  suficiente para o conteúdo.
- A navegação móvel usa os mesmos links do desktop, fecha por Escape,
  navegação ou clique externo e não deixa links ocultos no percurso do Tab.
- Cases e serviços só prendem a rolagem com pelo menos 90em de largura,
  48em de altura, ponteiro preciso e movimento permitido. Fora dessas
  condições, cases usam abas e serviços usam scroll horizontal nativo,
  com controles por botão e teclado.
- O formulário usa colunas fluidas, ações que podem quebrar linha, erros
  em fluxo e textarea redimensionável. Os campos mantêm fonte de 1rem.
- A escala tipográfica do design system também foi atualizada; o título
  dessa página deixa de ser cortado no celular.
- O destino das âncoras considera o cabeçalho sem somar dois deslocamentos
  completos de header.

## Política de unidades

- `rem`: fontes, tracking fixo, espaçamento, controles, raios, limites de
  conteúdo e alturas mínimas da interface. Referência: 16px = 1rem.
- `em`: breakpoints, para acompanhar a preferência de fonte do navegador;
  detalhes que dependem diretamente da fonte local continuam em `em`.
- `%`, `fr`, `cqw`, viewport e `clamp()`: composição fluida. Os limites
  tipográficos de `clamp()` continuam em `rem`.
- `px`: bordas finas, coordenadas e viewBox do Figma, máscaras/SVGs,
  deslocamentos medidos pelo navegador e cálculos de canvas/GSAP.

Não há razão para converter o JSON do Figma nem coordenadas de canvas para
`rem`. A medição de texto usa o tamanho computado da fonte; os tamanhos
alternativos de `TextBlock` e o tracking passam pela mesma escala relativa.
A raiz usa `100%`, sem impor 16px ou aplicar 62.5%.

Os breakpoints principais são 90em, 60em e 37.5em (1440, 960 e 600px
na referência padrão). O rodapé conserva seus próprios pontos de quebra.

No depoimento dos cases, foto e identificação ficam ao lado da frase a partir
de 60em. Abaixo desse limite, a identificação fica abaixo da frase.

Na seção de conversa de 45 minutos, as quatro fotos respeitam a margem lateral
do conteúdo (`--content-gutter`) nos layouts abaixo de 90em.
As fotos superiores e inferiores têm também um recuo de `--space-20` (5rem)
em relação ao início e ao fim da seção; o padding vertical cresce pelo mesmo
valor para preservar a distância entre as fotos e o texto.
As quatro fotos preservam seus formatos e recortes originais no responsivo.
Todas usam a mesma escala responsiva com base de 1000px, limitada às larguras
originais de 316, 171, 190 e 345px e altura automática. Assim, a relação de
tamanho entre as quatro fotos permanece igual à do desktop.

Nos cinco CSS revisados, as ocorrências numéricas de `px`, desconsiderando
comentários, caíram de 1.223 para 118. Não restaram declarações de
`font-size`, `letter-spacing` ou `line-height` em `px` nesses estilos.

## Decisão: manter GSAP

A V1 já usa timelines, ScrollTrigger, pin/scrub, caminhos e atributos SVG,
controle direto de carrossel e efeitos que acompanham o ponteiro. A integração
com `useGSAP` e `matchMedia` oferece o ciclo de vida necessário para reverter
animações quando as condições mudam.

Motion for React (antes Framer Motion) é uma boa opção para transições de
layout e presença declarativas em componentes React. Adicioná-lo agora
criaria uma segunda camada de animação sem substituir a maior parte do que
este site já faz. Não há benefício de desempenho medido que justifique a
migração. Hover, foco e acordeão continuam usando CSS quando isso basta.

Reavaliar Motion se o produto ganhar muitos estados de layout compartilhado,
rotas com transições ou componentes que precisem de animação de entrada e
saída ligada à montagem. Não adicionar duas bibliotecas ao mesmo elemento.

Referências oficiais: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/),
[ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/),
[Motion para React](https://motion.dev/docs/react) e
[animações de layout do Motion](https://motion.dev/docs/react-layout-animations).

## Dependências e execução

- pnpm 10.26.0 fixado em `packageManager`; `pnpm-lock.yaml` substitui
  `package-lock.json`. Instalação reprodutível com
  `pnpm install --frozen-lockfile`.
- Scripts nativos permitidos explicitamente para Sharp e Tailwind no
  `pnpm-workspace.yaml`.
- Next.js atualizado de 16.4.0 para 16.4.1 após o audit apontar dois alertas
  críticos e um alto. O audit de produção passou sem alertas conhecidos.
  [Release oficial com as correções](https://github.com/vercel/next.js/releases/tag/v16.4.1).
- Exportação estática habilitada com `output: "export"` e
  `trailingSlash: true`. A entrega publicada é a pasta `out/`, sem servidor
  Next.js. Node.js fica restrito ao desenvolvimento e build.
- O `vercel.json` define `pnpm build` e saída `out`; a Root Directory do
  projeto na Vercel deve apontar para a raiz do repositório (campo vazio).
- `pnpm start` serve os arquivos exportados com `serve`, usado somente para
  prévia local. O patch de `compression` dessa ferramenta está fixado pelo
  override do pnpm; o audit completo permanece sem alertas conhecidos.

## Validação executada

`pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm build`,
`pnpm audit` e `git diff --check` concluídos sem falhas. As rotas `/` e
`/design-system` foram pré-renderizadas no build.

Medições no build de produção (largura em pixels CSS):

| Viewport | Área útil | Largura rolável do documento | Painéis fixados por scroll |
| --- | --- | --- | --- |
| 320 | 305 | 305 | 0 |
| 390 | 375 | 375 | 0 |
| 768 | 753 | 753 | 0 |
| 1024 | 1009 | 1009 | 0 |
| 1440 | 1425 | 1425 | 2 |
| 1920 | 1905 | 1905 | 2 |

- Em 320px, os títulos e parágrafos semânticos verificados não apresentaram
  overflow interno após a última correção.
- Menu: abrir/fechar, Escape e navegação para a seção do aplicativo.
- Serviços: botão seguinte deslocou o carrossel nativo.
- Cases: aba Starlog alterou o painel e `aria-selected`.
- FAQ: abertura atualizou `aria-expanded`.
- Blog: expansão aumentou de quatro para oito cartões.
- Contato: formulário vazio marcou os cinco campos, exibiu erros sem cortes
  e levou foco ao nome; nenhum envio externo foi realizado.
- Console sem erros em uma aba nova do build de produção.
- Na exportação estática: `/` e `/design-system/` responderam 200, uma URL
  inexistente respondeu 404, o SVG respondeu com MIME correto e o vídeo
  respondeu 206 a uma requisição parcial. Os assets locais referenciados
  pelos três HTMLs exportados (home, design system e 404) estão em `out/`.
- Menu e FAQ funcionaram na prévia estática; acesso direto e recarga de
  `/design-system/` passaram, sem erros de console. O deploy na Vercel não
  foi executado nesta revisão.

## Limites da revisão

A validação visual usa o navegador Chromium do ambiente, com barra de
rolagem ocupando 15px. Não substitui testes em aparelhos físicos, Safari,
VoiceOver ou preferências de fonte alteradas no sistema. Movimento reduzido
foi revisado no código; não foi emulado no sistema operacional.

Há conteúdo e integrações já existentes que precisam de definições reais:
idade da empresa exibida como “X anos”, artigos repetidos/demonstrativos,
cases Starlog/Ayalla ilustrativos, vídeo de depoimento não fornecido,
seletor de idioma sem tradução e formulário com confirmação simulada.
Esses itens não foram transformados em conteúdo ou serviços de produção
sem os dados correspondentes.

O convite QR do aplicativo usa a mesma composição desktop em todas as larguras. A unidade --app-qr-unit reduz proporcionalmente o conjunto quando a coluna tem menos de 540px, preservando cartão, sombra e contornos.

O fundo dos depoimentos usa `preserveAspectRatio="none"` no SVG para preencher o card em qualquer proporção, mantendo o recorte preto superior esquerdo alinhado às duas bordas, tanto no HTML quanto na textura WebGL.

Nos depoimentos entre 600 e 1439px, a foto pode encolher dentro da área útil do card para preservar o padding de 3rem abaixo do nome e cargo. Validado no Edge em 390, 768, 1280 e 1439px, com captura visual e medição das margens.

### Serviços: controles compactos
Nos layouts compactos e de toque, as setas ficam nas laterais, centralizadas sobre o carrossel como em Depoimentos. A linha exclusiva acima dos cards foi removida; o espaço superior de 3.5 rem preserva os robôs. Paginação segue abaixo. Verificados CSS e navegação na prévia mobile.


A altura do carrossel compacto considera o maior card, sem recalcular pelo conjunto visível durante o swipe. Isso estabiliza setas e paginação. Validado na prévia: altura de 633 px e posição vertical dos controles idênticas antes/depois da navegação.

