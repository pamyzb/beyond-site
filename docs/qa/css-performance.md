# CSS e performance da V1

> Medições desta etapa. A limpeza posterior dos cards de Processos está em
> [revisão dos cards](process-cards.md), incluindo a nova redução do HTML.

Data: 24/10/2026. Implementação V1, atualmente na raiz, preservando a exportação
estática e a configuração da Vercel.

## Resultado medido

| Recurso | Antes desta etapa | Depois |
| --- | ---: | ---: |
| HTML da home | 5.636.859 bytes | 765.739 bytes |
| HTML com gzip local | 2.282.543 bytes | 110.726 bytes |
| Fundo SVG do hero | 4.141.742 bytes | 866 bytes |
| Sete fontes da interface | 1.138.540 bytes (TTF) | 366.616 bytes (WOFF2) |
| CSS compilado, somando três chunks do export | 158.141 bytes | 154.606 bytes |
| Esses chunks CSS com gzip local | 31.497 bytes | 30.740 bytes |

O HTML caiu aproximadamente 86%; seu gzip, 95%; as fontes, 68%. Essas são
medições de arquivos, não pontuações Lighthouse ou medições de LCP/CLS em
rede real. Os TTFs e SVGs de origem continuam preservados, mas a interface
passou a solicitar as versões otimizadas.

## Alterações

- Doze fontes embutidas em quatro SVGs do aplicativo eram idênticas às fontes locais. Os derivados inline agora compartilham as fontes do documento. Regras com outros bytes, descritores ou subconjuntos são preservadas.
- Sete WOFF2 são gerados durante `predev`/`prebuild`; preload e CSS usam essas versões. A conversão utiliza WebAssembly apenas no build.
- O SVG de fundo do hero continha doze definições sem referências, incluindo fotografias antigas. O derivado preserva os elementos visíveis e elimina esse conteúdo não utilizado.
- Consolidação manual de propriedades sobrescritas em Cases e Serviços; 46 declarações idênticas removidas em oito arquivos pelo verificador da cascata.
- Estilos sem uso do badge antigo preservados em `design/experiments/glass-badge.css`; regras de Three.js, controles antigos e outros trechos sem uso retirados da folha ativa.
- CSS formatado e incluído nos comandos de formatação. `css:check` previne novas repetições idênticas no contexto verificado, preservando fallbacks diferentes.
- Dimensões da lente, deslocamentos da interface e interações revisados para `rem`. Bordas finas, contornos, áreas de leitores de tela e coordenadas locais de SVG/canvas mantêm pixels quando apropriado.
- Quebras de títulos e reserva do efeito de digitação ajustadas para fonte ampliada, sem mudar o layout padrão medido.
- Assets novos são gravados atomicamente; arquivos com os mesmos bytes não são regravados enquanto a prévia de desenvolvimento está aberta.

## Correção do corte no fundo

A validação do usuário identificou uma borda vertical à direita. O hero já
ocupava a largura inteira, mas fundo e máscara ainda herdavam o deslocamento
do antigo canvas de 1440 px. Em 1920 px de viewport, eles começavam em
-232,5 px e terminavam em 1672,5 px, com 1905 px úteis disponíveis.

O hero agora define `--bleed-offset: 0px` e `--bleed-width: 100%`. A imagem,
a máscara e a seção se alinham de 0 a 1905 px. Em 1440 px, alinham-se de 0 a
1425 px. Na revisão seguinte, as composições menores receberam uma animação
automática: veja [`hero-motion-performance.md`](./hero-motion-performance.md).

## Validação

- Build estático, testes, tipos, formatação e checagem da cascata.
- Treze testes cobrindo imagens, dependências SVG, fontes compartilhadas, compressão WOFF2, conteúdo e geometria.
- Lockfile pnpm consistente; audit sem vulnerabilidades conhecidas reportadas.
- Comparação dos estilos e dimensões de títulos, parágrafos, seções, cartões, formulário e rodapé em 320, 390, 768, 1024, 1440 e 1920 px: nenhuma diferença no layout padrão medido.
- Comparação das métricas dos textos SVG dos mockups após trocar as fontes: nenhuma diferença nas seis larguras.
- Fixture estática temporária com raiz a 125% (20 px), nas mesmas seis larguras: sem overflow horizontal do documento ou cortes internos nos títulos/parágrafos medidos. A fixture foi removida da saída final; não alterou preferências do sistema.
- Conferência explícita dos limites do fundo e máscara após a correção reportada pelo usuário.
- Na prévia em desenvolvimento e no export estático a 1920 px, fundo, máscara e hero se alinham de 0 a 1905 px; nenhuma imagem quebrada identificada.
- Smoke tests de menu/Escape, carrossel de Serviços, abas de Cases, FAQ, expansão do blog, Depoimentos e validação do formulário passaram; console sem avisos ou erros na prévia estática.
- 241 referências locais em HTML/CSS verificadas, sem arquivos ausentes. Home e design system retornam 200; URL inexistente e fixture removida retornam 404. Fontes e SVG gerados retornam os MIME types corretos.
- Gravação atômica e preservação do arquivo sem regravação quando seus bytes são idênticos verificadas.

Testes em Chromium local. Não substituem Safari/aparelhos físicos, auditoria
Lighthouse com rede simulada ou Core Web Vitals coletados após publicação.
Não foi executado deploy nem foram modificados os conteúdos demonstrativos
ou o formulário simulado.
