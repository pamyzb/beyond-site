# Logo 3D do hero

O componente ativo é `src/components/site/hero-three.tsx`. Three.js é importado apenas no cliente. O SVG `public/assets/figma/hero-glass-mask.svg` gera uma geometria extrudada com bevel, material físico de vidro e iluminação de ambiente.

O logo inicia no centro do hero. O cursor controla posição e rotação X/Y; sair do hero preserva a última posição. Touch e movimento reduzido usam uma pose estática. O canvas limita DPR a 1.5 e renderiza apenas durante alterações, pausando fora da tela e na aba oculta. Recursos GPU e listeners são liberados ao desmontar. Sem WebGL, um SVG estático substitui o canvas.

Nesta versão, transmissão e reflexos pertencem à cena WebGL. HTML e vídeo atrás do canvas não são amostrados nem ampliados pelo vidro. Integrar esse conteúdo à refração é uma etapa separada.

A versão anterior permanece em `hero-glass.tsx` e `hero-glass-map.ts`; para reutilizá-la, trocar o import de HeroGlass em `design-section.tsx`. A revelação escura do hero e header continua separada em `hero-ink.tsx`.
