# Estrutura da V1

A V1 fica na raiz do repositório. `src/app/page.tsx` compõe seções explícitas na
ordem do layout Figma e fornece os derivados SVG preparados durante o build.
O resultado é estático; Node.js é necessário para desenvolver e compilar.

```text
src/
  app/                   rotas, layout e entrada dos estilos
  components/
    ui/                  primitivas compartilhadas
    layout/              cabeçalho e rodapé
    sections/            componentes, estilos e hooks de cada seção
    motion/              tema, títulos e interações globais
  data/                  conteúdo, navegação e manifesto de artwork
  lib/
    animation/           registro GSAP e mapas de refração
    figma/               tipos e adaptadores do export
    server/              leitura de SVGs apenas durante o build
  styles/                fontes, tokens, base, temas e responsividade
scripts/
  figma/                 geração de assets e testes de extração
  tests/                 testes de conteúdo e geometria
design/                  arquivos históricos fora da publicação
public/assets/           arquivos publicados
docs/                    arquitetura, guias e validações
```

## Responsabilidades

As seções Hero, Aplicativo, Conversa, Depoimentos, FAQ e Contato substituem as
ramificações dos antigos `DesignSection` e `ContentCards`. `SectionShell`
mantém o contrato de tema e geometria; `TextBlock` adapta apenas tipografia.

`data/site-content.ts` acessa o JSON na composição da página. Os adaptadores
de Cases e Serviços selecionam blocos por identificadores/ancestrais do export
e entregam modelos tipados aos componentes interativos. Não importe o JSON
completo em componentes cliente. `data/navigation.ts` concentra os destinos;
o texto visível não decide mais qual URL abrir.

Esses identificadores são contratos locais com o export atual, não uma API
estável do Figma. Uma reexportação deve preservar ou atualizar os seletores e
adaptadores correspondentes, com testes de conteúdo e SVG.

Hooks locais isolam a jornada e navegação de Serviços, o arrasto/refração dos
Depoimentos e a simulação do personagem do rodapé. A geometria do personagem
é pura e testável. Mantenha o cleanup de listeners, observadores e timelines.

## CSS e animação

`app/globals.css` é a entrada da cascata. A extração inicial manteve a ordem
dos blocos; a revisão posterior consolidou declarações sobrescritas em Cases
e Serviços, retirou estilos de experimentos e padronizou a formatação.
`styles/responsive.css` conserva os ajustes finais compartilhados.

A separação de CSS por seção ainda é parcial: por exemplo,
`services/scroll-journey.css` também contém regras de Cases e Aplicativo, e
`app-showcase/artwork.css` altera outras seções. Confira a ordem dos imports
antes de mover essas regras. A consolidação planejada está em
[Sustentabilidade da V1](maintenance.md).

`pnpm css:check` verifica as cascatas global, do personagem do rodapé e do
módulo do design system. `css:fix` remove somente declarações idênticas com
o mesmo seletor, contexto de at-rules e prioridade, sem reordenar regras ou
retirar fallbacks diferentes. Imports qualificados/repetidos exigem revisão;
keyframes e seletores aninhados não são consolidados automaticamente.

GSAP permanece adequado às timelines, SVGs, scrub e pinning existentes. Não
foi adicionada outra biblioteca de animação. Use `lib/animation/gsap.ts` para
compartilhar o registro dos plugins e respeite `prefers-reduced-motion`.

## Pipeline de assets e publicação

`predev` e `prebuild` preparam 22 SVGs inline e extraem suas imagens embutidas
para dez arquivos com nome baseado no conteúdo. Os bytes das imagens, IDs e
geometria SVG são preservados. `lib/server/` aplica os namespaces necessários
antes de enviar os SVGs aos componentes.

A normalização das telas (`normalize-phone-screens.mjs`) move o atributo
`transform` do `<svg data-screen-source>` para um grupo `<g>` externo. Esse
formato preserva o resultado geométrico e evita a tela invisível no Safari.
Os testes verificam dimensões, conteúdo, IDs e estabilidade entre execuções.

Processos também gera `.generated/process-fragments.json`: quatro cards e
um marcador, cada qual com suas próprias dependências SVG. O módulo servidor
monta uma superfície por card; as telas menores usam a composição HTML/CSS,
sem uma segunda cópia SVG oculta. Veja [a revisão dos cards](../qa/process-cards.md).

As fontes TTF originais são convertidas para sete WOFF2 em
`public/assets/generated/fonts/`. Fontes embutidas dos derivados inline são
removidas somente quando os bytes e descritores coincidem com as fontes
compartilhadas. O fundo estático do hero conserva a árvore visível e remove
definições sem referência. Seu fundo e sua máscara usam deslocamento zero:
a seção já ocupa toda a largura, sem o offset do antigo canvas de 1440 px.

Os assets são gravados por arquivo temporário e rename; conteúdo idêntico
não é regravado. O build não depende de Python para essas otimizações.

Somente os derivados inline usam imagens externas. SVGs em `<img>` precisam
continuar autocontidos. `.generated/` e `public/assets/generated/` são
regenerados e ignorados pelo Git. `prebuild` também limpa a saída `out/`, após
validar que o diretório resolvido está dentro desta implementação, para não
manter arquivos retirados de `public/` em um build anterior.

A Vercel deve usar a raiz do repositório como Root Directory, `pnpm build` e saída `.next`
para a integração Next.js ler os manifestos. A exportação estática continua em `out`.
O projeto não precisa de servidor Next.js em execução para servir a publicação.
