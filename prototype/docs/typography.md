# Tipografia da V1

Esta é a referência de tipografia da implementação atual. Os valores estão
definidos em `tokens.css`; as regras de componentes devem usar esses tokens
quando houver um equivalente.

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

Os valores são pixels. Tamanhos em `clamp()` são comportamentos fluidos de
componentes e compõem a escala acima, sem introduzir uma escala paralela.

## Espaçamento e altura de linha

Os tokens `--tracking-*` documentam os valores de tracking da composição:
zero, compacto, títulos, rótulos e caixa alta. Os tokens `--leading-*`
documentam as alturas proporcionais e as alturas fixas de controles, FAQ,
QR Code, campos e mensagens de erro.

Valores proporcionais a um elemento (por exemplo `.28em` em um sufixo de
métrica) continuam locais porque dependem diretamente do tamanho do elemento
pai. Eles são exceções intencionais, não uma nova escala tipográfica.

## Títulos reutilizáveis

`src/components/site/title.tsx` é a primitive semântica de todos os títulos.
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
