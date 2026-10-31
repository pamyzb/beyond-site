# Revisão mobile — terceira rodada

30/10/2026. Pedidos anotados na prévia em 498px.

- Clientes: carrossel contínuo em duas linhas abaixo de 600px. O cálculo
  existente do ciclo mede a primeira cópia também na nova grade.
- Métricas: duas colunas, Top 3 em largura total abaixo, altura de 160px
  e números ajustados à largura compacta.
- Mídia: grade com Estadão/PEGN na primeira linha e Valor/botão terciário
  na segunda. Sem Softdex nesse bloco; o selo permanece no Top 3.
- Serviços: os cards compactos permanecem visíveis. O limiar de revelação
  anterior ocultava a faixa do próximo card até 18% entrar no viewport.
- Conversa: 24px entre título, texto e botão.
- App: 40px entre cabeçalho e conteúdo.
- Sobre: ícones menores; soma dos espaços até o blog reduzida para 64px.
- Contato: confirmados 24px entre título e descrição, sem alteração adicional.
- Rodapé: confirmados 24px entre botão e vetores inferiores.
- FAQ: inicia toda fechada no desktop e mobile; preserva abertura única e teclado.

## Verificação

- Build e `pnpm check` aprovados (40 testes unitários).
- Teste funcional da FAQ aprovado nos três projetos: Chromium desktop,
  Chromium mobile e WebKit mobile.
- Medidas e capturas em Chromium/WebKit a 320, 498 e 1440px. Sem overflow;
  gaps de 24px e 40px conferidos com movimento reduzido para medir o repouso.
- Capturas de serviços com movimento normal confirmam o card vizinho visível.
- Evidências: `artifacts/home-mobile/revision-3-*.png` e script
  `artifacts/home-mobile/review-revision-3.cjs`.
