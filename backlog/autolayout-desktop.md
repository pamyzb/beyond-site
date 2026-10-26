# Backlog — arquitetura de autolayout desktop (V1)

## Objetivo

Transformar a V1 em uma estrutura web de desktop baseada em fluxo normal, Flexbox e CSS Grid, preservando a referência visual em 1440px. Esta iniciativa prepara a responsividade futura; ela não inclui breakpoints, variantes mobile ou alterações de design.

## Regras permanentes

- Trabalhar diretamente em `prototype/`.
- Migrar uma etapa por vez e validar antes de iniciar a próxima.
- Não reposicionar conteúdo semântico por coordenadas X/Y para recuperar o visual.
- Manter `position: absolute` para ilustrações, fundos, SVGs, máscaras, canvas e sobreposições justificadas.
- Preservar conteúdo, assets, tipografia, cores, espaçamentos, interações e animações aprovadas.
- Não criar abstrações compartilhadas até que exista um padrão validado em mais de uma seção.

## Estado atual

Concluído e validado em 1440px:

- Estabilização das seções já migradas: Conversa, Depoimentos, Processo, Sobre, FAQ e Contato.
- Cabeçalho: marca, navegação, idioma e CTA organizados por Flexbox; o SVG continua como camada visual.
- Hero: selo, título, descrição, CTA e indicador de rolagem organizados em Grid e Flexbox. As camadas de vídeo, vidro, tinta, máscara e Three.js permanecem absolutas e independentes do conteúdo.
- Aplicativo: heading, os dois blocos de benefício e a chamada de QR organizados em uma Grid com cards Flex. Os aparelhos, fundos e traços SVG continuam como camadas decorativas independentes.
- Serviços: cabeçalho, trilho de cards, controles e paginação organizados em fluxo com Flexbox e Grid. As setas preservam sua sobreposição como uma camada da própria Grid, sem posicionamento absoluto.
- Cases: heading, toolbar, tabs, painel, CTA e depoimento estruturados com Grid e Flexbox. O painel fixado usa uma única Grid local para toolbar, conteúdo e depoimento; imagens e telas demonstrativas preenchem somente a célula visual. A navegação entre projetos mantém os controles e ganhou landmark semântico.
- Clientes e métricas: faixa de marcas, detalhe expandido, indicadores e destaque na mídia permanecem no fluxo. Marcas e indicadores são regiões semânticas independentes, e o painel usa Grid para delimitar conteúdo e sequência vertical; padrões gráficos seguem decorativos.
- Blog: heading, grades de posts e ação de expansão permanecem no fluxo. A composição bento usa áreas nomeadas da Grid em vez de depender da ordem dos cards; imagens, máscara e alvo de interação continuam como camadas locais de cada card.
- Rodapé: marca, navegação, slogan, redes, selos, endereço, contatos e ações agora compõem uma Grid semântica. O SVG e o runner permanecem camadas decorativas independentes do conteúdo.
- Consolidação estrutural: `.section-content`, `.content-card`, `.text-block` e `.text-run` agora entram no fluxo por padrão. Regras legadas de coordenadas órfãs foram removidas de Aplicativo, Processo e Sobre; posicionamento absoluto ficou restrito a arte, fundos, máscaras, SVGs, vídeo/WebGL e sobreposições locais justificadas.

## Próxima iniciativa — eliminar geometria desktop rígida

### Objetivo

Levar a arquitetura de autolayout de 9 para 10 sem implementar responsividade. A meta é converter alturas, trilhas e espaçamentos rígidos que ainda descrevem a geometria de 1440px em limites de layout (`min-height`, `max-width`, `minmax()`, `gap` e proporções), mantendo a mesma aparência em 1440px.

### Guardrails adicionais

- Não introduzir media queries, empilhamentos ou variantes para telas menores.
- Em 1440px, toda medida visual deve permanecer equivalente à referência atual.
- Cada etapa altera uma única seção ou família local de componentes e termina antes de iniciar a seguinte.
- Valores fixos de asset e de composição decorativa podem permanecer quando descrevem a própria arte, e não o fluxo de conteúdo.

### 1. Linha de base mensurável

- **Concluída em 2026-10-22.** Medições e classificação registradas em [`prototype/docs/autolayout-desktop-baseline.md`](../prototype/docs/autolayout-desktop-baseline.md).
- Capturados viewport, largura rolável, alturas de seção e containers em 1440px; não há overflow horizontal.
- Nenhum componente de produção foi modificado nesta etapa.

### 2. Hero

- **Concluída em 2026-10-22.** O selo e título agora formam `.hero-copy`; esse grupo e o bloco de descrição/CTA formam `.hero-main` em Flex. A Grid externa mantém somente a área flexível de conteúdo e o indicador ancorado.
- O Hero agora usa `min-height` com a altura de referência como piso, em vez de depender de uma altura fixa para acomodar conteúdo.
- Em 1440px, a geometria medida de selo, título, descrição, CTA e indicador foi preservada. CTA continua em `#contato`; o indicador foi acionado e navegou para `#metricas`. Tinta e vidro permanecem como camadas independentes.

### 3. Aplicativo

- **Concluída em 2026-10-22.** A matriz de oito linhas foi substituída por um fluxo Flex: heading, primeiro benefício e segundo benefício estabelecem sua sequência vertical; as larguras e alinhamentos usam frações do container em vez de colunas implícitas.
- O QR passou a ser uma Grid interna do segundo benefício. Superfície e copy estão no fluxo; apenas as linhas de contorno continuam absolutas, como decoração local.
- Em 1440px, foram preservadas as posições relativas do primeiro benefício (503,5px), segundo benefício (1017,2px) e QR (1247,2px). A transição de tema escuro, títulos animados, QR e ausência de overflow foram verificados; não houve erros de console.

### 4. Processo

- **Concluída em 2026-10-22.** Os quatro cards agora estão agrupados em duas colunas Flex com `gap: 15px`; a Grid principal organiza somente heading e colunas.
- Os deslocamentos de `-42px` e `88px` permanecem como relações locais das duas colunas, preservando a composição inclinada sem uma linha Grid de `353px`.
- Em 1440px, os quatro cards preservaram suas posições de fluxo originais. Track, marcador, ScrollTrigger e hover continuam presentes; a ordem das animações foi preservada por `data-step`.

### 5. Conversa, Sobre, FAQ e Contato

- **Concluída em 2026-10-22.** Conversa, Sobre, FAQ e Contato agora usam a altura exportada apenas como `min-height` da seção; os wrappers semânticos deixaram de preencher uma altura rígida com `height: 100%`.
- Heading, cards de Sobre, acordeão e formulário permanecem no fluxo atual de Flex/Grid. As ilustrações, fotos, SVGs e máscaras continuam em camadas decorativas independentes.
- Em 1440px, a composição foi mantida. O acordeão abriu normalmente; a validação do formulário mostrou erros e levou o foco ao primeiro campo inválido. Tema de rolagem, animações de entrada e hover dos cards foram preservados por não terem sido alterados.

### 6. Serviços, Cases e Blog

- **Concluída em 2026-10-22.** Serviços deixou de reservar uma linha de `40px` apenas para paginação: a Grid agora usa uma linha intrínseca, preservando o trilho e os controles em fluxo.
- Cases passou a tratar a altura do painel fixado como `min-height`; toolbar, painel e depoimento continuam na mesma Grid, mas podem crescer se o conteúdo exigir. Imagens e telas demonstrativas seguem delimitadas por suas células visuais.
- Blog já usava áreas nomeadas e linhas `minmax()` de crescimento controlado, então não exigiu alteração estrutural. Em 1440px, carrossel, tabs, painel fixado e expansão para oito posts foram verificados.

### 7. Clientes, Métricas, Cabeçalho e Rodapé

- **Concluída em 2026-10-22.** A faixa de Clientes agora define sua altura a partir de logos, resumo e padding local; a altura de 146px observada em desktop vem do maior item, em vez de uma altura aplicada ao trilho.
- Métricas removeu o `min-height` inativo do painel: a Grid de indicadores e destaque na mídia já determina seus 494px em 1440px.
- O rodapé deixou de usar o `min-height` do frame Figma. Suas cinco linhas de Grid são intrínsecas e o respiro final passou a ser padding do próprio layout, preservando 882px na referência.
- Cabeçalho permanece em uma única linha Flex; seus 87px são dimensão da arte e da área de interação, não um canvas para organizar conteúdo.
- Em 1440px, a faixa de Clientes (146px), bloco de marcas (314px), painel de métricas (494px), rodapé (882px), largura rolável (1425px) e ausência de overflow horizontal foram verificados. Expansão de marca e seletor de idioma abriram e fecharam corretamente; não houve erros no console.

### 8. Consolidação e auditoria final

- **Concluída em 2026-10-22.** A casca padrão `.design-section` passou a usar a altura exportada como `min-height`, em vez de `height`, eliminando a última dependência global do canvas Figma.
- A única altura de composição que permanece no conteúdo é a Grid interna de Processo (`1148px`): ela ancora os cards à trilha ilustrada e não posiciona texto nem cards por coordenadas. A seção externa pode crescer no fluxo.
- As demais medidas remanescentes descrevem limites de leitura, dimensões de assets, áreas de interação, trilhas visuais locais, mídia ou camadas decorativas. Nenhum `.section-content`, `.content-card`, `.text-block` ou `.text-run` computa `position: absolute`.
- A matriz estabilizada em 1440 × 900 px preservou as alturas de referência: Hero 967px, Métricas 856px, Conversa 986px, Aplicativo 1580px, Depoimentos 1072px, Processo 1148px, Sobre 749px, Blog 1279px, FAQ 1036px, Contato 975px e Rodapé 882px. Cases preservou 3369px após a inicialização do ScrollTrigger.
- `documentElement.scrollWidth` permaneceu em 1425px, sem overflow horizontal, e o console não registrou erros. `npm run typecheck` e `git diff --check` passaram.
- A iniciativa de autolayout desktop está encerrada. A próxima evolução pode introduzir responsividade sobre essa estrutura, em uma iniciativa separada.

## Checklist obrigatório por etapa

1. Registrar geometria e captura da referência desktop antes da alteração.
2. Modificar exclusivamente a seção da etapa corrente.
3. Comparar o resultado em 1440px com a referência.
4. Verificar animações e interações específicas.
5. Executar `npm run typecheck` e `git diff --check` quando houver alteração de código.
6. Corrigir regressões e apresentar o resultado para avaliação antes de avançar.
