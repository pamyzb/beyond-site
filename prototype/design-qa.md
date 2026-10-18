# QA — Serviços V1

final result: passed

Escopo: adaptação da composição enviada, preservando a copy da V1. Não é uma reprodução literal do blog da referência.

## Evidências
- Referência: C:/Users/Pamy/AppData/Local/Temp/codex-clipboard-e6aceb9e-bc98-4628-b4bb-4779b0af8407.png (1488 × 743).
- Desktop: ../artifacts/services-desktop.jpg (1528 × 921), sequência intermediária do scroll.
- Mobile: ../artifacts/services-mobile.jpg, viewport CSS 390 × 844.
- Destaque: ../artifacts/services-agents.jpg.
- Comparação conjunta: ../artifacts/services-comparison.png, imagens normalizadas para 1000 px de largura, proporções preservadas. A referência não define estado de scroll; a comparação avalia composição, não igualdade pixel a pixel.

## Revisão visual
- Tipografia: Poppins e hierarquia da V1 mantidas; títulos fluem sem coordenadas absolutas.
- Espaçamento: cards largos, alturas alternadas, respiro e imagens arredondadas. Os raios são uma alteração explicitamente solicitada.
- Cores: base clara da V1, destaque azul com acentos lima e texto branco legível.
- Imagens: ativos locais existentes. Substituído recorte de retrato inadequado por imagem de laptop já utilizada no site. Mockup do laptop é um ativo preexistente.
- Conteúdo: seis títulos, descrição agêntica e ambos os CTAs recuperados diretamente dos blocos existentes.
- Detalhe: robôs e ferramentas da biblioteca Lucide; animação GSAP desenha a moldura da imagem, movimenta robôs e ferramentas.
- Sem achados visuais P0/P1/P2 pendentes no escopo. Mobile mostra um card por vez e permite scroll nativo horizontal; conteúdo longo continua verticalmente.

## Verificação
- Scroll vertical desloca horizontalmente a sequência; progresso visual acompanha deslocamento.
- Teclado End alcança o destaque agêntico; Home e setas têm mapeamento explícito. Foco no CTA expõe o último card.
- Menu mobile abre e navega para Serviços.
- Respeito a prefers-reduced-motion implementado por matchMedia, sem pin ou animação contínua; não emulado no navegador.
- Console consultado: nenhum erro retornado.
- npm run typecheck: passou.
- npm run build: compilação concluída; processo de verificação posterior bloqueado pelo ambiente com spawn EPERM. Build de produção completo não confirmado.

## Histórico
- Corrigido recorte excessivo da imagem do terceiro serviço.
- Removido scroll suave do atalho de teclado para evitar concorrência com o foco nativo.
- Resetado scrollLeft ao retornar do layout mobile ao desktop.
- Captura final e comparação visual abertas para revisão.

## Métricas — 2026-10-15
- Escopo: adaptação da referência fornecida à V1; dados e identidade existentes preservados.
- Referência: codex-clipboard-d29fd885-63a0-4a8c-8368-5d2c9c1c963c.png.
- Capturas: ../artifacts/metrics-clean-desktop.png e ../artifacts/metrics-clean-mobile.png.
- Comparação visual: três colunas equivalentes, números pretos grandes de peso regular, sinais elevados, descrições centralizadas e divisórias discretas. Fundo e fonte mantêm os tokens do site. Bloco de mídia preservado.
- Responsivo: coluna única com divisórias horizontais em 390px; sem sobreposição entre métricas.
- TypeScript: npm run typecheck passou. Console do navegador sem erros na verificação.
- Nenhum P0/P1/P2 encontrado no layout das métricas.
- final result: passed
