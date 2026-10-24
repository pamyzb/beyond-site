# Hero: fidelidade visual e desempenho

Revisão em 24/10/2026, implementação V1 atualmente na raiz do repositório.
Referência visual indicada pelo usuário:
[versão publicada](https://beyond-site-coral.vercel.app/).

## Elementos preservados

- Mesmo vídeo azul do fundo revelado, mesma camada escura (rgba(0,5,18,0.55)),
  mesma textura verde animada dentro das letras e mesma silhueta da lente.
- Desktop: rastro com raio de 145px, duração de 1800ms, limite de 90 pontos,
  interpolação de até 12 amostras e os mesmos coeficientes orgânicos do contorno.
- A curva vetorial aproxima o contorno original com 32 segmentos cúbicos.
  O teste compara os pontos médios com a fórmula original em sete idades e
  exige erro inferior a 0,15px. A atualização da máscara conserva o intervalo
  original de 32ms; a lente acompanha o mouse no ritmo do navegador.
- O alinhamento do fundo continua de 0 até a largura útil, sem a borda lateral.

A simplificação inicial para gradientes e um rastro de 16 pontos foi descartada
após o feedback visual. Gradientes agora servem somente como fundo de carregamento.

## Redução do trabalho

O custo principal vinha de gerar uma máscara PNG de tela inteira a cada quadro
com `canvas.toDataURL()`, aplicar filtros à cena inteira e copiar o vídeo em
resolução original continuamente. O tamanho dos pequenos SVGs da lente não
explica esse custo sozinho.

O rastro agora atualiza um clipPath SVG, sem serialização PNG. A máscara
complementar do cabeçalho também é vetorial. A refração usa uma janela de
392 × 426px para a lente de 360 × 394px, incluindo a margem do filtro. O mapa
de deslocamento usa 384 × 384px e cache por dimensão. O vídeo amostrado pela
lente tem lado maior limitado a 480px e até 24 atualizações por segundo;
o vídeo principal continua nativo e não é rebaixado. A amostragem só ocorre
quando a lente encontra as letras animadas.

Clones contêm somente o conteúdo necessário e são inertes. Em telas compactas
não existe cópia da cena para refração. Vídeos e loops param fora da área
visível ou com a aba oculta. Com movimento reduzido não são iniciados.

## Medição local

Build estático, Chromium local, viewport 1920 × 1000, janela de seis segundos.
Mesma sequência de posições do ponteiro:
350/180, 1550/180, 450/400, 1400/580, 650/650, 1650/300.
O tempo de cada chamada da automação varia; os números não representam FPS
nem substituem métricas coletadas em aparelhos reais.

| Medida durante a janela | Antes | Depois |
| --- | ---: | ---: |
| Serializações de canvas para PNG | 51 | 0 |
| Tempo dentro de toDataURL | 1100ms | 0ms |
| Cópias de quadros do vídeo para canvas | 97 | 141 |
| Pixels copiados nessas operações | 152.265.168 | 12.994.560 |
| Long tasks observadas (>50ms) | 17 | 0 |
| Tempo das long tasks | 1028ms | 0ms |

O volume de pixels copiados caiu 91,5%, apesar de haver mais quadros pequenos.
Essa medida não inclui a decodificação dos vídeos nativos, o custo de GPU ou
transferência de rede. O vídeo remoto original do fundo permanece preservado.
O mapa de refração ainda usa toDataURL uma vez por dimensão, fora da janela
de interação acima; o rastro não usa essa operação.

O diagnóstico reproduzível está em `scripts/qa/hero-performance.mjs`: após
`pnpm build`, execute `node scripts/qa/hero-performance.mjs`, sirva `out/` e
abra `/qa-hero-performance/`. O botão mede seis segundos. A fixture não é
importada pela aplicação e o próximo build a remove da saída.

## Validação

- Comparação visual com a referência publicada, incluindo o vídeo, a textura
  das letras, o contorno da lente e a troca de cores sob o rastro.
- 320, 390, 768 e 1024px: movimento automático e nenhuma cópia da cena na lente.
- 1440 e 1920px: resposta ao ponteiro e uma única cópia da cena na lente.
- Sem overflow horizontal nas seis larguras; bordas do rastro em 0 e na largura
  útil do documento (305, 375, 753, 1009, 1425 e 1905px respectivamente).
- Movimento automático conferido em duas posições; menu abriu e fechou por Escape.
- Ao navegar para Processos, os três vídeos do hero ficaram pausados e os
  efeitos passaram para o estado pausado.
- Preferência de movimento reduzido simulada por fixture local: lente estática,
  rastro oculto e vídeos sem fonte/pausados. Não alterou preferências do sistema.
- 19 testes, verificação TypeScript, build estático, formatação e cascata CSS.

Validação em Chromium; Safari e aparelhos físicos não foram testados. Não foi
feito deploy. GSAP permanece nas animações de scroll; Framer Motion não foi adicionado.
