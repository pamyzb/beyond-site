# Revisão mobile — sexta rodada

30/10/2026.

- Menu: links entram depois do início do painel, com atrasos de 60ms entre
  itens e deslocamento de 80px; movimento reduzido permanece imediato.
- Setas do menu usam o mesmo asset e rotação dos nomes de seção no mobile.
  Hover/foco afasta o texto 8px, dando espaço ao efeito de colchetes.
- Idioma compacto, aproximadamente 60px, sem distribuir PT e seta pela linha.
- Vetor Beyond ampliado no background do menu, sem interceptar interação.
- Mídia: botão mantém altura padrão de 48px, centralizado na linha da grade.
- Conversa: gaps internos de 16px.
- Favicon dos cases usa o recorte cover/left do desktop.
- Vetores inferiores adicionados nos cases apenas abaixo de 960px.
- Última janela dos cases retorna ao recorte do grid com 20px e raio de 24px
  no fim do scroll. Entrada e sobreposição anteriores preservadas.

## Verificação

Build, formatação dos arquivos alterados e checagem CSS aprovados.
Seis testes passaram em Chromium/WebKit mobile: sequência de cases, leitura
do CTA antes da sobreposição, movimento reduzido e menu.

Conferência visual/medidas nos dois motores: links em estados distintos a
500ms (entrada escalonada), idioma compacto, botão com 48px, favicon cover,
dois vetores inferiores e recorte final `inset(0px 20px round 24px)`.
Evidências em `artifacts/home-mobile/revision-6-*.png` e
`artifacts/home-mobile/test-results/revision-6/`.
