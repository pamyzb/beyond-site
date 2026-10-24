# Validação da refatoração da V1

> Registro da primeira etapa. A revisão posterior de CSS, fontes e assets está
> em [CSS e performance](css-performance.md), com as medições atuais.
> A pasta `prototype/` e a Root Directory descritas neste registro foram
> posteriormente substituídas pela raiz: [migração](root-migration.md).

Data: 24/10/2026. Escopo: `prototype/`. Complementa a revisão histórica em
[`structure-review.md`](../structure-review.md).

## Implementação

- Componentes separados em `ui`, `layout`, `sections` e `motion`.
- Seções explícitas substituem os componentes genéricos com ramificações por ID.
- Hooks locais para Serviços, Depoimentos e personagem do rodapé; geometria pura separada.
- Navegação e destinos centralizados; modelos tipados de Cases e Serviços sem dependência da posição dos blocos exportados.
- Helpers de SVG separados do conteúdo da página; imagens embutidas dos derivados inline extraídas por hash.
- CSS distribuído por domínio, mantendo conteúdo e sequência exatos da cascata.
- Estudos, código sem uso e PNGs originais preservados em `design/`, fora da publicação.
- Three.js e tipos removidos; a implementação ativa continua usando `HeroGlass` e GSAP.
- Prettier e comandos de formatação adicionados para TypeScript/TSX e scripts.
- Build limpa somente a saída estática gerada, após verificar o caminho, evitando arquivos antigos em `out/`.

## Medições

| Medida | Antes | Depois |
| --- | ---: | ---: |
| HTML da home | 13.696.823 bytes | 5.636.859 bytes |
| HTML comprimido com gzip | 8.319.954 bytes | 2.282.543 bytes |
| Imagens base64 no HTML | 22 ocorrências / 10 imagens únicas | 0 |
| Arquivos raster compartilhados gerados | 0 | 10 / 3.016.388 bytes |
| Arquivos em `public/` | 180 | 181 |
| Tamanho de `public/` | 106.958.550 bytes | 69.026.186 bytes |

A queda de aproximadamente 59% no HTML e 73% no gzip não representa uma
medição de velocidade de rede ou Lighthouse. Os dez arquivos de imagem passam
a ser carregados separadamente. SVGs originais usados por `<img>` continuam
autocontidos; os bytes das imagens extraídas são idênticos aos originais.

## Verificações

- `pnpm install --frozen-lockfile`: lockfile consistente.
- `pnpm test`: seis testes passando, cobrindo bytes/IDs SVG, estabilidade após reordenação dos blocos, conteúdo obrigatório e colisões do personagem.
- `pnpm typecheck` e checagem adicional de locais/parâmetros sem uso: sem diagnósticos.
- `pnpm build`: `/`, `/design-system` e página de erro exportadas estaticamente.
- `pnpm format:check` e `git diff --check`: sem falhas.
- `pnpm audit`: nenhuma vulnerabilidade conhecida reportada.
- Comparação de estilos calculados e dimensões em 320, 390, 768, 1024, 1440 e 1920 px: nenhuma diferença nos elementos medidos em relação à referência anterior. Foram comparados títulos, parágrafos, seções, cartões, formulário, navegação e rodapé.
- Concatenação dos 30 blocos CSS extraídos: 137.326 bytes, SHA-256 `63ad057f363082983432dc93be1b99b096d89e10a245b196c09ad96f58b6d85d`, idêntica ao trecho original.
- Menu móvel abre e fecha por Escape; carrossel de Serviços desloca e habilita retorno; abas de Cases respondem a clique e End.
- FAQ atualiza `aria-expanded`; blog expande de quatro para oito cartões; Depoimentos avança para a prévia de vídeo.
- Formulário vazio marca cinco campos e leva foco ao nome; nenhum envio externo realizado.
- `/` e `/design-system/`: HTTP 200; acesso direto e recarga do design system funcionando. URL inexistente: 404.
- Proposta arquivada e PNG original do Pasteur: 404 na prévia estática; dez imagens geradas servidas com os mesmos bytes dos arquivos locais.
- 215 referências locais nos três HTMLs exportados verificadas, sem arquivos ausentes. Vídeo respondeu 206 com os 1.024 bytes solicitados.
- Em 390 e 1440 px, documento sem overflow horizontal; dois painéis de scroll fixados no desktop, como na referência.
- Console sem erros ou avisos nas interações verificadas; nenhuma imagem `<img>` carregada com falha identificada.

## Limites

A validação visual usa Chromium no ambiente local, sem aparelhos físicos ou
Safari. Movimento reduzido foi revisado no código, sem alterar a preferência
do sistema operacional. Seletores CSS repetidos foram preservados para manter
a cascata e devem ser consolidados gradualmente com comparação visual.

Os conteúdos demonstrativos e o formulário simulado continuam como antes.
Não foi executado deploy na Vercel. A configuração permanece Root Directory
`prototype`, `pnpm build` e diretório de saída `out`.
