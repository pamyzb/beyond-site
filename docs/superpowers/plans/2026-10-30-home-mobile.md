# Home V1 — planejamento dos ajustes mobile

> Execução: usar superpowers:executing-plans, uma tarefa por vez, com revisão visual por seção. As caixas registram implementação e validação; este documento não autoriza mudanças fora do escopo.

**Objetivo:** aplicar o feedback mobile da home preservando a identidade visual e o desktop atual.
**Arquitetura:** alterar os componentes existentes e seus estilos responsivos locais. Manter a composição em src/app/page.tsx e reutilizar GSAP e os controles existentes; não criar uma segunda home.
**Stack:** Next.js 16, React 19, TypeScript, CSS, GSAP e Playwright.
**Referência:** transcrição enviada pela cliente e correções da usuária nesta conversa, consolidadas abaixo.
**Data:** 30/10/2026.

## Restrições e decisões de escopo

- V1 é a implementação na raiz do repositório; trabalhar diretamente nela durante a execução.
- Preservar as alterações locais existentes. Há mudanças em andamento em vários componentes deste plano; revisar o diff antes de cada tarefa.
- Não refazer a inversão dos números: já foi corrigida no desktop e removida deste escopo.
- Não alterar a seção “O que move negócios, a gente compartilha”. O card compartilhado BlogCard pode ser utilizado na mídia: qualquer alteração nele deve ser isolada por variante para não afetar o blog.
- “Imagens animadas” corresponde à seção de 45 minutos; transição escura e textos correspondem ao App Beyond.
- Não alterar conteúdo, navegação ou comportamento de outras páginas por efeito de componentes compartilhados.
- Antes de escrever código Next.js, ler os guias pertinentes em node_modules/next/dist/docs/.
- Respeitar os breakpoints existentes, identificando o intervalo específico de cada componente; não tratar todo tablet como celular automaticamente.
- Toda animação deve ter alternativa com prefers-reduced-motion; informações e ações continuam disponíveis sem movimento.
- Este planejamento não inclui implementação, commits ou publicação.

## Estratégia e ordem de execução

1. Registrar referência atual e fechar as decisões visuais necessárias por seção.
2. Menu e hero.
3. Empresas e mídia.
4. Serviços e 45 minutos.
5. Cases, em uma entrega própria pelo risco da interação com scroll.
6. App Beyond e depoimentos.
7. Processo e cards de entender/construir/manter.
8. FAQ, chamada final e footer.
9. Validar a home completa e a preservação do desktop.

Cada seção pode ser revisada separadamente. Primeiro corrigir sua interação e geometria; depois ajustar movimento. Não acumular alterações visuais de toda a home antes da primeira revisão.

## Tarefa 0 — Referências e decisões

**Consultar:** src/app/page.tsx; docs/responsiveness-review.md; playwright.config.ts; tests/e2e/site.spec.ts; docs/qa/.

- [x] Capturar a home atual em 390 × 844 e desktop 1440 × 1000; registrar também os estados abertos de menu, empresas e carrosséis.
- [x] Reproduzir os defeitos em Chromium e WebKit antes de atribuir causas. Travada e salto são sintomas relatados, ainda não diagnósticos.
- [ ] Conferir na referência visual disponível as duas setas do hero, os cards com inclinação, os textos do App Beyond e as informações dispensáveis dos cases. Se a gravação ainda não estiver disponível, apresentar esses pontos na revisão da seção antes de remover elementos ambíguos.
- [ ] Recuperar a referência de cor aprovada para a mídia; não inventar uma nova paleta.
- [x] Apresentar para revisão as propostas abaixo antes de implementar as escolhas ainda abertas.

**Propostas para decisão:** empresas em duas linhas fixas, com 5–6 marcas e inclinação discreta; cards finais com dois na primeira linha e um abaixo quando houver espaço; ocultar os dois botões finais e telefone/e-mail no mobile, preservando uma rota clara até contato. São recomendações de planejamento, não decisões já aprovadas.

**Aceite:** referência salva, defeitos reproduzidos ou identificados como não reproduzidos, e alternativas visuais distinguíveis dos pedidos confirmados.

## Tarefa 1 — Menu mobile

**Arquivos:** src/components/layout/header/{site-header.tsx,header-navigation.tsx,header.css,header-theme.css,responsive.css}.

- [x] Simplificar o estado fechado usando o site antigo como referência visual quando disponível.
- [x] No menu aberto, usar símbolo Beyond cinza apontando para os itens, com o efeito visual de hover adaptado ao toque.
- [x] Garantir que o efeito não exija um segundo toque para navegar. Preservar links existentes e fechamento por navegação, Escape e clique externo.
- [x] Revisar foco, aria-expanded, acesso por teclado e altura em telas pequenas/orientação horizontal.

**Aceite:** menu fechado discreto; menu aberto com identidade e links funcionais no primeiro toque; nenhum item oculto acessível por Tab. Conferir outros usos do header.

## Tarefa 2 — Hero

**Arquivos:** src/components/sections/hero/{hero-section.tsx,hero.css,responsive.css,hero-ink.tsx,use-hero-ink.ts}; consultar material.css e hero-glass.tsx somente se controlarem a decoração identificada.

- [x] Identificar e ocultar no mobile a seta grande inferior e o símbolo Beyond decorativo mencionado.
- [x] Preservar as linhas atrás de “Tecnologia que move negócios”.
- [x] Aumentar o título, permitindo três linhas sem corte em larguras pequenas.
- [x] Fazer o texto de apoio fluir sem quebras manuais e manter sua seta junto ao texto.
- [x] Desativar no mobile processamento de decoração removida, se existir animação dedicada.

**Aceite:** título legível, seta de apoio alinhada e ausência de sobreposição ou scroll lateral em 360, 390 e 430px; desktop preservado.

## Tarefa 3 — Empresas e interação dos cards

**Arquivos:** src/components/sections/metrics/{client-carousel.tsx,client-carousel.css,clients-layout.css,responsive.css,metrics-section.tsx,metrics-details.css}.

- [x] Separar abertura por hover/foco da alternância por toque. No código atual, open retorna quando o item já está ativo; corrigir o caminho de toque para fechar o mesmo item sem o hover reabri-lo.
- [x] Preservar clique externo, Escape, posicionamento do popover e troca entre empresas.
- [x] Corrigir o salto dos logos após medir o que o provoca: repetição do carrossel, carregamento de imagens ou alteração de geometria.
- [x] Aplicar a composição aprovada de mais empresas visíveis, sem esconder marcas sem acesso alternativo.
- [x] Aplicar inclinação suave por scroll aos cards identificados, com transform e sem atualização React a cada frame. Sem animação na preferência de movimento reduzido.

**Aceite:** primeiro toque abre, segundo fecha; tocar outra empresa troca o conteúdo; nenhuma informação sai da viewport; logos sem salto no ciclo completo.

## Tarefa 4 — Destaque na mídia

**Arquivos:** src/components/sections/metrics/{metrics-section.tsx,metrics-ribbon.css,metrics-finish.css,responsive.css}; consultar src/components/sections/blog/blog-card.tsx se necessário.

- [x] Substituir o espaço da Softdex por “Ver matérias”, preservando o destino correto da ação.
- [ ] Aplicar a referência de cor aprovada aos elementos apontados.
- [x] Isolar as mudanças do blog e verificar o comportamento desktop antes de decidir se a remoção da Softdex é global.

**Aceite:** ação visível e funcional no espaço combinado; cores consistentes; blog sem alterações incidentais.

## Tarefa 5 — Problemas que a gente resolve

**Arquivos:** src/components/sections/services/{services-section.tsx,service-card.tsx,use-services-navigation.ts,responsive.css,scroll-journey.css}.

- [x] Remover os botões visuais de navegação no mobile, preservando navegação acessível por teclado.
- [x] Reduzir a largura do card para expor parte do próximo e manter scroll horizontal nativo com alinhamento previsível.
- [x] Calcular paginação a partir das posições realmente alcançáveis no layout mobile; atualizar o estado também no swipe e no resize.
- [x] Garantir acesso ao último card e impedir conflito entre arraste horizontal e scroll vertical.

**Aceite:** próximo card parcialmente visível; indicador corresponde à posição real; primeiro e último cards acessíveis em toque e teclado.

## Tarefa 6 — 45 minutos

**Arquivos:** src/components/sections/conversation/{conversation-section.tsx,conversation-artwork.tsx,responsive.css,artwork-visibility.css}.

- [x] Aumentar as imagens mantendo os recortes e as margens de conteúdo existentes.
- [x] Aumentar moderadamente a amplitude de movimento sem cobrir título, texto ou CTA.
- [x] Verificar entrada e saída da seção, toque e movimento reduzido.

**Aceite:** fotos mais presentes, texto livre de sobreposição e ausência de overflow horizontal ao longo de toda a animação.

## Tarefa 7 — Cases: composição e imersão no scroll

**Arquivos:** src/components/sections/cases/{cases-section.tsx,case-panel.tsx,cases.css,responsive.css,viewport-layout.css}; consultar src/data/cases.ts sem alterar a copy aprovada.

- [x] Simplificar a barra de navegador para três controles decorativos à esquerda e uma única identificação do case ativo. Remover “Antes e depois” dessa composição mobile.
- [x] Levar “Explorar case” para depois das informações principais e remover somente as informações identificadas na revisão visual.
- [x] Criar uma variante mobile da sequência: entrada com margens → expansão até a largura disponível → percurso por Starlog e demais cases na ordem existente → redução na saída.
- [x] Definir progressos de entrada, permanência e saída medindo a altura disponível; não reutilizar automaticamente os valores de pin do desktop.
- [x] Evitar capturar eventos de toque ou wheel. Se for necessário pin com GSAP, validar rolagem reversa, mudança de orientação e barra dinâmica do Safari antes de manter a solução.
- [x] Recalcular dimensões em resize e limpar timelines/ScrollTriggers ao sair do breakpoint.
- [x] Em movimento reduzido, manter os cases navegáveis com os controles existentes e sem expansão/pin obrigatório.

**Aceite:** todos os cases acessíveis, CTA utilizável, entrada e saída sem saltos ou bloqueio da página; rolagem reversa coerente; comportamento aprovado em WebKit mobile. Validar desktop após esta tarefa.

## Tarefa 8 — App Beyond

**Arquivos:** src/components/sections/app-showcase/{app-section.tsx,app.css,responsive.css,app-feature-card.tsx,app-feature-title.tsx}; src/components/motion/motion-root.tsx; src/app/page.tsx; src/styles/theme-wash.css.

- [x] Medir o momento atual da transição: a home passa themeTrigger="#conversa h2" e themeStart="top 35%" para MotionRoot, portanto o disparo atual depende da seção anterior.
- [x] Ajustar o disparo mobile para o fundo escuro já estar estabelecido no momento visual aprovado de entrada do App Beyond; preservar a referência desktop.
- [x] Aumentar os textos identificados e remover suas quebras manuais no mobile.
- [x] Verificar a transição ao subir e descer, além do carregamento direto com a página já rolada.

**Aceite:** mudança de tema perceptível no momento esperado, sem atraso, flash ou texto com contraste insuficiente; parágrafos fluidos e QR/ações preservados.

## Tarefa 9 — Depoimentos

**Arquivos:** src/components/sections/testimonials/{testimonials-section.tsx,testimonial-card.tsx,testimonial-carousel.tsx,use-testimonial-carousel.ts,testimonials.css,responsive.css,artwork-layout.css}; consultar src/lib/animation/testimonial-glass.ts.

- [x] Reduzir largura e altura dos cards para recuperar a presença das laterais com efeito de vidro.
- [x] Ajustar tamanho e posição do logo Beyond ao fundo para evitar corte indesejado.
- [x] Manter frase, nome, cargo e empresa completos; reduzir tipografia somente dentro de uma leitura confortável.
- [x] Preservar passagem automática e acesso manual, incluindo preferência de movimento reduzido.

**Aceite:** identificação completa, decoração correta e efeito lateral perceptível; conteúdo sem corte nos depoimentos de maior texto.

## Tarefa 10 — Software de ponta a ponta

**Arquivos:** src/components/sections/process/{process-section.tsx,process-card.tsx,process.css,responsive.css,artwork-layout.css}; src/lib/server/process-artwork.ts somente se a geometria exportada exigir.

- [x] Reproduzir a travada e medir a trajetória do marcador antes de alterar duração ou suavização.
- [x] Conferir as coordenadas de cada etapa após o layout mobile e alinhar o marcador ao centro do número 3.
- [x] Evitar recálculo de layout a cada frame; recalcular trajetória no resize e após mudanças de dimensão relevantes.

**Aceite:** percurso contínuo e chegada correta aos números, principalmente ao 3, inclusive ao rolar de volta e após mudar a orientação.

## Tarefa 11 — Entender, construir e manter funcionando

**Arquivos:** src/components/sections/about/{about-section.tsx,about-card.tsx,about.css,responsive.css,animate-about-cards.ts}.

- [x] Conferir a ordem e a copy dos cards existentes antes da alteração.
- [ ] Experimentar a composição 2 + 1 aprovada, mantendo a ordem lógica de leitura e reduzindo o espaço vertical.
- [x] Em larguras onde duas colunas prejudiquem a leitura, usar uma coluna compacta; evitar fonte excessivamente pequena para forçar o arranjo.
- [x] Reposicionar decoração e animações para a nova geometria.

**Aceite:** seção mais curta sem perda de conteúdo, ordem compreensível e nenhum card comprimido ou sobreposto.

## Tarefa 12 — Perguntas frequentes

**Arquivos:** src/components/sections/faq/{faq-section.tsx,faq-accordion.tsx,faq.css,responsive.css,artwork-layout.css}.

- [x] Simplificar e reduzir a composição decorativa.
- [x] Diminuir e aproximar as imagens do título da seção.
- [x] Investigar a sobra azul lateral na seção e na transição seguinte; corrigir sua origem sem esconder overflow do documento inteiro.
- [x] Preservar abertura e fechamento das perguntas e leitura de respostas longas.

**Aceite:** imagens contextualizadas, acordeão funcional e ausência de faixa indevida/scroll horizontal com respostas abertas.

## Tarefa 13 — Chamada final e footer

**Arquivos:** src/components/layout/footer/{footer-content.tsx,footer-runner.tsx,footer-runner.css,footer-actions.css,responsive.css}; conferir src/components/sections/contact/ somente se a chamada estiver vinculada a ela.

- [x] Compor “Impulsionando empresas, surpreendendo os usuários” em três linhas na referência mobile, evitando quebras rígidas inadequadas em outras larguras.
- [ ] Após revisão da proposta, ocultar os dois botões no mobile e compactar telefone/e-mail.
- [x] Preservar navegação e um caminho claro para contato; verificar links compartilhados por outras páginas.
- [x] Reduzir espaços verticais e recalcular o runner se suas dimensões dependerem do conteúdo.

**Aceite:** chamada equilibrada e footer menor; sem elementos ocultos focáveis; formulário e outros canais preservados; demais páginas sem regressão.

## Tarefa 14 — Validação integrada

- [x] Revisar visualmente em 360, 390 e 430px; conferir transição para tablet em 768px e regressão desktop em 1440px.
- [x] Rodar mobile Chromium e mobile WebKit. WebKit automatizado não substitui a conferência em iPhone/Safari real para barra dinâmica e fluidez de scroll.
- [x] Conferir orientação horizontal, movimento reduzido, navegação por teclado, retorno de scroll e carregamento em posição intermediária.
- [x] Ampliar tests/e2e/site.spec.ts com regressões de comportamento: segundo toque fecha empresa, swipe atualiza paginação e último serviço é alcançável. Evitar testes frágeis que apenas reproduzam valores CSS.
- [x] Executar pnpm check e pnpm build; depois pnpm exec playwright test tests/e2e/site.spec.ts --project=mobile-chromium --project=mobile-webkit --project=desktop-chromium. Registrar falhas preexistentes separadamente.
- [x] Executar o teste existente de vidro dos depoimentos se sua implementação for alterada: pnpm exec playwright test tests/e2e/testimonial-glass.spec.ts.
- [x] Atualizar docs/responsiveness-review.md com as mudanças verificadas e salvar comparativos por seção em artifacts/home-mobile/.

**Entrega:** checklist concluído por seção, capturas comparativas, resultados dos checks e limitações reais de verificação. Não declarar validação em dispositivo físico se apenas a emulação foi utilizada.

## Registro da execução — 30/10/2026

Implementação autorizada pela solicitação de execução, diretamente na V1.
Desktop usado como guia; alterações locais preservadas. A usuária rejeitou
as propostas abertas de novas composições: empresas continuam na faixa,
com marcas menores; cards finais continuam em uma coluna compacta; botões
finais e telefone/e-mail permanecem disponíveis. Os itens correspondentes
ficam desmarcados por decisão de escopo, e não por falha de implementação.

Referência do menu recebida na conversa. Gravação completa e referência de
cor da mídia indisponíveis: cores existentes e conteúdo ambíguo preservados.
A seta grande inferior já não estava visível no mobile inicial. Após revisão
da usuária, as pinceladas automáticas foram restauradas no celular; somente
a lente visual fica oculta. Indicador de rolagem preservado.

Detalhamento e validação: [relatório de execução](../../qa/home-mobile-execution.md).

### Revisão posterior por comentários no navegador

A usuária autorizou ajustes adicionais somente mobile/responsivos. As decisões
anteriores de manter todos os itens do rodapé e evitar duas colunas foram
substituídas pelos comentários 13 e 17–19: duas colunas a partir de 480px,
uma coluna abaixo disso, ocultação dos selos e telefone/e-mail no rodapé mobile.
Softdex permanece no Top 3; “Ver matérias” pertence ao bloco de mídia. As
pinceladas automáticas e o QR em computadores permanecem. Liquid glass dos
depoimentos passa a atender também o mobile. Registro dos 19 comentários em
[home-mobile-comments.md](../../qa/home-mobile-comments.md).
