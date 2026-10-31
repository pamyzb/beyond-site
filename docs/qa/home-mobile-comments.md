# Home V1 — revisão dos comentários mobile

30/10/2026. Ajustes limitados ao layout responsivo. As pinceladas automáticas
continuam ativas. A revisão da usuária autoriza as composições e remoções
abaixo, substituindo as decisões anteriores de escopo quando houver conflito.

| Comentário | Ajuste |
| --- | --- |
| 1 | Top 3 e Softdex restaurados no terceiro indicador. “Ver matérias” fica em Destaque na mídia, no celular. |
| 2–4 | Símbolo dos títulos gira 90°; distância nome/título de 16px e título/subtítulo de 24px, na home responsiva. |
| 5 | Serviços aceitam arraste com mouse em janela estreita, swipe nativo, teclado e links. Espaço entre cards de 24px. |
| 6 | A troca de tema acontece quando o título dos 45 minutos chega a 35% da altura da tela, em ambos os sentidos. Desktop conserva seu ponto anterior. |
| 7 | Fotos inferiores ficam mais afastadas do botão, com espaço adicional no fluxo da seção. |
| 8 | Computadores mantêm QR mesmo em janela estreita; Android, iPhone e iPad recebem o botão primário para a loja correspondente. |
| 9 | Liquid glass habilitado também em mobile/tablet. Movimento reduzido, vídeo e falha de GPU continuam com fallback legível. |
| 10 | Marca de fundo usa os limites completos do vetor no layout compacto; textura GPU acompanha o mesmo desenho. |
| 11–12 | Nome usa o mesmo tamanho no vídeo e no texto. Depoimento em 24px e entrelinhas 1,4 no celular. |
| 13 | Duas colunas entre 480 e 959px, com terceiro card ocupando a largura; uma coluna compacta abaixo de 480px. Conteúdo preservado. |
| 14–15 | Fotos de FAQ e contato ocultas abaixo de 960px. Acordeão, formulário e canais de contato preservados. |
| 16 | Vetor superior direito do rodapé acompanha a altura do esquerdo no responsivo. |
| 17–19 | Telefone/e-mail e os dois selos ocultos no rodapé da home abaixo de 960px. Redes, navegação e visita presencial continuam disponíveis. |

## Verificação

- `pnpm check`: aprovado, incluindo 40 testes unitários, tipos, CSS e formatação.
- `pnpm build`: aprovado.
- Primeira suíte dos comentários e vidro: 23 aprovados, 4 ignorados conforme
  escopo/suporte, sem falhas, em Chromium desktop/mobile e WebKit mobile.
- Capturas por seção em `artifacts/home-mobile/comments/`.
- Matriz visual final em Chromium 360/390/510/522/768/1440px e WebKit
  390/522px: nenhum overflow horizontal do documento. Cards em duas colunas
  conferidos em 510/522/768px; em 360/390px ficam em uma coluna. Bordas
  inferiores dos dois vetores superiores do rodapé coincidem no responsivo;
  a diferença desktop foi preservada. Medidas em `comments/measurements.json`.
- Regressão integrada no build final: 54 aprovados, 6 ignorados por escopo,
  nenhuma falha (Chromium desktop/mobile e WebKit mobile). Inclui a suíte da
  home, os comentários, o layout compacto dos depoimentos e o ensaio de
  continuidade/cache/nitidez do vidro. Relatório em
  `artifacts/home-mobile/reports/comments-final/`.

Os ensaios de dispositivos usam identidade de navegador e toque emulados.
Não houve validação em Safari/iPhone físico, publicação ou commit.
