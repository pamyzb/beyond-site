# Tipografia da V1

Esta é a referência de tipografia da implementação atual. Os valores estão
definidos em `src/styles/tokens.css`; as regras de componentes devem usar esses tokens
quando houver um equivalente.

`src/styles/fonts.css` referencia WOFF2 gerados automaticamente de sete TTFs
locais antes de `dev` e `build`. Os originais e sua licença permanecem em
`public/assets/fonts/`. Os testes verificam métricas, mapas de caracteres e
limites dos glifos após compressão/descompressão. SVGs inline compartilham
essas fontes quando seus dados embutidos são idênticos.

## Família e pesos

| Papel | Token | Valor |
| --- | --- | --- |
| Interface e conteúdo | `--font-sans` | Poppins, sans-serif |
| Texto leve | `--weight-light` | 300 |
| Texto regular | `--weight-regular` | 400 |
| Texto médio | `--weight-medium` | 500 |
| Texto em destaque | `--weight-semibold` | 600 |
| Texto forte | `--weight-bold` | 700 |

O uso de Georgia e monospace é localizado, respectivamente, na aspas
decorativa de case e nos colchetes de navegação; não fazem parte da família
tipográfica de conteúdo.

## Escala de tamanho

| Grupo | Tokens |
| --- | --- |
| Microinterface | `--text-xxs` (9), `--text-xs` (10), `--text-micro` (11), `--text-caption` (12) |
| Texto | `--text-small` (14), `--text-body-sm` (15), `--text-body` (16), `--text-body-lg` (18) |
| Títulos | `--text-title-sm` (20), `--text-title-xs` (21), `--text-title-2xs` (22), `--text-card` (24), `--text-card-lg` (26), `--text-title` (28), `--text-title-lg` (32), `--text-subheading` (44) |
| Destaque | `--text-display-sm` (56), `--text-display-md` (64), `--text-heading` (72), `--text-display-lg` (96), `--text-display-xl` (112), `--text-display` (152), `--text-hero` (188) |

Os números da tabela representam a referência Figma de 16 px. Os tokens são
armazenados em `rem` (16 → 1rem, 24 → 1.5rem, 72 → 4.5rem), respeitando a
preferência de fonte do navegador. A raiz usa 100%, sem fixar 16px ou 62.5%.
Tamanhos em `clamp()` usam limites em `rem` e um termo fluido de viewport.

Palavras longas em títulos podem quebrar quando o leitor amplia o texto.
Uma consulta de container em `rem` libera a quebra das linhas do hero quando
o espaço relativo à tipografia fica estreito, preservando a composição padrão.

## Espaçamento e altura de linha

Os tokens `--tracking-*` documentam os valores de tracking da composição:
zero, compacto, títulos, rótulos e caixa alta. Os tokens `--leading-*`
documentam as alturas proporcionais e as alturas fixas de controles, FAQ,
QR Code, campos e mensagens de erro.

Valores proporcionais a um elemento (por exemplo `.28em` em um sufixo de
métrica) continuam locais porque dependem diretamente do tamanho do elemento
pai. Eles são exceções intencionais, não uma nova escala tipográfica.

## Títulos reutilizáveis

`src/components/ui/title.tsx` é a primitive semântica de todos os títulos.
As variantes atuais são `section`, `service`, `case`, `case-demo`,
`blog-card`, `faq`, `metrics-label`, `metric-stat`, `success`, `hero`,
`app-feature`, `client-heading`, `tooltip` e `figma`. Cada variante usa a
escala e os pesos desta página, preservando os elementos HTML corretos
(`h1` a `h6`).

`TextBlock` continua responsável pela geometria dos títulos derivados do
Figma, mas delega a semântica de título para `Title` e aplica os mesmos tokens
a seus `TextRun`.

`SecondarySectionHeading` compõe `Title` para declarações editoriais de
segunda hierarquia. Recebe um título semântico configurável, aceita destaque
via `<em>` e posiciona o subtítulo opcional à direita, após `--space-8`.
