# Ajustes da página de colaboradores agênticos — V1

Data: 30/10/2026. Status: implementação executada na V1; validação e ressalvas registradas em `artifacts/agenticos-adjustments/verification.md`.
Base: commit `21df5b02ae2acb5479b6510b6a512a83bf022a7a` e arquivos locais consultados nesta data, que já contêm alterações não commitadas.

## Objetivo e decisões aprovadas

Reorganizar a página `/colaboradores-agenticos/` para comunicar benefícios, autonomia operacional, remuneração e resultados, respeitando a identidade visual da V1. Este documento incorpora as correções da usuária e prevalece sobre a ordem anterior registrada em `docs/planejamento-colaboradores-agenticos.md` para este trabalho.

- Contato existente permanece integralmente como está: conteúdo, layout, formulário, animações e composição ao redor. Não criar outro bloco de contato.
- Preservar os três cards de Estratégico, Tático e Operacional, com seus responsáveis, textos, ícones e apresentação atual.
- Remuneração será uma seção independente e usará a composição atual de Sobre.
- Sobre deixa de existir como seção editorial própria; seu layout é reaproveitado, não descartado.
- Cases usarão empresas fictícias neste primeiro momento, com identificação visível de conteúdo ilustrativo.
- A Home é referência de componentes e animação; não é objeto de reformulação.

## Evidência e referências que governam a mudança

| Responsabilidade               | Fonte atual                                                                                                                                                  | Uso no ajuste                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Composição e ordem da página   | `src/app/colaboradores-agenticos/page.tsx`                                                                                                                   | Reordenar seções e manter os componentes de contato e rodapé                                                             |
| Conteúdo do serviço            | `src/data/agent-service.ts`                                                                                                                                  | Centralizar benefícios, remuneração, cases fictícios e entrega                                                           |
| Layout de Sobre e cards atuais | `src/app/colaboradores-agenticos/service.css`                                                                                                                | Reutilizar `.agent-about-layout`, `.agent-about-photo`, `.agent-service-prose`, `.agent-role-list` e `.about-panel-card` |
| Tipografia e escala            | `docs/typography.md`, `src/styles/tokens.css`                                                                                                                | Usar a escala e as variantes atuais de títulos                                                                           |
| Temas                          | `src/styles/themes.css`, `src/components/ui/section-heading-accent.css`                                                                                      | Herdar as cores semânticas; conferir transição de tema                                                                   |
| Títulos                        | `src/components/ui/section-heading.tsx`, `secondary-section-heading.tsx`, `title.tsx`                                                                        | Manter hierarquia, rótulos e destaque entre chaves                                                                       |
| Depoimentos da Home            | `src/components/sections/testimonials/testimonial-carousel.tsx`, `testimonial-card.tsx`, `use-testimonial-carousel.ts`, `testimonials.css`, `responsive.css` | Referência exata de composição e movimento para os cases                                                                 |
| Efeito dos depoimentos         | `src/lib/animation/testimonial-glass.ts`, `testimonial-texture.ts`                                                                                           | Verificar compatibilidade do efeito com o novo conteúdo antes de compartilhar                                            |
| Janela Safari da Home          | `src/components/sections/cases/cases-section.tsx`, `case-panel.tsx`, `cases.css`, `viewport-layout.css`, `responsive.css`                                    | Reaproveitar moldura, toolbar, proporções e reflow na demonstração financeira                                            |
| Animações da página            | `src/components/motion/motion-root.tsx` e módulos importados                                                                                                 | Conferir seletores, âncoras e gatilhos após reorganização                                                                |
| Verificação existente          | `tests/e2e/agent-service.spec.ts`, `tests/e2e/testimonial-glass.spec.ts`, `tests/e2e/site.spec.ts`                                                           | Cobrir interações alteradas e regressões na Home                                                                         |

O código da raiz é a V1. `design-system/README.md` contém referências históricas a `prototype/`; esses caminhos não devem orientar a implementação atual. Priorizar os proprietários ativos acima e `docs/typography.md`.

Não foi realizada inspeção visual do navegador nesta etapa. As decisões derivam do pedido aprovado e da leitura do código. Dimensões finais e ritmo visual precisam de validação renderizada na implementação.

## Ordem final

1. Hero — preservar.
2. Benefícios — novo bloco com três itens.
3. Como operam — explicação de autonomia, animação e os três cards existentes.
4. Forma de remuneração — composição reaproveitada de Sobre.
5. Cases — substitui a apresentação atual de Resultados.
6. Aplicações — preservar o carrossel existente.
7. Eficiência — demonstração financeira na moldura Safari.
8. Entrega — destacar o conhecimento presencial da operação.
9. Contato existente — permanece, sem ajustes.

## Direção por seção

### 1. Hero

Preservar texto, cena, dimensões e interações atuais. O pedido não exige uma nova versão do hero. Manter o CTA secundário direcionado aos resultados; conservar `#resultados` como âncora dos novos cases.

### 2. Benefícios

Criar uma seção com `SectionHeading` e três itens principais, com o mesmo vocabulário de superfícies, ícones e divisórias dos cards já presentes em Agênticos. Não criar um segundo estilo de card.

Copy:

1. **Economia de até 50% da sua folha.**
2. **Qualidade e assertividade em todos os processos.** Apoio: “Chega de dor de cabeça.”
3. **Dados e insights que impulsionam negócios.**

No desktop, três colunas; no celular, empilhar sem esconder conteúdo. O percentual ganha destaque com a escala existente, sem introduzir nova família ou tamanho arbitrário. Não adicionar um segundo bloco extenso de explicação sobre o serviço.

### 3. Como operam

Título proposto: **Sua operação {rodando sozinha}**.

Texto de abertura: “Tecnologia não é só ter um bom sistema se alguém precisa conduzir cada etapa. Nossos agentes executam os fluxos definidos para sua operação.”

Acrescentar uma comparação curta, acima dos cards:

- **IA assistiva:** depende de uma ação humana para iniciar ou avançar cada tarefa.
- **Colaborador agêntico:** recebe um evento, executa as etapas e encaminha exceções conforme as regras da operação.

Esse contraste descreve o modo de operação, sem prometer autonomia irrestrita de toda IA. Não transformar a comparação em mais três cards concorrentes.

Animação: dois robôs em uma sequência de trabalho. Um prepara e empacota uma caixa; o outro recebe, confere e encaminha. Uma nova caixa inicia o ciclo sem clique humano. Usar uma faixa ilustrativa compacta, com proporção horizontal no desktop e composição simplificada no celular. A imagem representa automação de processos, sem sugerir que o serviço entregue robótica física.

Manter os três cards atuais imediatamente após essa explicação: Estratégico / Humano, Tático / Humano + IA e Operacional / IA. Não reduzir sua legibilidade para compactar a seção. Reduzir repetição textual e vazios verticais ao redor.

Fechamento editorial com `SecondarySectionHeading`: **Humanos no estratégico. IA no operacional.** Apoio: “Colaboradores humanos naquilo que realmente importa.”

Usar **“O custo de não fazer nada é muito grande.”** como frase curta de passagem para Remuneração, sem criar outra seção ou CTA.

### 4. Forma de remuneração

Promover o conteúdo hoje dentro de Entrega a uma seção completa antes dos cases.

- Rótulo: “Forma de remuneração”.
- Título: **Nossa remuneração acompanha a {economia que geramos}**.
- Texto: “A Beyond recebe uma fração da economia gerada para sua empresa.”
- Complemento: “Nossa remuneração é no sucesso.”

Usar a mesma composição atual de Sobre: imagem à esquerda e texto à direita em `.agent-about-layout`, com o mesmo comportamento responsivo. Reaproveitar inicialmente `public/assets/servicos/agenticos-sobre.svg`, mantendo descrição alternativa coerente com a imagem. Aumentar a presença pela posição e pela hierarquia de seção; não criar um card promocional gigante ou inventar percentuais de cobrança, taxas e condições.

Retirar somente o antigo bloco `.agent-delivery-remuneration` de Entrega para não duplicar a informação.

### 5. Cases / Resultados

Preservar o ID `resultados` e a ideia “Impacto que {se mede}”. Substituir a grade atual de resultados por setor pelo carrossel no padrão de Depoimentos da Home.

Composição: card central em destaque, prévias laterais, superfícies e decoração dos depoimentos, setas, paginação e arraste com movimento equivalente. Adaptar a área de retrato para identificação da empresa e métrica principal. Sem botão de vídeo, pois não existem vídeos desses cases.

Hierarquia de cada card:

1. Selo visível “Case ilustrativo · empresa e dados fictícios”.
2. Logo tipográfico fictício, nome da empresa e segmento.
3. Faixa de faturamento anual da empresa.
4. Economia na folha como número principal.
5. Frase ilustrativa e atribuição a um cargo fictício.
6. Tags de outros KPIs.

Dados iniciais de composição, todos fictícios:

| Empresa fictícia        | Segmento     | Faturamento anual     | Economia na folha | KPIs ilustrativos                                     | Frase ilustrativa                                                    |
| ----------------------- | ------------ | --------------------- | ----------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| Distribuidora Exemplo A | Distribuição | R$ 40 a R$ 80 milhões | 42%               | Pedidos 12× mais rápidos; 95% de assertividade        | “A operação ganhou ritmo e nosso time passou a cuidar das decisões.” |
| Indústria Exemplo B     | Indústria    | R$ 20 a R$ 60 milhões | 38%               | 60% menos retrabalho; conciliação 8× mais rápida      | “As rotinas passaram a avançar com menos acompanhamento manual.”     |
| Comércio Exemplo C      | Comércio     | R$ 10 a R$ 30 milhões | 50%               | Atendimento 6× mais rápido; 70% menos tarefas manuais | “Agora temos mais clareza dos números e tempo para planejar.”        |

Usar “Gestão de operações · exemplo fictício” como atribuição. Logos são wordmarks locais com Poppins e cores do sistema, sem marcas de clientes reais ou imagens externas. Não apresentar essas frases como depoimentos verificados.

Os resultados atuais, agregados por setor e com faixas até 72%, não serão convertidos em dados dessas empresas. Preservar sua origem no histórico; o novo conjunto demonstrativo deve ficar separado no modelo de dados. A chamada de até 50% é a solicitada para Benefícios, não uma conclusão comprovada pelos exemplos fictícios.

### 6. Aplicações

Preservar conteúdo, identidade e funcionamento do `CircularCarousel`. Ajustar somente espaçamento de encontro com as novas seções se necessário. Não trocar sua animação pela dos cases.

### 7. Eficiência

Título proposto: **Veja a eficiência {em operação}**. Apoio: “Do recebimento à conciliação, acompanhe um fluxo financeiro automático.”

Reutilizar a composição Safari da Home: moldura arredondada, barra superior, controles e enquadramento. A tela interna é uma simulação financeira local identificada como **“Demonstração ilustrativa”**; não é uma integração real nem requer serviço externo.

Sequência visível:

1. Receber uma cobrança ilustrativa de R$ 1.250,00.
2. Conferir os dados e localizar o lançamento correspondente.
3. Conciliar o recebimento.
4. Atualizar o status para “Conciliado” e o resumo financeiro.

Mostrar estados em uma linha do tempo curta e em uma lista financeira, com os mesmos valores durante todo o ciclo. Após uma pausa no resultado, reiniciar de forma coerente. Nenhum clique é necessário para demonstrar o fluxo. Não simular pagamento bancário efetivo.

No celular, reduzir colunas e detalhes secundários da tela, preservando valor, etapa e conclusão. Não encolher toda a interface como uma imagem ilegível.

### 8. Entrega

Título: **Queremos {conhecer presencialmente} sua operação**.

Manter a jornada atual de três etapas, o traçado e o robô construtor. Alterar a primeira etapa para “Conhecemos sua operação presencialmente”, explicando o mapeamento de pessoas, sistemas, rotinas e gargalos. Manter o desenvolvimento sob medida e a implantação com acompanhamento nas etapas seguintes.

Não repetir a remuneração. Não incluir condições comerciais sobre a visita que não foram fornecidas.

### 9. Contato

Manter a chamada atual a `ContactSection`, seus dados, artwork, banda, padrões e layout. Não alterar o formulário nem o rodapé. A posição continua após Entrega.

## Regras de design e reutilização

- Usar `Title`, `SectionHeading`, `SecondarySectionHeading`, `ButtonLink` e os componentes atuais em vez de recriar primitivas.
- Poppins e pesos por `--font-sans`, `--weight-*`; tamanhos por `--text-*`, entrelinhas por `--leading-*`, tracking por `--tracking-*`.
- Usar `--color-action`, `--color-accent`, `--color-page`, `--color-surface`, `--color-text`, `--color-text-subtle` e variáveis `--section-heading-*` conforme o tema. Não fixar novas cores locais para imitar a Home.
- Usar `--space-*`, `--content-width`, gutters e raios existentes quando equivalentes. Manter exceções geométricas já existentes dos componentes de referência.
- Fontes e dimensões em `rem`, breakpoints em `em`, grid/flex e altura pelo conteúdo. Não usar zoom global ou altura fixa para acomodar texto.
- Títulos com destaque em itálico entre chaves, rótulos e ícone Beyond existentes. Preservar a apresentação atual dos três cards.
- GSAP para movimento de interface. Não adicionar outra biblioteca de animação. Robôs com a linguagem do robô atual; preferir SVG local animado para a sequência, sem alterar a cena Spline do hero.
- Animações só enquanto visíveis; desmontar observers/timelines; respeitar `prefers-reduced-motion`. Na redução de movimento, mostrar processo e resultado compreensíveis estaticamente.
- Manter a Home visual e funcionalmente igual. Classes locais devem ser escopadas à página de Agênticos.

## Plano de execução por entregável

### A. Ordem, dados e conteúdo estático

- [x] Ler `AGENTS.md` e os guias relevantes em `node_modules/next/dist/docs/` antes de escrever código.
- [x] Registrar o estado inicial do diff e capturas da página e das referências da Home. Não sobrescrever alterações locais preexistentes.
- [x] Atualizar `src/data/agent-service.ts` com benefícios, remuneração independente, cases demonstrativos e entrega revisada.
- [x] Reorganizar `src/app/colaboradores-agenticos/page.tsx` na ordem aprovada, preservando hero, cards, aplicações e contato.
- [x] Reutilizar a composição Sobre para Remuneração em `service.css` e remover apenas a apresentação duplicada antiga.
- [x] Conferir `MotionRoot`: `themeTrigger="#resultados .section-heading"` continua encontrando o novo bloco; substituir o `whatsappTrigger="#sobre"` por `#beneficios` sem mudar a política atual de exibição.
- [x] Preservar `#como-atuam`, `#resultados`, `#aplicacoes` e `#contratacao-e-entrega`. Acrescentar `#beneficios`, `#remuneracao` e `#eficiencia`.

Aceite: ordem correta, âncoras válidas, três benefícios, três cards originais presentes, remuneração em destaque e contato intacto.

### B. Cases no padrão dos depoimentos

- [x] Criar `src/components/sections/agent-service/agent-results-carousel.tsx` para composição dos cases e `agent-results.css` para adaptações locais.
- [x] Reutilizar o hook de depoimentos somente após conferir suas premissas: atualmente há três posições e conteúdo de vídeo, e a textura do vidro pode depender da arte original. Manter três cases nesta etapa e não inventar uma API genérica para quantidade variável sem necessidade.
- [x] Preservar comportamento e defaults da Home caso seja necessário tornar conteúdo/textura parametrizáveis. O efeito de vidro deve refletir o novo card, sem renderizar por baixo a imagem de depoimento original.
- [x] Adaptar conteúdo, setas, paginação e rótulos para cases; manter leitura e interação por teclado, arraste e toque.
- [x] Conferir as três empresas, os avisos de ficção e a legibilidade das tags em todos os tamanhos.

Aceite: layout e movimento reconhecíveis como os dos depoimentos, três cases distintos, nenhum controle de vídeo e nenhuma regressão no carrossel da Home.

### C. Operação autônoma e demonstração financeira

- [x] Criar `agent-operation-scene.tsx` e `agent-operation.css` na pasta local `src/components/sections/agent-service/` para a cena dos robôs e a comparação curta.
- [x] Preservar o JSX e as classes dos três cards existentes; acrescentar os novos elementos ao redor.
- [x] Criar `agent-finance-demo.tsx` e `agent-finance.css` na mesma pasta, com estados da simulação e moldura Safari.
- [x] Extrair somente a moldura Safari para um componente compartilhado se isso puder ser feito mantendo a Home idêntica; não reutilizar `CasePanel` inteiro com história, CTA e depoimento de outro projeto. Se a extração exigir reformulação, manter a composição local com os mesmos tokens e medidas.
- [x] Usar timelines locais, pausar fora de tela e fornecer estados estáticos claros para movimento reduzido e falha de animação.

Aceite: a passagem de caixas comunica um fluxo sem comando humano; a tela financeira conclui um ciclo coerente; ambos funcionam sem ocultar informações no celular.

### D. Verificação e entrega

- [x] Verificar 320, 390, 768 e 1440 px, incluindo títulos longos, tags, cards e tela Safari. Nenhum overflow horizontal da página.
- [ ] Comparar Home antes/depois: depoimentos, cases Safari, contato, header, footer e transições de tema.
- [x] Validar setas, paginação, arraste, foco, toque, links internos e preferência de movimento reduzido.
- [x] Atualizar expectativas obsoletas em `tests/e2e/agent-service.spec.ts` apenas quando contradisserem a versão aprovada; o teste atual ainda espera um título antigo do hero. Não mudar o hero para satisfazer essa expectativa.
- [x] Acrescentar verificações de integração úteis: ordem das seções, ausência de âncoras quebradas, alternância dos cases e conclusão da demonstração. Não criar testes que apenas dupliquem textos ou estilos.
- [x] Executar `pnpm typecheck`, `pnpm css:check`, `pnpm test` e `pnpm build`.
- [x] Com o build atualizado, executar `pnpm exec playwright test tests/e2e/agent-service.spec.ts tests/e2e/testimonial-glass.spec.ts tests/e2e/site.spec.ts` nos projetos configurados.
- [x] Verificar formatação somente nos arquivos tocados com `pnpm exec prettier --check <arquivos tocados>`, substituindo a lista pelos caminhos reais. Não aplicar formatação em massa no repositório.
- [x] Registrar capturas desktop/mobile, resultado dos comandos e eventuais falhas anteriores à mudança. Revisar o diff para garantir que contato e arquivos alheios ao escopo foram preservados.

## Limites e condições de revisão

Não alterar tokens globais, reformular Home, trocar a cena do hero, adicionar dependências, implementar backend financeiro ou publicar dados fictícios como resultados reais. Não executar resets, commits ou limpeza de alterações alheias como parte deste planejamento.

Se o carrossel de vidro ou a moldura Safari exigirem mudanças estruturais que alterem a Home, interromper essa extração e revisar a abordagem de reutilização. Se a nova ordem interferir no tema de contato, corrigir o gatilho de integração, sem redesenhar o contato.

Depois da implementação validada, reconciliar a ordem e as decisões em `docs/planejamento-colaboradores-agenticos.md`, mantendo o registro histórico e apontando para este planejamento. Empresas, logos, métricas e frases reais entram em uma etapa posterior de substituição dos dados demonstrativos.
