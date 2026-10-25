# Animações

A V1 usa GSAP + ScrollTrigger + @gsap/react. Importe sempre de `@/lib/animation/gsap` para compartilhar o registro dos plugins.

O hero usa `requestAnimationFrame` e mídias nativas para acompanhar o mouse e
revelar o vídeo sob o rastro. Não precisa de uma segunda biblioteca de animação.
Nas telas compactas, o movimento é automático; fora da tela e com a aba oculta,
os loops e os vídeos são pausados. Veja [`hero-3d.md`](./hero-3d.md).

## Tema por scroll

As regras de cor e os contratos de componentes estão em
[`themes.md`](./themes.md).

`MotionRoot` coordena as animações dos títulos, o WhatsApp flutuante e o trigger `conversation-scroll-theme`. Ele começa quando o fim de `#conversa` alcança o fim da viewport, com `start: "bottom bottom"`. Ao sair da seção de conversa, ativa `data-scroll-theme="dark"`; ao retornar acima desse ponto, volta para `light`. O estado permanece dark nas seções seguintes. As cores usam os tokens CSS e respeitam `prefers-reduced-motion`.

O hook espera as fontes locais e recalcula os triggers após mudanças de altura (inclusive expansão do blog), resize e restauração da página. `useGSAP` reverte os triggers do próprio contexto ao desmontar, inclusive no ciclo duplo do Strict Mode. Não use `ScrollTrigger.killAll()`, pois isso destruiria animações de outros componentes.

## Adicionar uma timeline a um componente

Use um Client Component com ref próprio. Selecione somente descendentes desse ref e use `gsap.matchMedia` para variantes responsivas e movimento reduzido:

```tsx
'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/animation/gsap';

export function AnimatedFigure() {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const figure = scope.current?.querySelector('[data-motion="figure"]');
        if (!figure) return;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: scope.current,
              start: 'top 80%',
              end: 'bottom 30%',
              scrub: 1,
            },
          })
          .fromTo(figure, { y: 40 }, { y: 0, ease: 'none' });
      });
      return () => media.revert();
    },
    { scope },
  );
  return (
    <div ref={scope}>
      <div data-motion="figure">Conteúdo</div>
    </div>
  );
}
```

Esse exemplo não foi aplicado à página: novas animações devem partir do movimento aprovado para cada seção. Para callbacks posteriores ao hook (eventos, timers), use `contextSafe`. Ao atualizar dependências, use `revertOnUpdate: true`. Não esconda conteúdo essencial no CSS inicial; a versão sem JavaScript deve continuar legível.

## Alvos e artwork

As seções têm `data-motion="section"` e os cartões `data-motion="card"`. Textos são elementos React, não imagens. Em 1440 px, parte da decoração ainda vem dos SVGs compostos originais e os cartões usam `display: contents` para conservar a geometria aprovada. Para animar um cartão completo nessa largura, extraia sua decoração em um componente/asset independente e dê um box real ao wrapper antes de aplicar transforms. Não anime o wrapper `display: contents`, nem espere selecionar paths internos de um `<img>`.

O SVG do bloco "45 minutos" já está inline e suas cores são controladas pelo CSS. Os recortes de imagens responsivas ficam em `public/assets/figma/`. Para animações complexas de paths, prefira SVG inline local e IDs sem colisão. O scroll da página continua nativo. Os pins de Serviços e Cases ficam restritos a desktop com ponteiro fino, altura suficiente e movimento habilitado.

## Variantes responsivas atuais

Os breakpoints são em `em`. Os valores aproximados em pixels abaixo assumem
uma referência de 16px; “modo compacto” também inclui tablets e notebooks,
não apenas celulares.

| Efeito | Condição e comportamento |
| --- | --- |
| Hero com mouse | A partir de `90em`, com hover e ponteiro fino. |
| Hero automático | Demais layouts, sem movimento reduzido: refração numa lente menor e faixas de Z até a base, com retorno. Detalhes em `hero-3d.md`. |
| Serviços compactos | Abaixo de `90em`, sem hover ou com ponteiro coarse: controles numa linha abaixo dos cards e robôs na faixa acima do card visível. |
| Jornada fixada de Serviços | A partir de `90em`, altura mínima de `48em`, hover, ponteiro fino e movimento habilitado. |
| Desenho do Aplicativo | A partir de `60em`, com hover e ponteiro fino, usa a sequência detalhada com recorte. Nos demais layouts, desenha contorno e conteúdo sem o recorte animado adicional. |
| Refração dos Depoimentos | A partir de `60em`, com hover e ponteiro fino, enquanto há movimento e desaceleração. A intensidade chega praticamente a zero antes de remover o filtro. Nos demais layouts, refração e blur dos cards ficam desativados. |

O Aplicativo usa `app-artwork.tsx`. No modo compacto, o ScrollTrigger observa
o wrapper HTML do telefone, não o grupo interno do SVG. O contorno aparece
primeiro e os elementos da tela são desenhados e preenchidos em sequência,
de cima para baixo. O preparo dos assets também normaliza a transformação
do SVG interno para um `<g>` externo, mantendo a correção de renderização no
Safari. Respeite a desmontagem dos clones, clips e timelines ao alterar o efeito.

## Verificação em navegador

Os testes de geometria e SVG não executam as timelines num navegador. Depois
de alterar uma animação, valide entrada e saída da seção, retorno pelo scroll,
redimensionamento, navegação dos carrosséis e preferência de movimento reduzido.
Confira o Safari real no iPhone para alterações em máscaras, filtros e SVGs
aninhados. O procedimento de acesso ao servidor pela rede está no README.
