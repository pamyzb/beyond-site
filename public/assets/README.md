# Assets do site

Os arquivos são organizados pela seção ou função, mantendo seus nomes originais.

| Pasta | Conteúdo |
| --- | --- |
| `inicio/` | Hero, retratos, lettering, máscaras e vídeos |
| `clientes/` | Logos e fotos dos clientes, compartilhados entre seções |
| `servicos/` | Imagens dos serviços e agentes |
| `cases/` | Telas e imagens dos cases |
| `conversa/` | Fotos e composição da seção de conversa |
| `aplicativo/` | Telas do app, celulares e QR code |
| `metricas/` | Grafismos, padrões e logos de imprensa |
| `depoimentos/` | Fotos e artes dos depoimentos |
| `processos/` | Arte dos cards de processos |
| `sobre/` | Ilustrações da seção Sobre |
| `blog/` | Imagens, fundos e tags do blog |
| `faq/` | Foto da equipe e arte do FAQ |
| `contato/` | Foto e composição de Contato |
| `rodape/` | Arte e ícones do rodapé |
| `compartilhados/` | Marca, cabeçalho e ícones reutilizados |
| `fonts/` | Fontes locais |
| `generated/` | Arquivos automáticos; não editar manualmente |

## Atualizar a foto de Contato

`contato/contato-bleed.svg` é a fonte única da foto para desktop e mobile.
O arquivo contém somente a composição da foto, com seu recorte completo.
Preserve o grupo `id="contact-image"`, usado na animação de entrada.
`contato.svg`, `contact-full.svg` e `contact-team.svg` são exports anteriores,
mantidos como referência; não controlam a foto exibida atualmente.

Os SVGs que passam pelo preparo são listados em `src/data/artwork-files.json`.
Após editá-los, execute `node scripts/figma/prepare-artwork.mjs` ou reinicie
`pnpm dev`. O build também executa esse preparo.

## Adicionar ou mover arquivos

As quatro fotos de Conversa usam os arquivos `conversa/conversation-photo-*.svg`
no desktop e no mobile. O preparo substitui as fotos da composição desktop,
preservando os grupos e posições das animações. Após atualizar esses SVGs,
execute o preparo dos assets e recarregue a página.

Use a pasta da seção; elementos reutilizados devem ter uma única fonte.
`src/data/asset-paths.json` mapeia os nomes dos exports para seus caminhos:
o componente ReflowArtwork e os exportadores Python usam esse mesmo catálogo.
Ao mover um arquivo, atualize o catálogo e suas referências diretas em TSX,
CSS, dados e scripts. Os exportadores continuam em `scripts/figma/`, pois
Figma é a origem dos arquivos, não sua categoria no site.
