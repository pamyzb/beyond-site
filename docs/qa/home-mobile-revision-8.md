# Revisão mobile — contraste e menu

30/10/2026. Ajustes visuais limitados ao responsivo.

- Ícone do menu acima da camada de preenchimento do hover, corrigindo seu
  desaparecimento no dark. Captura com hover confirma as três linhas brancas.
- Título de depoimentos sem quebra forçada: uma linha em 498/539px; duas
  em 390px. Palavra de destaque permanece inteira.
- Contorno SVG dos cards reduzido de stroke-width 6 para 2. A textura GPU
  usa o mesmo SVG, mantendo nitidez e refração consistentes.
- Idioma: 8px entre bandeira/texto, Union Jack para English, opções com altura
  mínima de 56px, padding 12 × 16px e 8px entre opções.
- Setas de navegação em cinza da paleta; azul apenas no link com aria-current
  correspondente ao pathname. Links sem página publicada permanecem neutros.
- Fechamento reduzido para cerca de 480ms: saída dos itens em 220ms com
  stagger reverso curto e painel começando a recolher após 120ms.

## Verificação

Build, formatação e checagem CSS aprovados. Navegação e transição glass
passaram em Chromium/WebKit mobile. Teste do menu verifica desenho, idioma,
gap de 8px, alvo de 56px, dropdown, movimento reduzido e saída reversa.
A saída agora é amostrada por requestAnimationFrame para verificar sua
sequência sem depender de uma captura tardia após o clique no WebKit.

Capturas em `artifacts/home-mobile/revision-8-*.png`.
