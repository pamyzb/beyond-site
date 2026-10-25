# Sustentabilidade da V1

Revisão estrutural em 25/10/2026. Este documento distingue o estado atual das
melhorias recomendadas; não registra uma refatoração já concluída.

## Avaliação atual

A organização é adequada a um site institucional: seções têm componentes e
hooks locais, conteúdo e navegação têm módulos próprios, o TypeScript usa
modo estrito e os assets são preparados no build. A exportação estática
dispensa servidor de aplicação em produção. Não há necessidade identificada
de reescrever o projeto ou adicionar outra biblioteca de animação.

A manutenção visual ainda exige cuidado com a cascata global e com seletores
dependentes do export do Figma. A separação em diretórios não significa que
todos os estilos estejam isolados por seção.

## Prioridades de consolidação

| Prioridade | Estado observado | Próximo passo recomendado |
| --- | --- | --- |
| 1 | CSS de Serviços também altera Cases e Aplicativo; CSS de Aplicativo altera Contato, FAQ e outras seções. | Mover as regras para seus responsáveis, preservando a ordem efetiva da cascata e conferindo o resultado visual a cada etapa. |
| 1 | Há testes de conteúdo, geometria, fontes e SVGs, mas não testes automatizados em navegador nem workflow de CI versionado. | Automatizar os checks existentes e acrescentar cenários de menu, carrosséis e animações em navegador; manter validação em Safari real. |
| 2 | Seletores como `Container_26` e ancestrais do JSON dependem da estrutura atual do export. | Introduzir atributos semânticos no preparo dos derivados e adaptar gradualmente os consumidores. |
| 2 | Responsividade está concentrada em `styles/responsive.css`, além de regras locais. | Aproximar regras específicas de seus componentes e documentar condições compartilhadas antes de mudar breakpoints. |
| 2 | Hooks de animação acumulam medição, eventos, renderização e controle de estado. | Extrair cálculos puros e responsabilidades separáveis quando houver alteração real, preservando cleanup e pausas fora da tela. |
| 3 | Guias e relatórios de QA podem descrever comportamentos já substituídos. | Atualizar os guias ativos com cada mudança; preservar relatórios históricos como evidência limitada à revisão que documentam. |

## Critérios de validação

- `pnpm typecheck`: contratos TypeScript.
- `pnpm test`: conteúdo, geometria e pipeline de assets.
- `pnpm css:check`: declarações idênticas sobrescritas nas cascatas verificadas;
  não detecta todas as colisões de estilos nem problemas de layout.
- `pnpm format:check`: formatação das fontes e scripts abrangidos pelo comando.
- `pnpm build`: compilação e exportação de produção; os checks anteriores não
  comprovam que o build passou.
- Conferência visual em desktop, tela compacta e Safari no iPhone: menu,
  mudança de tema, controles sem sobreposição, robôs visíveis, refração e
  desenho progressivo das telas. Repetir com movimento reduzido.

Na validação anterior ao commit `b990d10`, os 25 testes, o TypeScript e o
check de cascata passaram. Isso não comprova um build completo de produção,
uma medição de performance nem a validação visual de todas as variantes.
Essa revisão estrutural também não substitui uma auditoria de acessibilidade.

## Organização das referências

Use `README.md` para executar e publicar, `structure.md` para responsabilidades,
`../animations.md` e `../hero-3d.md` para movimento e `../themes.md` para cor.
Os arquivos em `../qa/` são registros de validações anteriores, não uma
garantia de comportamento para qualquer commit posterior.
