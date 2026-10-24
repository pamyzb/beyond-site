# Modos de cor da V1

Este documento descreve o comportamento atual de cor da V1 na
raiz do repositório. Ele é uma referência de manutenção: mudanças de responsividade
ou de componentes devem preservar os contratos abaixo antes de introduzir uma
nova regra de tema.

## Conceitos e fontes de verdade

| Camada | Mecanismo | Responsabilidade |
| --- | --- | --- |
| Tema base claro | `:root` em `src/styles/tokens.css` | Define os tokens semânticos iniciais. |
| Tema escuro local | `.theme-dark` em `src/styles/tokens.css` | Adapta uma seção que nasce escura, como o Blog. |
| Tema escuro por rolagem | `:root[data-scroll-theme="dark"]` | Mantém a experiência escura a partir do App. |
| Transição visual | `.theme-wash` em `src/styles/theme-wash.css` | Faz somente o efeito de passagem; não define cores de conteúdo. |

`src/styles/tokens.css` é a fonte de verdade de paleta e semântica. `src/styles/base.css` define a
transição global de rolagem. Os estilos em `components/sections/` e `styles/` contêm adaptações de componentes;
elas devem consumir tokens, em vez de introduzir cores de tema próprias.

## Tema base claro

Não há uma classe `.theme-light`. O estado claro é o contrato padrão de
`:root` e também é aplicado explicitamente por `data-scroll-theme="light"`
quando o usuário retorna acima do gatilho do App.

| Papel | Token | Valor atual |
| --- | --- | --- |
| Página | `--color-page` | branco |
| Superfície | `--color-surface` | cinza muito claro |
| Texto | `--color-text` | preto |
| Texto secundário | `--color-text-subtle` | cinza 600 |
| Ação e foco | `--color-action`, `--color-focus` | azul primário |
| Destaque | `--color-accent` | verde Beyond |
| Cabeçalho de seção | `--section-heading-*` | preto, azul e cinza 600 |

## Tema escuro local

Uma seção com `.theme-dark` altera somente os seus tokens herdáveis:

```css
--color-page: var(--color-black);
--color-text: var(--color-white);
--color-text-subtle: var(--color-gray-300);
--color-focus: var(--color-accent);
--section-heading-ink: var(--color-white);
--section-heading-accent: var(--color-accent);
--section-heading-muted: var(--color-gray-300);
```

O título reutilizável `SectionHeading` usa sempre
`--section-heading-accent` para texto destacado e para o ícone Beyond. Assim,
em uma seção escura o ícone e o destaque ficam verdes; no tema claro, azuis.

## Tema escuro por rolagem

`MotionRoot` controla o atributo no elemento `html`:

- O gatilho é o `h2` de `#aplicativo`.
- Ao entrar em `top 90%`, aplica `data-scroll-theme="dark"`.
- Ao retornar acima do gatilho, aplica `data-scroll-theme="light"`.
- O tema persiste nas seções posteriores até o usuário retornar.

Durante a transição, `--theme-dark-progress` anima de `0` a `1`. Os tokens
`--scroll-canvas`, `--scroll-ink` e `--scroll-muted` fazem a interpolação de
fundo e texto para componentes que acompanham a transição.

## Contrato por componente

| Área | Claro | Escuro local / por rolagem |
| --- | --- | --- |
| `SectionHeading` | título preto, destaque e ícone azuis | título branco, destaque e ícone verdes |
| Header | arte e texto claros sobre áreas claras | arte escura, texto claro e CTA verde sobre área escura |
| Botão de ação | fundo azul e texto branco | ações em fundo escuro usam o preenchimento verde e texto preto |
| Serviços, Cases e Métricas | usam tokens de página, superfície e texto | respondem a `data-scroll-theme` com superfícies e textos interpolados |
| App Beyond | arte clara visível | arte escura visível; a arte clara é ocultada |
| Blog | já nasce com `.theme-dark` | permanece no contrato escuro da seção |
| Logos e ilustrações monocromáticas | cores originais | filtros ou assets alternativos somente quando a regra existente exigir contraste |

## Exceções intencionais

- O App tem duas artes locais: `applicativo-bleed.svg` e
  `applicativo-light-bleed.svg`; a visibilidade é trocada por CSS.
- O Header tem logos claro e escuro separados e trata menu, CTA e seletor de
  idioma com regras específicas.
- O QR Code, efeitos de vidro, gradientes, sombras e cores internas de
  ilustrações não devem ser convertidos automaticamente em tokens de tema.
  Eles pertencem à arte aprovada.
- Alguns SVGs inline usam regras por `id` para preservar o desenho original
  durante a mudança de contraste.

## Regras de manutenção

1. Use tokens semânticos para fundo, texto, borda e destaque. Evite decidir
   uma cor diretamente dentro de um componente.
2. Para elementos de cabeçalho de seção, use
   `--section-heading-ink`, `--section-heading-accent` e
   `--section-heading-muted`; não use `--color-action` diretamente.
3. Uma variação visual que vale só dentro de uma seção deve usar o escopo da
   seção. Uma variação que acompanha a transição deve usar
   `data-scroll-theme`.
4. Não adicione `.theme-light` sem antes migrar o contrato padrão: hoje a
   ausência de `.theme-dark` é parte da implementação.
5. Ao criar ou alterar um componente, confira os dois estados no navegador:
   antes do App e depois do gatilho do App. Se ele existir em uma seção
   `.theme-dark`, confira também esse contexto.

## Arquivos relacionados

- `src/styles/tokens.css`: paleta e tokens semânticos.
- `src/styles/base.css`: progresso e transição global de rolagem.
- `src/app/globals.css`: adaptação de componentes para cada contexto.
- `src/components/motion/motion-root.tsx`: gatilho que escreve
  `data-scroll-theme`.
- `docs/animations.md`: detalhes de GSAP e ScrollTrigger.
