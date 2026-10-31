# Revisão mobile — quarta rodada

30/10/2026. Ajustes restritos ao responsivo.

- Clientes: espaço superior reduzido de 120px para 48px abaixo de 600px.
- Top 3: altura mínima reduzida de 160px para 120px e padding vertical de 16px.
- Mídia: grade real de duas colunas iguais; cada logo e botão ocupa uma célula
  de 72px de altura. Logos contidos em uma área visual comum de até 128 × 56px.
- Cases: expansão das margens até largura total ao aproximar-se do topo;
  cada janela permanece em leitura natural até sua base chegar ao viewport.
  Depois é fixada sem espaço adicional e a próxima sobe por cima, com camada
  crescente. Ao voltar o scroll, a composição se desfaz. Movimento reduzido
  preserva os controles manuais existentes.
- Explorar case: ocupa toda a largura útil da área de ação no mobile.
- App: gap de 24px entre cabeçalho e conteúdo.
- Depoimentos: espaços antes/depois da transição entre app e depoimentos
  reduzidos para 32px de cada lado.
- Vetor dos depoimentos ampliado para 200% da largura, com o mesmo recorte
  no HTML e na textura GPU. Refração durante a troca preservada.

## Verificação

Build, verificação CSS e 40 testes unitários aprovados. Seis testes de navegador
passaram em Chromium e WebKit mobile: expansão/sobreposição, acesso aos botões,
fallback de movimento reduzido e transição glass.

Mídia medida a 320px e 498px: quatro células idênticas em cada largura,
109 × 72px e 198 × 72px respectivamente. Sem overflow horizontal também a 1440px.
Capturas em `artifacts/home-mobile/revision-4-*.png` e
`artifacts/home-mobile/cases-overlap-*.png`.

O comando global `pnpm check` parou na formatação de
`src/app/colaboradores-agenticos/service.css`, fora desta rodada.
Tipos passaram; formatação dos arquivos desta alteração, CSS e testes foram
verificados separadamente.
