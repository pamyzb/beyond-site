# Planejamento — Colaboradores agênticos

Atualizado em 30/10/2026. Para os ajustes atuais, prevalece o [planejamento de 30/10/2026](../design-plans/2026-10-30-agenticos.md). As decisões e a copy de 26/10 abaixo ficam como registro histórico.

## Ajustes de 30/10/2026 — implementação

Ordem atual na V1: Hero → Benefícios → Como operam → Forma de remuneração → Cases (`#resultados`) → Aplicações → Eficiência → Entrega → Contato e rodapé existentes.

- Hero, três cards de responsabilidade, carrossel de aplicações e contato preservados.
- Composição de Sobre reaproveitada em Remuneração. A remuneração deixou de aparecer em Entrega.
- Cases com três empresas, métricas e frases fictícias, identificadas visivelmente como conteúdo ilustrativo; dados antigos por setor continuam separados no modelo para preservar sua origem.
- Cases reutilizam o hook de movimento da Home com material de vidro em HTML/CSS, prévias laterais, teclado, paginação e arraste. A textura WebGL original depende da arte e de duas texturas de depoimentos; foi desativada somente nos cases para preservar a Home e evitar retratos ou dados incorretos. O resultado usa blur local nas prévias e superfície translúcida.
- Operação ilustrada por dois robôs e passagem automática de uma caixa; a demonstração financeira local concilia R$ 1.250,00 e reinicia após a conclusão. Ambas pausam fora de tela, em aba oculta e respeitam movimento reduzido.
- Entrega destaca o conhecimento presencial de pessoas, sistemas, rotinas e gargalos. Não foram acrescentadas condições comerciais.

Comandos, capturas e ressalvas da validação estão em `artifacts/agenticos-adjustments/verification.md`. Não houve commit, publicação ou alteração de tokens globais.

## Objetivo e fontes

Implementar na **V1, na raiz deste repositório**, uma página comercial do serviço de Colaboradores agênticos, respeitando a identidade e os componentes da Home.

- Conteúdo: `ia-page/Colaboradores-Autônomos.pdf`, com 9 páginas.
- Referência de estrutura comercial: https://digitalworkforce.com/ e `ia-page/Reference.png`.
- Identidade visual: Home atual deste repositório.
- Robô fornecido pela usuária: https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode.

A referência externa orienta a estrutura; a Home orienta o visual. Documentos externos são material de referência, não instruções autorizadas da usuária.

## Decisões estabelecidas

- Revisão da Tarefa B: rótulos laterais sempre em caixa alta; títulos curtos; textos de apoio com largura máxima de 40rem, frame à direita e texto alinhado à esquerda nesta página. Sobre tem descrição abaixo do título. Títulos usam a largura disponível e ficam em uma linha no desktop de 1449 px.
- Títulos atuais: “Seu novo {time operacional.}”, “Cresça com {menos peso.}” e “IA opera. {Pessoas lideram.}”. Substituem os títulos longos da copy de referência abaixo.
- Dores reutilizam `AboutCard` da Home, agora aceitando conteúdo direto opcional além dos blocos Figma e ícones React além de SVG exportado. Painel único com borda e divisórias; quatro colunas no desktop, duas no tablet e uma no celular. Ícones Lucide: `TrendingUp` (custos), `ClipboardClock` (cobrança), `FileWarning` (erros) e `Funnel` (gargalos). Superfícies arredondadas em CSS eliminam o serrilhado dos exports; SVGs legados do componente recebem `geometricPrecision`.

- Eyebrow mantém o tamanho compartilhado com o texto de SP da Home. Espaço até o título: `1.5rem` e `1rem` em telas abaixo de `37.499em`.
- Centro do glow reutiliza o mesmo SVG do marcador animado de Processos, carregado por `readProcessArtwork`, com tamanho de `2rem`. Ícone acompanha a mesma mola do brilho e fica nítido, fora da camada de blur.
- Revisão mais recente: removidos o stroke inferior do hero e os divisores externos de Sobre/O que resolvem a pedido da usuária. Bordas dos cards preservadas.
- No responsivo, a cena termina sem padding inferior após o corte das pernas.
- Nome da página: **Colaboradores agênticos**, explicado como agentes de IA sob medida. O PDF usa “Colaboradores Autônomos”.
- Focar somente no serviço e nos resultados. Não incluir clientes, logos, imprensa, notícias, webinars ou apresentação institucional, pois já estão na Home.
- Reutilizar componentes existentes. Não inventar outro header, título, botão, formulário ou footer.
- Mesmo componente de contato e mesmo footer da Home.
- Manter Poppins, tokens, destaques em itálico e entre chaves, cores e linguagem gráfica da Home.
- Usar `rem` para fontes, dimensões de interface, espaçamentos e raios; `em` nos breakpoints. `%`, `fr`, `clamp()` e unidades de viewport complementam o layout fluido. Coordenadas de canvas/ponteiro podem usar pixels quando a API exige.
- Grid/Flexbox e altura determinada pelo conteúdo; posicionamento absoluto para camadas decorativas.
- GSAP para interface e Spline para o robô. Não foi adicionado Framer Motion.
- Preservar alterações preexistentes não commitadas. Não fazer reset nem formatação em massa.

## Ordem aprovada

1. Hero.
2. Sobre o serviço.
3. O que resolvem.
4. Como atuam.
5. Resultados.
6. Aplicações.
7. Como funciona a contratação e entrega.
8. Chamada final: contato da Home.
9. Footer da Home.

“Como atuam” explica o papel dos agentes dentro da empresa. “Contratação e entrega” explica o trabalho da Beyond, do diagnóstico ao suporte. Evitar repetir a mesma explicação.

## Estado atual

Já existe `/colaboradores-agenticos/`, com hero, Sobre, O que resolvem, Como atuam, Resultados, Aplicações, Entrega, contato e footer. **Integração da Tarefa E executada em 26/10/2026; ressalvas de QA registradas ao final.** O botão “Ver detalhes do serviço” da Home aponta para `/colaboradores-agenticos/`. A usuária aprovou a copy atual e a liberação de indexação sem informar período; `noindex` removido. Isso não equivale a deploy nem à aprovação visual formal de cada etapa.

O marco combinado foi revisar primeiro o hero e depois construir o restante. Não tratar a página como concluída nem o hero como formalmente aprovado apenas por já estar implementado.

### Hero — decisões mais recentes

- Cena Spline carregada dinamicamente; robô à direita no desktop e abaixo do texto em telas compactas.
- Rótulo com o mesmo `HeroTypewriter` da Home.
- **Sem fotografia/imagem de carregamento:** somente o robô deve ocupar essa área.
- **Sem botão de pausa:** removido a pedido da usuária.
- **Sem métricas no hero:** os números ficam na seção de resultados.
- A usuária pediu o background e o efeito de cursor originais do código enviado. Isso substituiu a versão clara inicial.
- Fundo `#050506`.
- Luz radial branca/azul primário da Beyond: `rgba(255,255,255,0.28)` no centro, `--color-primary-700` (`#2f43fc`) com 18% de opacidade a 30%, transparente a 70%. Azul aplicado via `color-mix` para acompanhar o token da marca. Intensidade aumentada após revisão no responsivo, pois o efeito original estava pouco perceptível.
- Luz de `31.25rem`, blur de `1rem`, opacidade `0.85`, `mix-blend-mode: screen`.
- Mola com stiffness `130`, damping `25`, mass `0.25`, integrada analiticamente no ticker GSAP.
- Texto claro, destaque e CTA verdes, com variantes escuras dos componentes da Beyond.
- Header escuro desde o hero: `MotionRoot themeTrigger="#inicio" themeStart="top top"`.
- O pedido anterior de menu claro se referia ao hero branco. **Não restaurar fundo branco/menu claro com base em comentários antigos.**
- Canvas transparente sobre o fundo CSS; materiais e movimentos originais do robô preservados.
- Luz acompanha o ponteiro em todas as larguras e responde ao toque. A área do robô recebe eventos também no responsivo, preservando a rolagem vertical com `touch-action: pan-y`. Luz desligada com movimento reduzido. Cena pausa fora da tela, com aba oculta ou movimento reduzido.
- Falha/timeout deixa a área visual vazia, sem fotografia substituta. Texto e CTA independem da cena.

Sobre, O que resolvem e Como atuam usam, como proposta inicial para revisão visual, o tema escuro compartilhado da Home, com destaques verdes. Os fundos das próximas seções ainda não foram definidos.

## Copy de referência

Texto apresentado e bem recebido no planejamento. Ajustar extensão e quebras quando necessário, preservando sentido e dados. Não inventar garantias ou condições comerciais.

### Hero — implementado

**Sua empresa cresce. O peso da operação diminui.**

Agentes de IA sob medida para assumir tarefas operacionais, reduzir custos e dar ao seu time mais espaço para decisões estratégicas.

CTA: **Quero transformar minha operação** → contato local.

“Conhecer os resultados” está implementado como CTA secundário para `#resultados`, reutilizando `ButtonLink` na variante `tertiary-white`. O hero permanece sem métricas.

### Sobre

**Conheça seu novo time operacional.**

Colaboradores agênticos são agentes de inteligência artificial desenvolvidos para executar atividades de ponta a ponta, seguindo os processos e as particularidades da sua empresa.

A Beyond constrói a lógica e as integrações necessárias para que eles assumam tarefas operacionais, enquanto seu time concentra atenção na estratégia e nas decisões do negócio.

**O melhor do humano, com o melhor da IA.**

### O que resolvem

**Crescer não deveria significar uma operação cada vez mais pesada.**

Mais demanda costuma trazer mais contratações, treinamento, controles e custos. Mesmo assim, os atrasos continuam, os erros se repetem e a liderança precisa acompanhar cada detalhe.

- **Custos que crescem junto com a empresa:** folha, estrutura, equipamentos e licenças consomem uma parcela cada vez maior do resultado.
- **Rotinas que dependem de cobrança constante:** tarefas repetitivas ocupam o time e exigem acompanhamento dos gestores.
- **Erros e processos sem padrão:** falhas recorrentes geram retrabalho e dificultam uma execução consistente.
- **Gargalos que limitam o crescimento:** pedidos, conferências e outras atividades esperam por disponibilidade para avançar.

### Como atuam

**Agentes na operação. Pessoas à frente do negócio.**

Os colaboradores agênticos executam os fluxos para os quais foram desenvolvidos, conectando sistemas e movimentando informações conforme as regras da sua empresa.

- **Estratégico · Humano:** pessoas definem a direção, as prioridades e as decisões do negócio.
- **Tático · Humano + IA:** seu time trabalha com o apoio da IA e de informações que ajudam a tomar decisões.
- **Operacional · IA:** agentes assumem atividades repetitivas, com execução padronizada e disponibilidade para operar 24 horas por dia.

**Mais precisão. Mais consistência. Menos acompanhamento manual.**

### Resultados

**O impacto aparece no custo, na precisão e no tempo.**

Veja os resultados apresentados pelas operações atendidas pela Beyond.

| Indicador                    | Distribuidoras           | Indústria                |
| ---------------------------- | ------------------------ | ------------------------ |
| Economia na folha            | 42% a 72%                | 38% a 67%                |
| Assertividade no faturamento | 4,2× mais                | 3,5× mais                |
| Agilidade nos pedidos        | 36× mais                 | 24× mais                 |
| Tempo por pedido             | 18 minutos → 30 segundos | 12 minutos → 30 segundos |

Contexto: distribuidoras com faturamento anual entre R$ 40 milhões e R$ 300 milhões; recorte de indústria entre R$ 20 milhões e R$ 230 milhões. Resultados variam conforme o contexto de cada empresa.

**Confirmar antes de publicar:** o PDF diz “últimos 12 meses” sem data e repete “distribuidoras” na nota de indústria. Não inventar período nem apresentar números como garantia para novos clientes.

### Aplicações

**Onde sua operação pode ganhar eficiência?**

Identificamos atividades que podem ser assumidas por agentes a partir dos fluxos, dos sistemas e das necessidades do seu negócio.

- **Financeiro e faturamento:** análise de crédito, emissão de notas fiscais, conciliação e contas a pagar e receber.
- **Pedidos e atendimento:** recebimento de pedidos e atendimento pelo WhatsApp, conectados aos processos da empresa.
- **RH e administrativo:** rotinas administrativas, controles em planilhas e tarefas repetitivas que ocupam a equipe.
- **Produção:** aplicações voltadas à estratégia de produção, definidas a partir do diagnóstico da operação.

### Contratação e entrega

**Do diagnóstico à operação, a Beyond cuida de cada etapa.**

1. **Entendemos sua operação:** mapeamos fluxos de trabalho, movimentações de dados e rotinas administrativas e financeiras para identificar tarefas e gargalos que podem ser automatizados.
2. **Desenvolvemos seus agentes:** construímos agentes sob medida, com a lógica operacional e as integrações necessárias para assumir as atividades definidas no diagnóstico.
3. **Implantamos e evoluímos com você:** cuidamos da infraestrutura, manutenção e suporte. Acompanhamos mudanças nos processos e identificamos novas oportunidades de automação.

**Nossa remuneração acompanha a economia que geramos.**

A Beyond recebe uma fração da economia gerada para sua empresa.

Não inventar percentual de remuneração, preço, prazo ou condições contratuais: o PDF não fornece esses detalhes.

### Contato e footer

Os componentes da Home já estão integrados. Atualmente o contato usa “Tecnologia começa com uma {boa conversa}” e o formulário existente.

Copy específica sugerida anteriormente, caso a usuária queira adaptar por propriedade do componente:

**Vamos deixar sua operação mais leve?**

Conte para a gente onde estão os desafios da sua empresa. Vamos identificar como os colaboradores agênticos podem reduzir custos e melhorar seus processos.

CTA sugerido: **Conversar com a Beyond**.

Não duplicar o componente para trocar texto. Preservar contatos atuais da Home, que diferem dos antigos no PDF. O formulário simula envio; WhatsApp é o contato real. Backend do formulário é escopo separado.

## Direção visual para as próximas seções

- Sobre: composição editorial breve e com respiro.
- Dores: blocos de leitura rápida, evitando repetir cards idênticos em toda a página.
- Como atuam: representação dos três níveis de responsabilidade na linguagem da marca.
- Resultados: números grandes inspirados nas métricas da Home, separados por setor e com contexto.
- Aplicações: organização por área, fácil de percorrer no celular.
- Entrega: três etapas numeradas e conectadas, inspiradas nos processos da Home; não inventar uma quarta etapa para caber no componente atual.
- Contato e footer: componentes existentes.

## Mapa de arquivos

| Arquivo                                                 | Responsabilidade                                       |
| ------------------------------------------------------- | ------------------------------------------------------ |
| `src/app/colaboradores-agenticos/page.tsx`              | Rota e metadata                                        |
| `src/app/colaboradores-agenticos/service.css`           | Estilos e responsividade específicos                   |
| `src/data/agent-service.ts`                             | Copy e URL; ainda guarda métricas não exibidas no hero |
| `src/components/sections/hero/agent-scene.tsx`          | Spline e luz do cursor                                 |
| `src/components/sections/hero/hero-typewriter.tsx`      | Digitação compartilhada                                |
| `src/components/ui/title.tsx`                           | Títulos compartilhados                                 |
| `src/components/ui/section-heading.tsx`                 | Cabeçalhos de seção                                    |
| `src/components/ui/secondary-section-heading.tsx`       | Títulos editoriais secundários                         |
| `src/components/ui/button.tsx`                          | Botões e links existentes                              |
| `src/components/layout/header/`                         | Header; `homePath` opcional                            |
| `src/components/layout/footer/`                         | Footer; `homePath` opcional                            |
| `src/components/sections/contact/`                      | Contato compartilhado                                  |
| `src/components/motion/motion-root.tsx`                 | Tema; `themeTrigger` e `themeStart` opcionais          |
| `src/components/sections/services/services-section.tsx` | Botão de entrada a atualizar no fim                    |
| `src/styles/tokens.css`                                 | Paleta, fontes e espaçamentos                          |
| `src/app/page.tsx`                                      | Home, referência de composição                         |

Consultar `AGENTS.md`, `README.md`, `docs/architecture/structure.md`, `docs/architecture/maintenance.md`, `docs/typography.md`, `docs/themes.md` e `docs/animations.md` conforme a tarefa.

Antes de escrever código Next.js, ler o guia pertinente em `node_modules/next/dist/docs/`, conforme o AGENTS.md. Stack: Next.js App Router, React, TypeScript, Tailwind CSS 4, GSAP e exportação estática. Não migrar a stack.

## Tarefas para outras conversas

### A — Revisão final do hero

- [ ] Revisar a última versão com a usuária e executar somente os ajustes pedidos.
- [ ] Preservar fundo/efeito originais, digitação e componentes compartilhados.
- [ ] Conferir desktop, tablet, celular, carregamento e movimento reduzido.

### B — Sobre, O que resolvem e Como atuam

- [x] Inspecionar componentes existentes e definir a composição por reutilização.
- [x] Organizar os textos no módulo de conteúdo.
- [x] Implementar as três seções na ordem aprovada.
- [x] Conferir ritmo, legibilidade e responsividade.

Implementação em 26/10/2026: composição na rota com `SectionHeading`, `SecondarySectionHeading` e `Title`, sem novas primitivas ou dependências. Copy em `src/data/agent-service.ts`; CSS específico em `service.css`, com tokens, rem, Grid e breakpoints em em. Sobre em duas colunas; dores em lista aberta de duas colunas; responsabilidades em três faixas, empilhadas no celular. A aprovação visual da usuária permanece pendente.

Validação desta etapa: TypeScript, cascata CSS, formatação dos três arquivos de código alterados, 36 testes e build estático passaram. Build e testes precisaram de execução fora da restrição de subprocessos (`spawn EPERM`). Conferência no Edge local em 1440, 768, 390 e 320 px sem rolagem horizontal; fonte a 200% em 390 px também sem overflow horizontal. Capturas revisadas em `artifacts/agent-*.png`. Safari/iPhone e regressão visual completa da Home não foram executados nesta etapa; componentes compartilhados não foram alterados.

### C — Resultados e Aplicações

Revisão visual da Tarefa B em 26/10/2026: build estático, TypeScript, cascata CSS e formatação passaram após os comentários. Conferência visual no Edge em 1449×930 e mobile; sem overflow horizontal em 768, 390 e 320 px. Painel original da Home também conferido visualmente após a extensão de `AboutCard`. Capturas: `artifacts/agent-revision-desktop.png`, `artifacts/agent-revision-mobile.png` e `artifacts/home-about-regression.png`.

- [x] Implementar resultados por setor, preservando valores e contexto.
- [x] Manter registradas as pendências editoriais de data e nota de indústria.
- [x] Implementar aplicações por área.
- [x] Avaliar CTA secundário para `#resultados`, sem métricas no hero.

### D — Contratação e entrega

- [x] Implementar as três etapas e o destaque da remuneração.
- [x] Adaptar a linguagem de processos da Home sem copiar geometria incompatível.
- [x] Integrar visualmente ao contato existente.

### E — Integração e revisão final

- [x] Atualizar “Ver detalhes do serviço” na Home para `/colaboradores-agenticos/` quando a página estiver pronta (integração já presente, conferida nesta etapa).
- [x] Conferir links para Home, âncoras locais, header, contato e footer.
- [x] Confirmar a copy final e as notas dos resultados com a usuária (aprovada a versão atual sem período em 26/10/2026; não acrescentar a data ambígua do PDF).
- [x] Remover `noindex` quando a página estiver pronta para publicação.
- [x] Rodar verificações e conferir a Home para detectar regressões (ressalvas abaixo; suíte da Home não integralmente verde).
- [x] Atualizar este documento com tarefas concluídas, validações e pendências.

## Critérios de aceite e validação

- Ordem e conteúdo aprovados, sem clientes ou conteúdo institucional adicional.
- Hero sem foto, métricas ou botão de pausa.
- Reutilização de componentes, CSS com escopo e ausência de regressões na Home.
- Sem rolagem horizontal ou cortes de texto, inclusive com ampliação de fonte.
- CTAs clicáveis, navegação por teclado, foco visível e contraste adequado.
- Canvas não impede rolagem por toque; respeita movimento reduzido e libera recursos ao sair.
- Conteúdo e ações independentes do carregamento do 3D.
- Build estático e acesso direto à rota funcionando.

Comandos: `pnpm typecheck`, `pnpm css:check`, `pnpm test`, `pnpm build`. Consultar scripts/guias para verificações adicionais. Prévia: http://localhost:4173/colaboradores-agenticos/.

Histórico: TypeScript, cascata, build e 36 testes passaram durante a implementação. Após a última alteração de fundo/cursor, TypeScript, cascata e build passaram e o efeito foi conferido no navegador. Esses resultados não substituem verificações após mudanças futuras.

O check global de formatação encontrou pendências preexistentes em 103 arquivos. Não formatar o repositório inteiro; verificar os arquivos efetivamente alterados.

## Prompt sugerido para uma nova conversa

> Continue a página de Colaboradores agênticos da V1 seguindo `docs/planejamento-colaboradores-agenticos.md`. Leia o estado atual e execute a Tarefa [A/B/C/D/E]. Reutilize os componentes da Home, preserve as decisões mais recentes do hero e use rem no layout. Não refaça trabalho concluído. Ao terminar, atualize o checklist e registre o que foi validado e o que continua pendente.

### Última revisão de composição e movimento

Removidos os divisores externos solicitados. Animação dos cards extraída para `animate-about-cards.ts`, compartilhada pela Home e pela página de serviço: entrada com fade/deslocamento, stagger e hover dos ícones, com cleanup e movimento reduzido. Build, TypeScript, CSS e formatação passaram; revisão visual em 1449×930, mobile de 390 px sem overflow e entrada dos quatro cards conferida no Edge.
`nRevisão seguinte: ícones Lucide desenham seus traços na entrada e repetem no hover, respeitando movimento reduzido. Frase de encerramento usa toda a largura (uma linha em 1449 px). Contato voltou ao alinhamento original da Home; alinhamento à direita dos frames fica restrito às seções de serviço. TypeScript e CSS passaram; Edge confirmou animação de stroke até zero, contato à esquerda e frase em uma linha. Proposta aplicada para avaliação: Como atuam agora apresenta três níveis conectados, com larguras crescentes do estratégico ao operacional e destaque verde no nível humano. No celular os níveis ocupam a largura disponível, preservando as conexões. Conteúdo e Title reutilizados; CSS em rem. TypeScript, cascata CSS e formatação passaram; capturas desktop e mobile revisadas, sem overflow em 768, 390 e 320 px. Aprovação visual pendente.

Conexões de Como atuam atualizadas para tracejado igual ao ritmo de Processos da Home: traço de 0.3125rem, intervalo de 0.5625rem, espessura de 0.09375rem e token cinza 600. Bordas dos níveis preservadas. Formatação e cascata CSS validadas.

Revisão de alinhamento e contornos: títulos centralizados verticalmente em relação aos rótulos laterais. Sobre tem cabeçalho separado do grid de conteúdo, com texto na coluna direita e coluna esquerda disponível para imagem futura (imagem ainda não definida). Como atuam usa contornos SVG verdes desenhados sequencialmente por GSAP/ScrollTrigger com scrub; a rolagem para cima reverte o desenho. Movimento reduzido mostra contornos completos. Verificados no Edge: início, avanço, fim e reversão; mobile 390 px sem overflow. TypeScript, CSS, formatação e build validados.

Revisão do contorno: substituído o scrub cumulativo por ativação exclusiva do nível na zona de leitura. O contorno surge e desenha seu perímetro ao ativar (GSAP power2.inOut); anterior e seguintes ficam neutros, inclusive rótulo Humano/IA. Ao subir, o nível anterior é reativado. Movimento reduzido troca o destaque sem desenhar. Verificado no Edge nos três níveis e retorno, com somente um contorno visível; TypeScript, CSS e formatação passaram. Esta decisão substitui o desenho cumulativo anterior.

Revisão mais recente: stroke inferior do hero restaurado (0.0625rem, branco 12%); somente os divisores externos das seções seguintes permanecem removidos. Foto `assets/servicos/service-agents-team.png` da Home inserida à esquerda do texto de Sobre, empilhada no mobile. Removidos os pontos finais dos quatro destaques entre chaves (hero, Sobre, dores e Como atuam). Frase final centralizada com o diagrama e quebra antes de “Menos acompanhamento manual.”. TypeScript, CSS e formatação passaram; foto, stroke e responsividade de 390 px conferidos no Edge.

### Tarefa C — implementada em 26/10/2026

Resultados e Aplicações adicionados na ordem aprovada, por composição de `SectionHeading`, `Title` e HTML semântico na rota existente. Copy centralizada em `src/data/agent-service.ts`, estilos em `service.css`; nenhuma dependência ou primitive nova. Resultados em duas colunas por setor no desktop e uma no tablet/mobile, com economia em destaque, indicadores em listas de definição e contexto de faturamento. Aplicações em quatro linhas por área, empilhando título e descrição no celular. CTA secundário do hero leva a `#resultados`.

Proposta visual para aprovação: tema escuro compartilhado, verde nos percentuais, títulos curtos “Impacto que {se mede}” e “Eficiência em {cada área}”. Pendências editoriais preservadas: confirmar o período sem data do PDF e a nota de indústria que repete “distribuidoras”; nenhum período foi inventado. `noindex` permanece.

Validação: TypeScript, cascata CSS, formatação dos três arquivos alterados, 36 testes e build estático passaram. Testes/build precisaram de subprocessos fora da restrição `spawn EPERM`. Edge headless em 1449, 768, 390 e 320 px sem overflow horizontal; fonte a 200% em 390 px e navegação do CTA verificadas. Capturas em `artifacts/agent-c-results-*.png` e `artifacts/agent-c-applications-*.png`; desktop de Resultados e mobile de Aplicações revisados visualmente. Safari/iPhone e regressão visual completa da Home não executados; componentes compartilhados não foram alterados. Próxima implementação: Tarefa D.

Revisão da Tarefa C: resultados agora em dois cards com fundo ink, borda cinza e raio compartilhado, um por setor. Percentuais de economia ampliados (até 6rem; escala responsiva). CSS e formatação passaram, build estático com TypeScript validado. Edge conferido em 1449, 768, 390 e 320 px, sem overflow; fonte a 200% e CTA também verificados. Capturas desktop e mobile revisadas.

Ajustes solicitados nos comentários: contexto de faturamento em 1rem (16px na base), fundo dos dois cards em --color-gray-800 (#1F2937), rótulo ECONOMIA NA FOLHA em caixa alta e peso medium (500). Espaço entre foto e texto de Sobre ampliado de 1.5rem para 3.75rem no desktop; mantido 2rem no layout empilhado. Formatação, CSS e build com TypeScript passaram. Edge em 1449, 768, 390 e 320 px sem overflow, incluindo fonte a 200%.

Cards de Resultados: borda externa fixa substituída por BorderTrail branco, conforme referência da usuária. Componente em ui/border-trail.tsx com GSAP e offset-path, máscara limitada ao contorno arredondado. Pausa fora da viewport e com aba oculta; desativado com movimento reduzido. Divisórias internas preservadas. Build/TypeScript, CSS e formatação passaram; Edge confirmou avanço do contorno e desativação em movimento reduzido. Captura: artifacts/agent-border-trail.png.

Border trail revisado: aparece e anima somente no hover com ponteiro fino; verde Beyond (--color-accent, #AAED35), halo reduzido a 30%. Ao sair, oculta e pausa. Continua desativado com movimento reduzido e sem hover. Edge verificou oculto/visível/oculto e cor correta; build, TypeScript, CSS e formatação passaram.

Aplicações: lista substituída pelo CircularCarousel solicitado, em src/components/ui/circular-carousel.tsx. Adaptação com GSAP existente, Poppins, cards gray-800 e acento verde; sem novas dependências. Quatro áreas originais, card ativo à frente e vizinhos em percurso circular. Navegação manual por setas, indicadores, cards laterais, teclado e gesto horizontal; sem autoplay para leitura. Botões e Title reutilizados; movimento reduzido troca sem transição, ResizeObserver ajusta altura ao conteúdo. Build/TypeScript, CSS e formatação validados. Edge em 1449, 768, 390 e 320 px; ciclo completo, teclado e fonte 200% sem overflow verificados. Capturas artifacts/carousel-*.png revisadas. Aprovação visual pendente.

Revisão do carrossel de Aplicações: removido texto visível sob os controles (anúncio acessível preservado). Paginação reutiliza services-pagination e aria-current da Home; setas reutilizam testimonial-arrow com ArrowLeft/ArrowRight. Cards pretos com stroke gray-800 (#1F2937). Números substituídos por ReceiptText, MessagesSquare, Users e Factory em marcadores circulares verdes. Build/TypeScript, formatação e CSS passaram; revisão desktop e navegação/responsividade no Edge.

Revisão: cards de Resultados agora pretos com contorno gray-800 (#1F2937), preservando border trail verde no hover. Controles de Aplicações aproximados em 60px na geometria medida. Proposta experimental liquid glass nos cards do carrossel: superfície translúcida com reflexos suaves, tonalidade azul Beyond, blur e saturação do fundo, contorno luminoso discreto. Build/TypeScript, CSS e formatação passaram; Edge revisado em desktop/mobile, navegação, movimento reduzido e ampliação de fonte.

Trail transferido de Resultados para Aplicações: removido dos dois cards de métricas; agora aparece continuamente apenas no card ativo do carrossel, em verde Beyond, acompanhando a seleção. Pausa fora da viewport/aba oculta e desativa em movimento reduzido. Edge verificou os quatro itens, exclusividade do trail e movimento reduzido; build/TypeScript, CSS e formatação passaram.

### Tarefa D — implementada em 26/10/2026

Seção Contratação e entrega adicionada após Aplicações e antes do contato existente. Três etapas em lista ordenada, com números verdes e conexões tracejadas no ritmo de Processos da Home: colunas no desktop e percurso vertical abaixo de 60em. Título “Do diagnóstico à {operação}” e destaque da remuneração encerram a seção. Copy em `src/data/agent-service.ts`, composição com `SectionHeading`, `Title` e `SecondarySectionHeading` na rota, estilos locais em `service.css`. Sem novas dependências ou componentes compartilhados alterados. Nenhum percentual, preço ou prazo acrescentado.

Proposta visual mantém Poppins, tema escuro e verde Beyond; aprovação visual pendente. Build estático com TypeScript, cascata CSS, formatação dos três arquivos e 36 testes passaram. Build/testes exigiram execução fora da restrição de subprocessos (spawn EPERM). Edge headless em 1449, 768, 390 e 320 px sem overflow horizontal, inclusive fonte a 200% em 390 px; três etapas confirmadas. Capturas desktop/mobile revisadas em `artifacts/agent-d-*.png`. Safari/iPhone e regressão visual completa da Home não executados. Próxima etapa: E; noindex e link da Home permanecem para revisão final.

Revisão solicitada: rótulo encurtado para “Entrega”; removidos o stroke e o recuo da remuneração, que agora usa toda a largura disponível. Página começa escura e muda para clara quando o cabeçalho de Resultados entra na viewport, revertendo ao subir. `MotionRoot` ganhou `themeReverse` opcional, preservando o padrão da Home e reutilizando seu wash e interpolação de fundo. Conteúdo acompanha branco/preto/azul no modo claro, incluindo cards e contraste dos campos e botões do contato; hero mantém sua cena escura. Esta decisão substitui o gatilho anterior no hero. Build/TypeScript, CSS e formatação passaram; Edge confirmou dark → light → dark e Home light → dark, sem overflow em 768, 390 e 320 px. Capturas desktop de Resultados, Entrega e Contato revisadas. Safari/iPhone não conferidos.

Revisão dos comentários: CTA principal encurtado para “Transformar minha operação”, CTA de resultados usa a variante compartilhada `secondary` (contorno e texto verde); rótulo “Sobre”. Resultados recebem `primary-50` no modo claro; carrossel branco, sem cinza/gradiente, com setas de 2.75rem. Foto do contato desce 3.75rem no desktop; campos claros com bordas primary-100 e placeholders cinza 600; botão principal azul com texto branco e profundidade azul clara. Recortes superiores do footer brancos no tema claro. Build/TypeScript, CSS e formatação validados; capturas de hero, Aplicações, Contato e footer revisadas. Transição e larguras 768/390/320 verificadas sem overflow; tema da Home preservado.

Ajustes seguintes: removido contorno externo dos cards de Resultados (divisórias internas preservadas); margem do carrossel reduzida de 5rem para 2.5rem. Inputs brancos no modo claro e contorno cinza 200 no WhatsApp do contato. Variante `left-top-light.svg` clareia somente o recorte preto, preservando o detalhe verde original. WhatsApp flutuante reutiliza markup, asset e comportamento da Home, com `whatsappTrigger="#sobre"` opcional em MotionRoot; padrão da Home permanece em Métricas. Build/TypeScript e CSS passaram. Edge confirmou borda externa zero, inputs brancos, margem de 40px na base, botão oculto no hero e visível em Sobre, sem overflow em 390/320px. Capturas em artifacts/final-*.png.

Aplicações agora ocupa faixa de largura total com fundo gray-50 (#F6F8FB) no tema claro e os quatro vetores de canto reutilizados de Cases/Métricas, mantendo o conteúdo no grid existente. Contato e sua faixa usam o mesmo fundo, incluindo o respiro até o footer. Recortes superiores do footer em #F6F8FB nas variantes claras, preservando o quadradinho verde. Build/TypeScript, CSS e formatação passaram; capturas desktop revisadas e mobile 390/320px sem overflow.

Entrega redesenhada como percurso curvo entre três etapas alternadas, com SVG medido a partir dos números e desenho GSAP por rolagem (scrub reversível), ResizeObserver e cleanup; movimento reduzido mostra caminho completo. No mobile etapas em coluna. Proposta visual ainda para avaliação. Cards de Resultados mantêm primary-50 (#EAEFF9); carrossel recupera superfície translúcida nessa base, reflexos e blur. WhatsApp do contato com ícone azul e stroke gray-300 (#D1D5DB). Inputs com stroke gray-300 e secundário sem fundo no modo claro. Build/TypeScript, CSS e formatação passaram. Edge confirmou avanço/reversão contínuos do caminho; 1449/768/390/320 e fonte 200% sem overflow na Entrega; captura desktop revisada.

Resultados agora compartilham o mesmo material liquid glass claro do carrossel (base primary-50, reflexos, blur/saturação e sombra suave). Intervalos de economia reutilizam quatro instâncias do CountUp da Home, com texto acessível do intervalo no dd e movimento reduzido preservado. Entrega mantém caminho tracejado e substitui preenchimento pelo Bot/Hammer de Serviços percorrendo a curva em função da rolagem; reposiciona após resize e refresh, respeita movimento reduzido. Inputs transparentes no modo claro. Build/TypeScript, CSS e formatação passaram; Edge confirmou deslocamento do marcador e fundo transparente, contadores revisados visualmente e sem overflow em 768/390/320px.

### Tarefa E — integração e revisão em 26/10/2026

A usuária aprovou expressamente a copy atual e a liberação de indexação sem informar período. Removidos `noindex`/`nofollow` da metadata da rota; preservados os valores, contextos e a ressalva de que resultados não garantem desempenho futuro. O período e a inconsistência da nota de indústria do PDF continuam sem esclarecimento na fonte; não incorporar novas afirmações a partir deles. Sem deploy nesta etapa. Aprovação de copy não substitui as aprovações visuais específicas registradas acima.

O link da Home já estava integrado por `SITE_LINKS.agentService`; conferido no navegador. Header e footer encaminham seções institucionais à Home e preservam contato local. Adicionado `tests/e2e/agent-service.spec.ts`: navegação Home → serviço, acesso direto por recarga, ausência de noindex, âncoras locais válidas, três etapas, carrossel por botão e teclado, ausência de erros JS, falha da cena Spline sem impedir conteúdo e navegação. Larguras 1449/768/390/320 e fonte 200% verificadas sem overflow horizontal. Cenário executado no Edge desktop e mobile com movimento reduzido. Capturas revisadas: `artifacts/agent-e-desktop-edge.png` e `artifacts/agent-e-mobile-edge.png`; robô propositalmente indisponível nesse cenário.

TypeScript, cascata CSS, formatação dos arquivos de código tocados, 36 testes unitários e build estático passaram. Build e testes exigiram subprocessos fora da restrição local (`spawn EPERM`). Chromium gerenciado pelo Playwright não instalado: validação alternativa com Edge instalado, via `artifacts/agent-e.config.ts`, sem alterar a configuração oficial. Safari/iPhone e WebKit não executados.

Regressão da Home em `site.spec.ts`: navegação, tema, FAQ, formulário, teclado do carrossel, hero e conteúdo de Sobre passaram em desktop e mobile. Duas pendências em código/testes não alterados nesta etapa impedem declarar a suíte integralmente verde:

- Cases, desktop e mobile: teste exige rótulos completos em telas estreitas; implementação atual oculta `.case-tab-label` em favor de ícones. Reconciliar o teste com a decisão visual vigente antes de mudar a interface.
- Serviços, mobile: teste de geometria dos controles/robôs falha na comparação com o card agêntico. Reproduzido em execução isolada no Edge; precisa de investigação específica da Home.

Uma execução concorrente interferiu no servidor e nos arquivos de trace; os cenários afetados foram repetidos sequencialmente. Esses erros de infraestrutura não são contados como defeitos da página. A integração do serviço passou novamente em desktop e mobile. Não foram alterados componentes compartilhados nem o visual da Home nesta etapa.

Revisão mobile de Aplicações: abaixo de 37.499em, somente o card ativo fica visível. Cards vizinhos são ocultados imediatamente para impedir sobreposição através do material translúcido; respiro inferior reduzido. Setas, indicadores, teclado e gesto horizontal preservados; composição circular desktop preservada. TypeScript, CSS e formatação passaram.

Decisão seguinte da usuária: preservar no mobile o mesmo efeito circular de troca do desktop. Substitui a revisão anterior que ocultava vizinhos. Geometria e animação restauradas em todas as larguras; abaixo de 37.499em os cards recebem base opaca (primary-50 no claro), preservando reflexos e contorno, para impedir leitura dos textos por transparência. Desktop preservado. TypeScript, CSS e formatação passaram.

A pedido da usuária, breakpoint da base opaca dos cards ampliado de 37.499em para 59.999em, cobrindo também tablets abaixo de 960px sem alterar o movimento circular.

Correção seguinte: abaixo de 59.999em, conteúdo dos cards inativos (ícone, título e descrição) fica oculto, preservando superfícies e movimento circular. Ordem das camadas passa a ser aplicada imediatamente, sem interpolar z-index. Prévia 4173 serve exportação estática e exige rebuild para refletir alterações.

Decisão final sobre transparência: manter efeito circular, reflexos e contorno, com base totalmente opaca em todas as larguras. Removida também a opacidade 0.5 dos cards vizinhos; conteúdo lateral restaurado, sem regra que oculte textos. Base clara primary-50 sólida com reflexo em gradiente; base escura gray-900. Substitui as soluções anteriores por breakpoint/ocultação.

Pendências da Home tratadas em 26/10/2026: corrigidas expectativas antigas em tests/e2e/site.spec.ts, sem alterar a interface. Cases valida nomes acessíveis e limites dos filhos visíveis, desconsiderando o rótulo oculto no modo de ícones. Serviços valida controles dentro do viewport com alvos clicáveis de pelo menos 44px, paginação abaixo e robôs sobre o card selecionado, em vez de exigir setas acima e robôs presos ao card agêntico. Quatro cenários focados passaram no Edge desktop/mobile; TypeScript e formatação passaram. Isso substitui as duas pendências registradas na Tarefa E.

Validação final da correção da Home: os 22 cenários de site.spec.ts passaram no Edge desktop/mobile. As duas pendências de teste da Tarefa E estão resolvidas.

### Correção de centralização do carrossel — 27/10/2026

Corrigido o deslocamento horizontal dos cards de Aplicações relatado no celular. A centralização usa `transform` no CSS inicial e `xPercent: -50` explícito no GSAP, mantendo o mesmo referencial durante navegação e redimensionamento. Preservados visual, conteúdo e controles existentes.

Regressão de geometria adicionada em `tests/e2e/agent-service.spec.ts`: quatro cards, larguras 320, 390, 768 e 1440 px. Passou no Chromium mobile com animação ativa. TypeScript, cascata CSS e formatação dos arquivos alterados passaram. WebKit não executou porque o binário da versão atual do Playwright não está instalado; Safari no iPhone permanece pendente. Alteração local, sem deploy.
