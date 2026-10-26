# Animações

A V1 usa GSAP + ScrollTrigger + @gsap/react. Importe sempre de `@/lib/animation/gsap` para compartilhar o registro dos plugins.

Em Processos, os cards entram lateralmente conforme sua coluna, com fade e
uma sequência curta ao alcançar o scroll. O caminho e o marcador aparecem
durante a entrada; as conexões acompanham as bordas dos cards em movimento.
Com movimento reduzido, os cards e o caminho ficam visíveis sem entrada animada.

A imagem `.faq-team-art` usa a mesma entrada com fade de Contato (1,65s,
`power4.out`), da esquerda para a direita. O trigger acompanha a própria imagem
em `top 82%`; com movimento reduzido, ela permanece visível e sem deslocamento.

O hero usa `requestAnimationFrame` e mídias nativas para acompanhar o mouse e
revelar o vídeo sob o rastro. Não precisa de uma segunda biblioteca de animação.
Com mouse, o efeito acompanha o cursor em qualquer largura. Em dispositivos
de toque, o movimento é automático; fora da tela e com a aba oculta,
os loops e os vídeos são pausados. Veja [`hero-3d.md`](./hero-3d.md).

## Tema por scroll

As regras de cor e os contratos de componentes estão em
[`themes.md`](./themes.md).

`MotionRoot` coordena as animações dos títulos, o WhatsApp flutuante e o trigger `app-scroll-theme`. Ele começa quando o título “Seu projeto na palma da mão” (`#app-project-title`) entra na viewport, com `start: "top bottom"`. Nesse ponto, ativa `data-scroll-theme="dark"`; ao retornar acima desse ponto, volta para `light`. O estado permanece dark nas seções seguintes. As cores usam os tokens CSS e respeitam `prefers-reduced-motion`.

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

Para os derivados SVG, use `data-artwork-role` (por exemplo `phone`,
`phone-camera`, `photo` e `process-marker`). O mapeamento dos nomes exportados
fica em `scripts/figma/artwork-roles.mjs`, com validação de quantidade no preparo
e testes. Uma reexportação exige revisar esse adaptador; não adicione IDs como
`Container_26` aos seletores dos hooks. IDs continuam necessários para referências
internas SVG, como clips e filtros, com namespace por instância.

As seções têm `data-motion="section"` e os cartões `data-motion="card"`. Textos são elementos React, não imagens. Em 1440 px, parte da decoração ainda vem dos SVGs compostos originais e os cartões usam `display: contents` para conservar a geometria aprovada. Para animar um cartão completo nessa largura, extraia sua decoração em um componente/asset independente e dê um box real ao wrapper antes de aplicar transforms. Não anime o wrapper `display: contents`, nem espere selecionar paths internos de um `<img>`.

O SVG do bloco "45 minutos" já está inline e suas cores são controladas pelo CSS. Os recortes de imagens responsivas ficam nas pastas de seção em `public/assets/`. Para animações complexas de paths, prefira SVG inline local e IDs sem colisão. O scroll da página continua nativo. Os pins de Serviços e Cases ficam restritos a desktop com ponteiro fino, altura suficiente e movimento habilitado.

## Variantes responsivas atuais

Os breakpoints são em `em`. Os valores aproximados em pixels abaixo assumem
uma referência de 16px; “modo compacto” também inclui tablets e notebooks,
não apenas celulares.

| Efeito | Condição e comportamento |
| --- | --- |
| Hero com mouse | A partir de `90em`, com hover e ponteiro fino. |
| Hero automático | Demais layouts, sem movimento reduzido: refração numa lente menor e faixas de Z até a base, com retorno. Detalhes em `hero-3d.md`. |
| Serviços compactos | Abaixo de `90em`, sem hover ou com ponteiro coarse: controles numa linha abaixo dos cards e robôs na faixa acima do card visível. |
| Jornada fixada de Serviços | A partir de `60em`, altura mínima de `48em`, hover, ponteiro fino e movimento habilitado. |
| Desenho do Aplicativo | A partir de `60em`, com hover e ponteiro fino, usa a sequência detalhada com recorte. Nos demais layouts, desenha contorno e conteúdo sem o recorte animado adicional. |
| Refração dos Depoimentos | No desktop (`60em`, hover e ponteiro fino), as laterais usam WebGL com curva cilíndrica calculada em ponto flutuante e duas texturas reutilizáveis (texto e vídeo), medidas a partir do HTML e limitadas a DPR 2 e ao tamanho máximo da GPU. O centro permanece HTML nítido e interativo. Uma faixa externa de 48px mistura HTML e canvas com alpha complementar; refração e blur só começam depois dessa faixa, evitando letras duplicadas e divisões verticais. O fundo e a linha de base das texturas acompanham o CSS. O canvas só redesenha quando a posição do carrossel muda, sem reenviar texturas; scroll e resize sem mudança de geometria reutilizam o resultado. Fora da seção, com aba oculta ou movimento reduzido, ticker e canvas são suspensos. Durante a reprodução de vídeo, o canvas e o avanço automático pausam; o ticker continua observando o estado de reprodução. Mobile, GPU indisponível e perda do contexto mantêm o carrossel HTML sem refração. Preparações obsoletas são canceladas e os recursos GPU são liberados ao desmontar ou substituir o renderizador. |

O Aplicativo usa `app-artwork.tsx`. No modo compacto, o ScrollTrigger observa
o wrapper HTML do telefone, não o grupo interno do SVG. O contorno aparece
primeiro e os elementos da tela são desenhados e preenchidos em sequência,
de cima para baixo. O preparo dos assets também normaliza a transformação
do SVG interno para um `<g>` externo, mantendo a correção de renderização no
Safari. Respeite a desmontagem dos clones, clips e timelines ao alterar o efeito.

## Verificação em navegador

Para comparar o fallback HTML dos Depoimentos, abra `/?testimonialGlass=off#depoimentos`.
Esse parâmetro desativa somente a refração desse carrossel, sem alterar as demais
animações nem a preferência do navegador. Remova o parâmetro para voltar ao WebGL.

`pnpm build && pnpm test:e2e` executa os cenários Playwright sobre a exportação
estática, em Chromium desktop/tablet/mobile e WebKit desktop/mobile. Instale os browsers
antes com `pnpm exec playwright install chromium webkit`. A suíte cobre menu,
movimento/pausa do hero, controles e robôs de Serviços, desenho dos telefones
e conteúdo com movimento reduzido. O workflow `Quality` também a executa no CI.

Os testes de geometria e SVG não executam as timelines num navegador. Depois
de alterar uma animação, valide entrada e saída da seção, retorno pelo scroll,
redimensionamento, navegação dos carrosséis e preferência de movimento reduzido.
Confira o Safari real no iPhone para alterações em máscaras, filtros e SVGs
aninhados. O procedimento de acesso ao servidor pela rede está no README.

## Menu responsivo

O menu da V1 revela o painel verticalmente em 560 ms, com aceleração e desaceleração suaves e borda inferior arredondada durante o percurso. Links sobem 1 rem em 360 ms, em sequência de 35 ms; idioma e CTA concluem a entrada em 660 ms. O fechamento dura 280 ms. O ícone transforma as linhas em X em 320 ms. Os controles ficam inertes quando fechado; desktop mantém a navegação disponível. Com movimento reduzido, o painel usa apenas opacidade por 90 ms. Os tokens locais de movimento ficam em header/responsive.css.


O header responsivo reutiliza os tokens de vidro do desktop em uma camada própria: fundo translúcido, blur de 1.5 rem, saturação de 180%, borda e sombra. A camada acompanha os temas claro/escuro sem afetar a animação do painel.

### Serviços no mobile: card ativo
Nos layouts compactos, robôs e contorno acompanham o card mais próximo do centro após a rolagem parar. O contorno arredondado envolve imagem e texto e é redesenhado a cada entrada no card, inclusive ao voltar ou avançar novamente. Movimento reduzido mostra o resultado estático. A altura estável preserva os controles. O percurso desktop permanece separado.


### Entradas por bloco nos responsivos

Em larguras abaixo de `90em`, os cards de Processos e os blocos de Cases
iniciam a entrada individualmente em `top 85%`. Assim, o conteúdo empilhado
não termina de animar fora da tela enquanto o primeiro bloco aparece.
Processos conserva as entradas laterais e atualiza as conexões durante o
movimento; Cases conserva o fade com deslocamento vertical. O desktop mantém
sua sequência original. As variantes são recriadas ao mudar o breakpoint e
respeitam `prefers-reduced-motion`.


### Scroll em telas intermediárias

Serviços e Cases mantêm as jornadas fixadas a partir de `60em` (960 px),
com altura mínima de `48em` (768 px), hover e ponteiro fino. Em Cases,
essas condições selecionam a entrada conjunta do painel. Telas menores,
janelas baixas e dispositivos de toque conservam navegação manual e
entradas por bloco. Movimento reduzido continua desabilitando a fixação.

O traçado em zigue-zague e os robôs de Serviços também usam o limite de
`60em` com mouse. O percurso é calculado pelas dimensões reais dos cards;
o rail reserva espaço acima e abaixo para não cortar a linha e os robôs.
Abaixo desse limite ou no toque, permanece o contorno individual do card ativo.
