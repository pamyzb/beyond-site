# Linha de base — geometria desktop da V1

Data da captura: 2026-10-22  
Viewport de validação: 1440 × 900 px

## Resultado estrutural atual

- Área útil do documento: 1425 px, após a barra vertical do navegador.
- `documentElement.scrollWidth`: 1425 px.
- Não há overflow horizontal em desktop.
- Nenhum `.section-content` ou `.text-block` computa `position: absolute`.
- A largura de conteúdo recorrente é 1305 px, correspondente a gutters visuais de 60 px na área útil de 1425 px.

## Geometria observada

| Região | Altura observada | Container de conteúdo | Classificação para a iniciativa |
| --- | ---: | --- | --- |
| Hero | 967 px | 1305 px | Candidata: padding superior e distribuição vertical da Grid. |
| Conversa | 986 px | 1305 px | Candidata: padding de posicionamento do grupo semântico. |
| Aplicativo | 1580 px | 1305 px | Candidata prioritária: linhas fixas da Grid e chamada de QR. |
| Depoimentos | 1072 px | 1305 px | Revisar apenas wrappers de altura; carrossel e mídia são locais. |
| Processo | 1148 px | 1305 px | Candidata prioritária: linhas, colunas e deslocamentos locais da Grid. |
| Sobre | 749 px | 1305 px | Candidata: altura do wrapper; painel interno já está em Grid. |
| FAQ | 1036 px | 1305 px | Candidata: transformar altura de seção em `min-height`; acordeão fica em fluxo. |
| Contato | 975 px | 1305 px | Candidata: transformar altura de seção em `min-height`; formulário fica em Grid. |
| Cases | 3369 px | componente próprio | Revisar limites do painel, sem alterar tabs, ordem ou colunas. |
| Blog | 2061 px | componente próprio | Revisar apenas limites das linhas bento, se ainda necessários. |
| Rodapé | 882 px | componente próprio | Revisar wrappers; SVG e runner são decorativos. |

As duplicações transitórias observadas pelo inspetor no Hero pertencem à cópia mascarada usada no efeito de tinta. Elas não fazem parte do fluxo semântico e ficam fora da medição das seções reais.

## Classificação das medidas restantes

### Limites legítimos de conteúdo

- Largura de leitura de cabeçalhos, descrições, FAQ e formulário.
- Largura e proporção de cards, imagens, vídeo e QR quando pertencem ao asset ou à área interativa.
- `max-width: 1440px` do frame do cabeçalho, que define a referência visual central sem impor largura mínima à página.

### Geometria rígida a substituir gradualmente

- `height: var(--section-height)` aplicado à casca das seções.
- Padding de composição do Hero e de Conversa.
- Linhas explícitas da Grid do Aplicativo e sua separação adicional de 90 px.
- Colunas de 530 px, linhas de 353 px e margens verticais dos cards de Processo.
- Alturas usadas apenas para acomodar conteúdo em Sobre, FAQ e Contato.
- Limites rígidos de painéis em Serviços, Cases e Blog, quando não descrevem o tamanho de um asset.

### Exceções que devem permanecer locais e absolutas

- SVGs de fundo, traços, máscaras, vídeo, WebGL, cópia mascarada do Hero e runner do rodapé.
- Imagens e gradientes que cobrem uma célula de card.
- Marcadores de trilha, ícones sobrepostos e alvos visuais de botões, desde que não organizem conteúdo semântico.

## Ordem confirmada

As próximas etapas devem começar pelo Hero, Aplicativo e Processo. São as regiões em que a geometria de fluxo ainda está mais próxima da composição fixa do frame; as demais dependem menos desses valores e têm risco menor.
