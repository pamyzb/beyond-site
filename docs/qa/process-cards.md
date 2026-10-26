# Revisão dos cards de Processos

Ajuste de 26/10/2026: o grid centraliza as duas colunas horizontalmente e
mantém um intervalo de 9rem (144px na base de 16px), inclusive no layout
intermediário. Abaixo de 60em, os cards continuam em uma única coluna.
As conexões 1 → 2 → 3 → 4 usam pontos nas bordas transformadas das faces SVG,
com recálculo no redimensionamento dos cards e no refresh das animações.

Data: 24/10/2026. Escopo: V1, atualmente na raiz do repositório.

Os quatro cards exibiam título, descrição e número uma vez. A faixa cinza
atrás deles pertence à sombra original do SVG e foi preservada.

Foram encontradas e removidas duplicações de implementação:

- Um segundo SVG por card, preparado para mobile, mas nunca exibido: em desktop ele ficava oculto e, em telas menores, os dois artworks eram ocultados em favor do card HTML/CSS.
- Cópias de todas as definições do SVG de Processos dentro de cada card. O preparo agora conserva apenas filtros, máscaras e recortes referenciados pelo próprio fragmento.
- A cópia transparente da face original, substituída pela superfície que adapta sua altura ao conteúdo.
- O SVG completo de trilha sem consumidor e a cópia do marcador dentro do mapa de cards, embora ele já fosse fornecido separadamente.
- Declarações antigas de display, posição, largura e altura sobrescritas pelo layout final dos cards.

| Medida | Antes | Depois |
| --- | ---: | ---: |
| Cards de Processos | 4 | 4 |
| Elementos SVG na seção | 14 | 10 |
| Ocorrências excedentes de IDs SVG na seção | 88 | 0 |
| Superfícies visíveis dos cards | 4 | 4 |
| HTML da home | 765.739 bytes | 533.071 bytes |

`prepare-artwork.mjs` gera `.generated/process-fragments.json` antes de
`dev`/`build`. O módulo `lib/server/process-artwork.ts` monta as quatro
superfícies e o marcador a partir desses fragmentos. Os IDs recebem namespace
próprio e as definições usadas pelas animações são preservadas.

Validação: 15 testes, tipos, build estático, formatação, `css:check` e
`git diff --check`. Os testes novos verificam superfícies únicas, IDs sem
duplicação, referências SVG resolvidas e ausência de definições de outros
cards. A comparação de dimensões e estilos em 320, 390, 768, 1024, 1440 e
1920 px não mostrou diferenças na geometria dos cards.

## Cards preservados em todas as larguras — 26/10/2026

Os breakpoints compactos agora reutilizam a superfície SVG, os ícones, a
inclinação, a sombra e os marcadores originais do desktop. Cada card mantém
seu sistema de coordenadas de 530px, com escala CSS calculada pela largura
da coluna. A altura continua acompanhando o conteúdo; títulos e descrições
compensam a redução de escala para manter pelo menos 24px e 14px visuais,
respectivamente, na configuração padrão de fontes.

Abaixo de 60em, a sequência 01–04 fica em uma coluna centralizada, limitada
à largura original. As conexões externas continuam ocultas abaixo de 90em.
O layout a partir de 90em não foi alterado.

Validação desta alteração: capturas no Chrome em 320, 390, 768, 1024,
1328 e 1440px, com movimento reduzido. Arte visível nos quatro cards e
larguras dentro da viewport em todos esses tamanhos. Formatação e análise
da cascata CSS conferidas. Safari/iPhone não foi validado nesta alteração.

### Trajeto e marcador responsivos

O trajeto usa as bordas laterais nas duas colunas e liga a base de cada
card ao topo do seguinte na coluna �nica, com curvas alternadas que evitam
a numera��o. As �ncoras s�o medidas na superf�cie SVG transformada, incluindo
a escala dos cards. O marcador mant�m o movimento por rolagem e adapta sua
escala; o rec�lculo existente acompanha mudan�as de tamanho. Movimento
reduzido conserva o trajeto e mant�m o marcador oculto, como no desktop.

Valida��o: Chrome em 320, 390, 1024 e 1440px, com marcador vis�vel e mudan�a
de posi��o ap�s rolagem nas quatro larguras, sem erros de p�gina. TypeScript
e an�lise de cascata CSS aprovados.
