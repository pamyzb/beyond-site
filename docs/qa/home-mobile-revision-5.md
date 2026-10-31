# Revisão mobile — quinta rodada

30/10/2026.

- Métricas e cases: 80px de respiro superior/inferior junto aos vetores.
  Estas exceções substituem o padding de 40px da regra geral dessas seções.
- Cases: intervalo de meia tela após cada janela antes de a próxima
  entrar. O botão fica inteiro visível antes da sobreposição. Favicons
  reaproveitam os ícones já existentes das abas desktop.
- Conversa: restaurado o padding próprio que reserva espaço às quatro fotos,
  sem alterar as distâncias internas de 24px.
- Menu responsivo: painel entra pela direita; links entram em sequência de
  40ms, usando curvas, cores e tipografia existentes. Hambúrguer vira X e a
  linha central recua. Fechamento reversível; Escape e inert preservados.
  Movimento reduzido remove as transições.

## Verificação

Build aprovado. Seis testes de navegador passaram em Chromium/WebKit mobile:
pausa com CTA integralmente visível, expansão/sobreposição, leitura sequencial,
movimento reduzido e abertura/fechamento do menu.

Conversa medida em Chromium/WebKit a 390, 498 e 768px sem sobreposição entre
fotos e título/botão, sem overflow horizontal. Padding dos cases confirmado
em 80px. Formatação dos arquivos alterados e verificação CSS aprovadas.

Evidências em `artifacts/home-mobile/revision-5-*.png` e
`artifacts/home-mobile/test-results/revision-5/`.
