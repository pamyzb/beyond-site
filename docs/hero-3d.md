# Vidro do hero e experimento 3D

O componente ativo é `src/components/sections/hero/hero-glass.tsx`, com o mapa de
refração em `src/lib/animation/hero-glass-map.ts`. Ele usa uma cópia mascarada
do conteúdo do hero, filtros SVG e canvas para o mapa de deslocamento. O filtro
fica limitado à área da lente. O mapa é pequeno e reutilizado por dimensão.
Em desktop com ponteiro fino (90em ou mais), acompanha o mouse. Nas outras
composições, percorre lentamente as duas linhas do título do hero com uma lente
menor, sem copiar a cena inteira. O ciclo dura 24 segundos, mantém o rastro
visível e conserva a lente estável nas curvas. Com movimento reduzido, a marca
fica estática.

`HeroInk` controla a revelação escura separadamente. `HeroSection` compõe os
dois efeitos, o texto e o vídeo. O rastro usa contornos vetoriais com os mesmos
parâmetros de expansão e retração da referência: raio de 145px, duração de
1800ms e até 90 pontos no desktop. O fundo em vídeo e o preenchimento verde
animado foram preservados. As mídias ficam em `src/data/hero-media.ts`.

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
