# Home mobile — segunda revisão de comentários

30/10/2026. Ajustes adicionais apenas no responsivo, mantendo desktop e
pinceladas automáticas. Os comentários desta revisão substituem as decisões
anteriores sobre logos de mídia e material dos depoimentos.

| Comentário | Resultado |
| --- | --- |
| 1–2 | Logos de Estadão, PEGN e Valor restaurados no Destaque na mídia em uma linha própria, sem encolher ao lado da ação. “Ver matérias” usa ButtonLink primário azul, com o ícone padrão. |
| 3 | Título dos 45 minutos com entrelinhas 1,2 no mobile. |
| 4 | Títulos internos do app reduzidos para respeitar a hierarquia do título da seção. |
| 5 | Fundo e poster nítidos no mobile. Refração entra pelas bordas durante swipe/navegação e recua ao repousar; centro de leitura preservado. Desktop mantém o shader anterior. |
| 6 | Marcador do processo na camada inferior aos cards; o percurso não foi modificado. |
| 7–9 | Gap de 8px entre ícone, título e texto dos três cards finais; margens cumulativas removidas. |
| 10 | Distância de 40px entre cabeçalho do blog e o primeiro conteúdo no mobile. |

Movimento reduzido, falha de GPU e reprodução de vídeo continuam usando o
fallback HTML legível. QR em computador, download em celulares/tablets e
demais ajustes já aprovados permanecem.

## Verificação

- Build e `pnpm check` executados.
- Ensaios de transição glass, nitidez em repouso, cache, fallback e navegação
  em Chromium desktop/mobile e WebKit mobile.
- Medidas e capturas em `artifacts/home-mobile/revision-2/`.
- Rodada final direcionada: 7 testes passaram e 2 casos exclusivos de mobile
  foram ignorados no projeto desktop, conforme esperado.
- Medidas verificadas em Chromium a 390, 547 e 1440px e WebKit a 547px:
  sem overflow; gaps de 8px e 40px confirmados no mobile. Botão de mídia
  revisado visualmente após alinhar texto e ícone na mesma linha.
