# Cards de métricas — V1

Referência: Figma `16023:389`, inspecionada no Dev Mode pelo navegador em 26/10/2026 (conector MCP indisponível).

Os três cards existentes mantêm o conteúdo e os contadores. Fundos azul, claro e lilás, raio de 1rem, padding de 2.5rem por 1rem e sombras sólidas seguem o frame. As cores das sombras estão centralizadas em `src/styles/tokens.css`.

O grid usa três colunas no desktop e uma abaixo de 60em. Medidas fixas usam rem; o tamanho dos números usa clamp e cqi para acompanhar a largura interna do card sem transbordar. A altura mínima permite crescimento do texto.

Validação: build estático, TypeScript e verificação da cascata CSS passaram. Conferência visual em 1440 e 390; geometria dos cards também conferida em 768 e 320, sem overflow interno. Captura: `artifacts/metrics-desktop.png`.

Os vetores decorativos dos três cards foram extraídos do painel SVG do Figma (16023:391, 16023:397 e 16023:401) e salvos em `public/assets/metricas/padroes/card-*.svg`. Os arquivos mantêm a geometria, as cores e o recorte originais. São backgrounds CSS sem conteúdo semântico, centralizados com `cover`, sem alterar a geometria dos cards.

Tilt: os cards existentes usam rotação reversa com fator 16 e retorno suave ao sair/cancelar o ponteiro. O efeito acompanha o mouse, preserva o grid e move vetores e sombras juntos. CSS limita a animação a hover com ponteiro fino e sem preferência por movimento reduzido. Sem novas dependências. Validação: TypeScript, cascata CSS e build.

Contadores: efeito de odômetro com duas voltas por dígito e desaceleração escalonada, disparado pelo ScrollTrigger ao entrar na tela. Pontuação e sufixos permanecem fixos. Executa uma vez por montagem; preferência de movimento reduzido mostra os valores finais diretamente. O contexto GSAP limpa animação e trigger ao desmontar.
