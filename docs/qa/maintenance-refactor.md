# Consolidação de manutenção — 25/10/2026

## Escopo

Separação de CSS por responsável, distribuição de responsividade, contratos
semânticos nos SVGs, extração de responsabilidades de animação e introdução de
Playwright/CI. Os assets originais e os tempos das animações foram preservados.

## Evidências

- Antes da distribuição do CSS, foram registrados seletores, declarações,
  condições de mídia e sua ordem. A extração preservou esses contratos.
- Comparação de estilos computados em 142 elementos por viewport: Chromium e
  WebKit, larguras 390, 768, 1280 e 1440px. Nenhuma diferença nas propriedades
  verificadas: dimensões, display, padding, margin, tipografia, grid, gap, cor e
  posicionamento. Essa comparação não mede todos os pixels, filtros ou keyframes.
- Testes unitários cobrem os contratos de artwork, a rejeição de exports
  incompatíveis, a preservação do SVG e o posicionamento dos robôs com atraso
  da rota em diferentes larguras e posições de scroll.
- O build de produção padrão (`pnpm build`, Turbopack) e a alternativa webpack
  exportaram todas as rotas com sucesso nesta revisão.
- Resultado final: 31 testes unitários e 40 cenários de navegador passaram,
  além de TypeScript, formatação e verificação de cascata.

## Regressões automatizadas

`tests/e2e/site.spec.ts` verifica menu hidratado, ausência de overflow horizontal
na entrada, movimento e pausa do hero, carrossel nos três grupos, controles e
robôs dentro da área compacta, desenho progressivo do telefone e conteúdo
visível com movimento reduzido. Erros JavaScript não tratados falham os cenários.

A ampliação da suíte cobre a fronteira do tema ao descer e voltar, navegação
do carrossel por teclado, exclusividade e acessibilidade do FAQ, validação e
reinício do formulário simulado. Os contratos de assets verificam também as
quantidades de alvos semânticos realmente anotados. Os hooks do Husky são
testados em um repositório temporário com sucesso e falha das verificações.

A revisão exige exatamente dois robôs em cada grupo. Para os dois telefones,
compara todos os elementos originais da tela com a aparência sem animação e
aguarda o término de todos os traços; o modo de movimento reduzido também cobre
ambos os telefones.

A comparação inclui a opacidade acumulada e `display` de todos os ancestrais,
incluindo o SVG da tela. Assim, um grupo transparente não passa apenas porque
seus filhos mantêm `opacity: 1`. A referência sem animação também exige texto
visível, evitando comparar duas telas igualmente ocultas.

O ícone de blocos de Sobre também é verificado após a montagem pelo servidor:
mantém o atributo semântico e os quatro retângulos da correção gráfica. O teste
detectou a falha na exportação anterior, cujo tag com atributos adicionais não
era reconhecido pela substituição original.

Os testes usam a exportação estática; o workflow mantém screenshots e traces de
falhas. Não foi criada uma referência de screenshot que aprove automaticamente
a aparência atual. Esta validação não é uma medição de FPS nem uma execução em
iPhone físico; refração e desempenho ainda precisam de conferência nesse aparelho.
