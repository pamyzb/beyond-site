# Revisão mobile — menu editorial

30/10/2026. Alterações visuais limitadas ao cabeçalho responsivo abaixo de 1440px.

- Logo decorativo em SVG com desenho do contorno via stroke-dashoffset;
  abre em 1800ms após 480ms e apaga ao fechar. Movimento reduzido é imediato.
- Texto de navegação entre 24 e 32px e setas de 32px.
- Idioma ocupa toda a linha e o popup acompanha a largura do botão.
  Português/English com bandeiras SVG de Brasil/Inglaterra e gap de 2px.
  Desktop mantém PT/EN e não mostra as bandeiras.
- Fechamento com sequência inversa: ação, idioma e links de baixo para cima.
  Painel espera a saída dos itens antes de recolher.
- Decoração reposicionada para não criar rolagem vertical excedente;
  navegação limita a área horizontal da arte.

## Verificação

Build, CSS e formatação dos arquivos alterados aprovados.
Cinco testes passaram em Chromium desktop/mobile e WebKit mobile; o teste
exclusivo de mobile foi ignorado no desktop conforme esperado.
Teste cobre desenho progressivo, seletor de idioma, popup de largura igual,
ordem reversa na saída, movimento reduzido e navegação.

Medidas em 320, 498 e 768px: altura útil/scroll de 850px sem excesso vertical,
gap de bandeira de 2px. Desktop a 1440px mantém fonte de 14px e PT.
Capturas: `artifacts/home-mobile/revision-7-*.png`.
