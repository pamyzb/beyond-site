# Revisão de estrutura e oportunidades de refatoração da V1

> Revisão histórica anterior à refatoração. Veja o resultado implementado em
> [arquitetura](architecture/structure.md) e [validação](qa/structure-refactor.md).
> A árvore `prototype/` abaixo registra a organização da época. A aplicação foi
> posteriormente movida para a raiz; consulte [a migração](qa/root-migration.md).

Data: 24/10/2026. Escopo: `prototype/`, preservando o contrato de V1 e a
Root Directory da Vercel. Esta revisão não move, exclui ou refatora os
arquivos de execução. A proposta abaixo é o destino sugerido, não a árvore
atual.

## Resultado da inspeção

- 54 módulos TypeScript/TSX em `src/`; 29 declaram `use client`.
- Grafo de imports estáticos, reexports e imports dinâmicos, resolvido com
  o TypeScript a partir das três entradas de página/layout: 52 módulos
  alcançáveis e dois fora das rotas atuais.
- `src/app/globals.css`: 1.823 linhas, 137.896 bytes, 1.153 regras e 3.662
  declarações. Há 101 seletores repetidos no mesmo contexto de at-rules.
  Repetição não significa automaticamente regra removível: a ordem atual
  faz parte da cascata.
- `public/`: 180 arquivos e 106.958.550 bytes, aproximadamente 107 MB.
  Esse é o tamanho dos arquivos disponíveis para publicação, não o volume
  transferido ao abrir a página.
- `out/index.html` do build local existente: 13.696.823 bytes, aproximadamente
  13,7 MB sem compressão. Uma compressão gzip local gerou 8.319.954 bytes.
  Foram encontradas 22 ocorrências de imagens base64, correspondentes a dez
  conteúdos distintos e 8.049.304 caracteres base64 no HTML. Isso confirma
  repetição de conteúdo embutido; não é uma medição de Core Web Vitals nem
  da compressão efetiva da Vercel.

## Prioridades

| Prioridade | Arquivos ou área | Problema observado | Refatoração indicada | Risco |
| --- | --- | --- | --- | --- |
| Alta | `src/app/page.tsx`, `src/lib/process-artwork.ts`, `public/assets/figma/` | Leitura, alteração e identificação de SVGs na rota; imagens embutidas repetidas no HTML e na serialização de props. | Criar carregamento/preparação de artwork no build; extrair imagens raster para arquivos reutilizáveis; manter inline apenas os vetores que precisam ser animados. | Alto: preservar IDs, filtros, máscaras e seletores GSAP. |
| Alta | `src/app/globals.css` e `style.css` | Estilos de todas as seções, temas e variantes acumulados em uma cascata extensa. | Consolidar o estilo final por seção e colocar seus breakpoints juntos; manter reset, fontes, tokens e tema globais. | Alto: mudar a ordem dos imports pode mudar o visual. |
| Alta | `design-section.tsx`, `content-cards.tsx`, `text-block.tsx` | Componentes genéricos concentram exceções de várias seções e detalhes do export Figma. | Criar seções explícitas e um adaptador de dados Figma; reduzir o renderizador de texto ao seu papel tipográfico. | Médio/alto: preservar ordem, texto, classes e atributos usados por animações. |
| Média | `services-section.tsx` | Conteúdo, paginação, navegação, geometria da rota e animação no mesmo componente. | Separar dados, `use-services-navigation` e `use-services-journey`; deixar JSX/composição no componente. | Médio: recalcular medidas e restaurar scroll ao trocar breakpoint. |
| Média | `testimonial-carousel.tsx` | Estado ativo, arraste/inércia, refração e apresentação misturados. | Separar controle de seleção/arraste do efeito visual; manter cards e paginação como apresentação. | Médio: verificar swipe, teclado e elementos `inert`. |
| Média | `footer-runner.tsx` | Parser de caminhos SVG, medição de obstáculos e física/animação dentro do componente. | Extrair geometria para funções puras e o ciclo de animação para `use-footer-runner`. | Médio: comparar percurso e colisões em larguras diferentes. |
| Média | `cases-section.tsx`, `src/lib/design.ts` e conteúdo | Dados dependem da posição dos blocos e links são inferidos pelo texto visível. | Introduzir objetos tipados de conteúdo, ações e navegação com IDs estáveis. | Médio: preservar os mesmos destinos e a mesma copy. |
| Baixa | `button.tsx`, helpers de heading e arquivos com JSX em uma linha | Mapas de variantes duplicados, helpers semelhantes e código difícil de revisar. | Compartilhar constantes/helpers pequenos e aplicar formatação consistente. | Baixo, desde que a saída HTML/classes permaneça equivalente. |

## Achados específicos

### 1. A rota inicial está preparando assets

`src/app/page.tsx:17` lê dez SVGs do rodapé. A partir da linha 18, também
corrige manualmente um ícone, remove XML, altera IDs e carrega variantes de
artwork. As substituições de IDs e remoção de XML se repetem para diversos
assets.

Destino sugerido: `src/lib/server/artwork.ts` para leitura e transformações
compartilhadas, com funções pequenas de prefixação de IDs, e
`scripts/figma/` para transformações que podem gerar arquivos previamente.
A página deve compor as seções a partir de conteúdo/artwork preparados.
Isso continua compatível com a exportação estática: código de preparação
roda no build.

Só mover as strings grandes para um helper não reduz o HTML. A etapa de
desempenho precisa externalizar imagens embutidas e evitar enviar versões
completas repetidas de SVGs a componentes client. SVGs que dependem de
animação de paths não podem simplesmente ser trocados por `<img>`.

### 2. O CSS conserva várias versões da mesma regra

Exemplos em `src/app/globals.css`, no mesmo contexto de at-rules:

- `.case-testimonial`: sete blocos, nas linhas 191, 203, 226, 235, 242,
  1049 e 1063.
- `.case-browser-main`: cinco blocos, nas linhas 177, 202, 231, 239 e 1044.
- `.services-rail`: quatro blocos, nas linhas 312, 1038, 1060 e 1072.

Além disso, `globals.css` importa `style.css`, `tokens.css` e `fonts.css` da
raiz, enquanto o CSS do rodapé fica junto ao componente. Há, portanto,
duas convenções de localização.

Primeiro consolidar uma seção por vez, preservando a precedência efetiva.
Depois separar os arquivos. Nessa primeira etapa, classes públicas e
seletores GSAP devem permanecer estáveis; CSS Modules pode ser avaliado
para estilos locais após essa estabilização.

### 3. Os renderizadores ainda conhecem a estrutura do Figma

- `content-cards.tsx:15` importa o JSON completo de layout (125.078 bytes)
  em um módulo client. O uso de `headerSection` está ligado ao ramo de
  rodapé, mas o componente retorna `null` para rodapé na linha 38. A
  navegação condicional da linha 76 é inalcançável por esse caminho.
- `text-block.tsx:14` reconhece o botão Maps pelo texto; na linha 23 trata
  QR e, na linha 25, títulos específicos do aplicativo. Essas composições
  cabem em componentes das respectivas seções.
- `cases-section.tsx:19` transforma todos os blocos em array e desestrutura
  conteúdo por posição. Reordenar blocos no export pode mudar o significado
  dos campos sem erro de tipo.
- `src/lib/design.ts:46` escolhe URLs usando frases e expressões regulares.
  Uma revisão de copy pode alterar involuntariamente o destino de uma ação.

Criar `src/data/` com navegação, ações e conteúdo tipados; manter o JSON
original como referência do design e adaptar seus dados na borda do sistema.
Não é necessário editar as coordenadas originais para essa separação.

### 4. Há código fora do caminho atual

Confirmados pelo grafo de imports das rotas atuais:

- `src/components/site/hero-three.tsx`: única implementação que importa
  `three` e seus addons. O site atual monta `HeroGlass`.
- `src/lib/impact-paint.ts`: exporta `createImpactPaint`, sem consumidor
  encontrado em `src/`.

Esses módulos podem ser arquivados fora de `src/` se os estudos precisarem
ser preservados. Nessa situação, `three` e `@types/three` tornam-se candidatos
à remoção do manifesto/lockfile. Isso não significa que Three.js esteja
atualmente sendo baixado pelo navegador: a dependência sem import alcançável
pode já estar fora do bundle ativo.

Limpezas menores confirmadas pela análise do TypeScript:

- `process-section.tsx:5`: import de `TextBlock` sem uso.
- `about-card.tsx:4`: parâmetro/prop `index` sem uso.
- `footer-content.tsx:17`: constante de módulo `bottomArtwork` sem uso.
  A prop com esse mesmo nome é usada e deve permanecer.
- `button.tsx`: os dois componentes repetem o mapa `variantClass`.

`measure-type.ts:16` e `:17` escrevem `--block-width`/`--block-height`, mas
não foram encontrados consumidores dessas variáveis no código/CSS atual.
O helper ainda é chamado por `motion-root.tsx:28`. Também não foram
encontrados consumidores de `--mobile-size`, `var(--x)` ou `var(--y)` do
renderizador de texto. Revisar a remoção desse contrato antigo em conjunto,
com comparação visual, em vez de perpetuar medições sem consumidor.

### 5. Originais e propostas estão no diretório publicado

- `public/assets/clients/pasteur-photo.png` tem 36.649.392 bytes, cerca de
  36,6 MB. A seção ativa usa `pasteur-photo.jpg`, de 381.977 bytes. O PNG
  deve ser preservado como original em `design/source-assets/` caso ainda
  seja necessário; não foi encontrada referência a ele em `src/`.
- As fotos dos clientes têm versões PNG e JPEG. Isso não as torna duplicatas
  exatas: uma pode ser original e outra derivada. Separar os papéis antes
  de excluir.
- `public/proposals/` contém estudos HTML/CSS e uma imagem de referência.
  A presença de `out/proposals/metrics-editorial.html` confirma que são
  publicados pela exportação. O destino adequado é `design/proposals/`,
  salvo se houver intenção explícita de oferecer essas páginas no site.
- `public/assets/ai-visual.png` e `public/assets/natalia.png` têm conteúdo
  idêntico por SHA-256. Essa duplicação é pequena; não é a prioridade de
  desempenho.

Gerar um inventário de assets com papéis `runtime`, `source` e `study` antes
de reorganizar URLs. Referências dinâmicas em templates e scripts impedem
classificar todos os SVGs como removíveis apenas por busca textual.

### 6. Documentação e scripts precisam acompanhar a implementação

`docs/hero-3d.md:3` afirma que `hero-three.tsx` está ativo, mas a montagem
atual usa `HeroGlass` em `design-section.tsx`. Esse documento deve virar
registro do estudo ou descrever o componente real.

`design-qa.md` referencia evidências fora da pasta versionada e comandos
antigos de npm. Separar registros históricos, com data e escopo, dos guias
que descrevem a implementação atual.

`build-figma.py` fica na raiz, e `scripts/build-bleed-art.py` em outra pasta.
Agrupar em `scripts/figma/`, ajustando a resolução de `ROOT`, comandos da
documentação e localização dos arquivos de entrada. O exportador atual
depende de `tmp/figma-reference/` fora da pasta versionada; definir como
obter esse insumo é necessário para uma reconstrução reproduzível.

## Estrutura sugerida

```text
prototype/
  src/
    app/
      layout.tsx
      page.tsx                       # composição da home
      globals.css                    # entrada dos estilos globais
      design-system/
    components/
      ui/                            # Button, Title e primitivas compartilhadas
      layout/
        header/
        footer/                      # conteúdo, decoração e runner
      sections/
        hero/
        metrics/                     # métricas e faixa de clientes
        services/                    # seção, card, hooks e CSS local
        cases/
        conversation/
        app-showcase/
        testimonials/
        process/
        about/
        blog/
        faq/
        contact/                     # formulário, campos e validação
      motion/                        # coordenação global e comportamento compartilhado
    data/
      navigation.ts
      site-content.ts
    lib/
      animation/                     # GSAP e geometria compartilhada
      figma/                         # tipos e adaptadores do export
      server/                        # preparação de artwork no build
    styles/
      base.css
      fonts.css
      tokens.css
      themes.css
  public/
    assets/                          # somente arquivos necessários à publicação
  design/
    source-assets/                   # originais preservados
    proposals/                       # estudos fora da publicação
    experiments/                     # implementações arquivadas
  scripts/
    figma/
  docs/
    architecture/
    qa/                              # registros com data e evidências rastreáveis
  next.config.ts
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  vercel.json
```

Os hooks específicos devem ficar junto de sua seção, sem uma pasta global
de hooks que apenas replique a mistura atual. Não é necessário transformar
cada trecho curto em um novo componente: extrair por responsabilidade ou
reutilização real.

`node_modules/`, `.next/`, `out/` e `*.tsbuildinfo` continuam sendo artefatos
gerados/ignorados. Não pertencem à árvore de código-fonte proposta.

## Ordem de execução recomendada

1. **Limpeza e rastreabilidade:** documentar a implementação ativa, separar
   estudos/originais da publicação, retirar os símbolos sem uso e decidir
   o destino dos dois módulos não alcançáveis. Verificar o exportador antes
   de remover qualquer asset.
2. **Dados e preparo do build:** extrair helpers de SVG, centralizar ações
   e navegação, criar os primeiros modelos de conteúdo tipados.
3. **Seções explícitas:** começar por Hero e Aplicativo para diminuir os
   condicionais de `DesignSection`, `ContentCards` e `TextBlock`.
4. **CSS por seção:** consolidar e mover uma seção por alteração, com seus
   estados e breakpoints juntos. Evitar juntar uma mudança visual com uma
   reorganização de arquivos.
5. **Animações complexas:** extrair os hooks de Serviços, Depoimentos e
   Runner; funções puras de geometria recebem testes focados nos limites
   relevantes, sem testar apenas a existência de wrappers.
6. **Otimização dos assets:** externalizar imagens embutidas e reduzir
   duplicação de artwork, medindo HTML e requests após cada etapa. O
   inventário pode começar na etapa 1 e a implementação ocorrer em paralelo
   às seções afetadas, mas a otimização completa tem risco visual maior.

Para cada etapa com mudança de execução: `pnpm typecheck`, `pnpm build` e
smoke test de `/`, `/design-system/`, 404, navegação e interações. Para CSS
ou animação: comparar 320, 390, 768, 1024, 1440 e 1920px e movimento reduzido.
Para a otimização de artwork: verificar IDs SVG, máscaras, filtros e
duplicações de imagens, além da comparação visual.

## Verificação desta revisão

Foram usados AST/resolução de imports do TypeScript, diagnósticos de
símbolos não utilizados, parsing do CSS com PostCSS, comparação de assets
por hash e inspeção do HTML exportado existente. Não foi executado um novo
build: esta alteração adiciona apenas o relatório, sem mudar o código de
execução. Não foi feita exclusão automática de assets ou módulos.
