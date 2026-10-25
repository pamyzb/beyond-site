# Vidro do hero e experimento 3D

O componente ativo é `src/components/sections/hero/hero-glass.tsx`, com o mapa de
refração em `src/lib/animation/hero-glass-map.ts`. Ele usa uma cópia mascarada
do conteúdo do hero, filtros SVG e canvas para o mapa de deslocamento. O filtro
fica limitado à área da lente. O mapa é pequeno e reutilizado por dimensão.
Em desktop com ponteiro fino (90em ou mais), acompanha o mouse. Nas outras
composições, usa uma lente menor com a mesma técnica de cópia e refração,
ampliação de 1,3 e intensidade de deslocamento de 1,8 vezes o mapa base.
O filtro continua limitado à área da lente. Transparência, reflexos e a face
traseira têm ajustes próprios no modo automático; a variante do mouse mantém
ampliação de 1,26 e a intensidade base do mapa.

O percurso automático atravessa faixas horizontais e diagonais em Z até a
base do hero e retorna pelo mesmo caminho. A quantidade de faixas depende
da altura disponível, com intervalos de até 140px. Cada segmento tem passagem
de 1,8s e pausa de 1,6s; o ciclo completo varia com o número de segmentos.
As extremidades usam desaceleração suave, sem giro da lente ou salto no loop.
Com movimento reduzido, a marca fica estática.

`HeroInk` controla a revelação escura separadamente. `HeroSection` compõe os
dois efeitos, o texto e o vídeo. O rastro usa contornos vetoriais com os mesmos
parâmetros de expansão e retração da referência: raio de 145px, duração de
1800ms e até 90 pontos no desktop. O fundo em vídeo e o preenchimento verde
animado foram preservados. As mídias ficam em `src/data/hero-media.ts`.

No modo automático, o raio é `min(80px, largura do hero × 0,18)`, a duração
máxima de cada contorno é 2600ms e são mantidos até 12 pontos. O rastro usa a
mesma expansão orgânica e retração do desktop; não há perfil de cometa.
Durante as pausas, posições praticamente repetidas não geram novos pontos.
O movimento automático é limitado a intervalos de pelo menos 32ms; a amostragem
de vídeo só ocorre ao cruzar a palavra com vídeo, a até 24fps e 480px no lado maior.

Os hooks `use-hero-glass.ts` e `use-hero-ink.ts` pausam o trabalho fora da tela
e quando a aba está oculta. O vídeo principal também só toca quando visível.
A implementação ativa não depende de Three.js. Medições e limites da validação:
[`qa/hero-motion-performance.md`](./qa/hero-motion-performance.md).

O experimento WebGL foi preservado em `design/experiments/hero-three.tsx`.
Ele extrudava o SVG com bevel e material físico; HTML e vídeo atrás do canvas
não eram amostrados por essa cena. O arquivo é histórico, está fora do build
e não é executável sem restaurar suas dependências e adaptar seus imports.

As implementações anteriores da máscara em PNG e da lente com filtro de tela
inteira estão em `design/experiments/hero-ink-canvas-mask.tsx` e
`design/experiments/hero-glass-full-scene.tsx`, fora do build ativo.

Three.js e seus tipos foram retirados das dependências por não serem usados
pela página ativa. GSAP permanece responsável pelas timelines e pelos triggers
de rolagem do site.
