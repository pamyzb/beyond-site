# Revisão dos cards de Processos

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
