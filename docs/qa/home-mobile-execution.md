# Home V1 — execução mobile

30/10/2026. Implementação na raiz, preservando as alterações locais. Escopo:
`docs/superpowers/plans/2026-10-30-home-mobile.md`, com desktop como referência
e sem as propostas visuais abertas rejeitadas pela usuária. Sem commits ou publicação.

| Etapa | Implementação e conferência |
| --- | --- |
| Referências | Baseline em Chromium/WebKit, 390 × 844 e 1440 × 1000; menu, empresas, serviços, cases e processo. Referência do menu recebida nesta conversa. |
| Menu | Botão simples; símbolo Beyond cinza nos itens; ações abaixo. Escape funciona também quando o toque no WebKit não transfere foco ao botão. Inert, navegação e clique externo preservados. Novos estilos restritos à home. |
| Hero | Três linhas mobile, apoio fluido e seta junto ao texto. Pinceladas automáticas preservadas; lente visual oculta abaixo de 600px, com controlador compartilhado ativo. Desktop preservado. |
| Empresas | Segundo toque fecha; outra empresa troca o conteúdo; hover/foco separados do toque. Faixa atual preservada, com itens menores para expor mais marcas. Inclinação discreta dos cards por scroll, sem estado React por frame. |
| Mídia | Espaço da Softdex recebe “Ver matérias” no mobile, apontando ao blog. Desktop e BlogCard não foram alterados nesta execução. Paleta existente preservada. |
| Serviços | Cards menores expõem o seguinte; setas ocultas somente no celular. Indicadores, teclado e swipe nativo usam as mesmas posições alcançáveis; último card acessível. |
| 45 minutos | Fotos maiores no celular, com recortes e margens preservados; oscilação compacta ampliada moderadamente e desativada em movimento reduzido. |
| Cases | Três janelas em fluxo normal, ordem atual, barra com três pontos e nome único, CTA após informações e depoimento. Expansão/redução sem pin ou captura de eventos. Movimento reduzido e desktop mantêm abas e controles. |
| App Beyond | Disparo mobile antecipado de `top 35%` para `top bottom` no título da conversa; desktop conserva o disparo anterior. Títulos/parágrafos maiores e fluidos; QR e ações preservados. |
| Depoimentos | Cards menores com laterais visíveis; fundo proporcional; frase e identificação completas. Reprodução automática e controles mantidos. |
| Processo | Rota contínua do marcador mobile passa pelos centros reais dos badges, inclusive o 3. Cache de comprimento/escala; sem leitura de layout no update de cada frame. |
| Cards finais | Uma coluna compacta, preservando ordem e conteúdo. Sem a composição 2 + 1 proposta e não aprovada. |
| FAQ | Foto menor antes das perguntas e próxima ao título; acordeão preservado. Não foi reproduzida sobra lateral do documento; nenhum overflow global foi adicionado para escondê-la. |
| Footer | Chamada em três linhas e espaços menores, somente na home. Botões, telefone/e-mail, navegação e canais de contato mantidos. |

## Evidências

- Capturas iniciais: `artifacts/home-mobile/before/`.
- Comparativos por seção: `artifacts/home-mobile/after/`.
- Matriz final de produção: `artifacts/home-mobile/final/`.
- Diagnóstico: `docs/qa/home-mobile-baseline.md`.
- Cases: `artifacts/home-mobile/cases-review.md`.
- Processo: `artifacts/home-mobile/process-review.md`.
- Revisão de código: `artifacts/home-mobile/final-code-review.md`.
- Matriz visual: `artifacts/home-mobile/final-visual-review.md`.

No processo, os saltos medidos de 213–215px foram substituídos por variações
inferiores a 0,8px por amostra; alinhamento ao número 3 com erro aproximado de
0,21px na emulação. O comprimento e a escala são recalculados em mudanças
relevantes de geometria, entrada, fontes e resize.

A matriz visual cobriu Chromium em 360, 390, 430, 768 e 1440px e WebKit em
390px e 844px horizontal, sem overflow do documento ou erros JavaScript.
Abertura direta em `/#aplicativo`, retorno ao topo e movimento reduzido foram
conferidos nos dois motores. O indicador do menu mede transição de 0s nesse modo.

O ciclo dos logos tinha um salto de 195px no WebKit: a largura intrínseca do
track diferia da distância entre repetições. A animação agora mede o primeiro
item e seu clone e atualiza a distância no resize, nas fontes e nas imagens,
sem medição por frame. Após a correção, a fronteira do ciclo variou menos de
0,06px em Chromium e WebKit, inclusive após mudanças de largura.

## Decisões preservadas e limites

A referência de cor da mídia e a gravação completa não estavam disponíveis.
Não foi criada outra paleta, nem removido conteúdo ambíguo dos cases. A seta
grande inferior citada não estava visível na implementação mobile inicial;
o indicador de rolagem existente foi preservado. Não foram adotadas duas
linhas de empresas, cards em 2 + 1 ou ocultação dos botões finais.

WebKit automatizado e emulação de toque não equivalem a iPhone/Safari físico,
barra dinâmica, VoiceOver ou medição de fluidez em aparelho real.

Durante a execução surgiram alterações concorrentes nas artes dos telefones
(`CORRETO1`, `CORRETO2` e `replace-app-screens.mjs`), preservadas. Os testes de
conteúdo visível passaram a aceitar paths/imagens além de texto SVG, mantendo
a comparação completa da aparência. A expectativa antiga de cinco serviços
foi atualizada para os três já presentes no início desta sessão.

## Verificações

Correção após revisão da usuária: as pinceladas automáticas haviam sido
removidas junto com a lente mobile. Foram restauradas; o controlador compartilhado
permanece montado e só a lente fica visualmente oculta. Verificação dirigida
em Chromium mobile, WebKit mobile e Chromium desktop: 3 aprovados, incluindo
mudança automática do traçado, pausa fora da tela e movimento reduzido.
`pnpm check` (40 testes) e `pnpm build` passaram novamente. Prévia 4194 atualizada.

- `pnpm check`: passou; 40 testes unitários, tipos, formatação e cascata CSS.
- `pnpm build`: passou; exportação estática gerada.
- Home (`site.spec.ts`), build final: 41 aprovados e 4 ignorados por escopo
  mobile, sem falhas, nos projetos mobile Chromium, mobile WebKit e desktop
  Chromium. Resultado em `artifacts/home-mobile/reports/site-final/`.
- Depoimentos (`testimonial-glass.spec.ts`), build final: 18 aprovados e 7
  ignorados conforme as condições da suíte (GPU desktop e suporte a perda de
  contexto), sem falhas nos cinco projetos. Resultado em
  `artifacts/home-mobile/reports/testimonial-final/`.

Comandos de navegador executados com `E2E_BASE_URL=http://127.0.0.1:4194`,
diretórios de saída e relatórios separados por suíte:

```powershell
pnpm exec playwright test tests/e2e/site.spec.ts --project=mobile-chromium --project=mobile-webkit --project=desktop-chromium --output=artifacts/home-mobile/test-results/site-final
pnpm exec playwright test tests/e2e/testimonial-glass.spec.ts --output=artifacts/home-mobile/test-results/testimonial-final
```

Rodadas preliminares em desenvolvimento foram descartadas como aceite final.
Uma rodada de duas suítes de navegador compartilhou o diretório padrão de
traces e gerou `ENOENT` na coleta; a validação final usa diretórios exclusivos.

Builds concorrentes também substituíam `out` durante as primeiras rodadas.
A validação final usa uma cópia estável do build em `http://127.0.0.1:4194`.
O teste de vidro dos depoimentos recebeu sincronização pela posição atual:
o salto de scroll anterior parava antes do carrossel após o recálculo das
seções fixadas, impedindo sua entrada e inicialização WebGL. O diagnóstico
confirmou o renderer funcionando ao alcançar a seção; não houve alteração
no código do vidro para contornar os testes.
