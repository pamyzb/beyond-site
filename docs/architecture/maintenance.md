# Sustentabilidade da V1

Consolidação de 25/10/2026, preservando os assets originais e o comportamento visual.

## Etapas implementadas

| Ponto | Alteração |
| --- | --- |
| CSS de uma seção alterava outras | As regras de Cases e Aplicativo saíram de `services/scroll-journey.css`. Contato, FAQ, Processos e Depoimentos possuem seus próprios arquivos de artwork. O material do vidro fica no Hero, separado do cabeçalho. |
| Responsividade concentrada | As regras específicas ficam em `responsive.css` ao lado de cada seção e layout. `styles/responsive.css` conserva os contratos compartilhados, com cerca de 130 linhas. Os imports responsivos permanecem no final de `app/globals.css`. |
| Animações acopladas a IDs exportados | `scripts/figma/artwork-roles.mjs` associa os nomes do export a atributos `data-artwork-role` durante o preparo. Aplicativo, Conversa, Contato, FAQ, Sobre e o marcador/sombra de Processos usam esses atributos nas animações. Quantidades incompatíveis interrompem o preparo com erro explícito. |
| Responsabilidades misturadas | A geometria da rota e o posicionamento compacto dos robôs são funções puras em `lib/animation/services-geometry.ts`. A entrada dos cards tem lifecycle próprio em `use-services-reveal.ts`; a navegação continua em `use-services-navigation.ts`. O hover do QR foi separado da timeline do telefone em `use-qr-hover.ts`. |
| Sem navegador/CI | Playwright cobre navegação, hero, controles/robôs do carrossel, desenho progressivo e movimento reduzido. O workflow `Quality` executa checks, build estático e testes Chromium/WebKit em pushes e pull requests. |

## Contratos de manutenção

CSS continua global: organizar os arquivos por seção não cria isolamento automático.
Use seletores da seção responsável e mantenha regras compartilhadas em `styles/`
ou nas primitivas de UI. Confira a ordem em `app/globals.css` ao mover um bloco.
Não agrupe regras de várias seções em um arquivo específico de uma delas.

Uma nova exportação do Figma ainda precisa de revisão. A associação com os IDs
originais fica no adaptador de assets; os atributos semânticos não adivinham a
intenção de uma exportação arbitrária. Conteúdo e fragmentos de Processos também
mantêm seus contratos com o export, verificados pelos testes. Seletores CSS de
decoração ainda usam alguns IDs originais; não os reutilize em novos hooks.

Os hooks do hero e outras timelines continuam complexos. A extração começou
pelas responsabilidades de Serviços e Aplicativo; novas alterações devem manter
medição, cálculo puro, escrita no DOM e eventos identificáveis, com cleanup de
observadores, listeners e animações. Não há necessidade de outra biblioteca.

## Validação

```sh
pnpm exec playwright install chromium webkit
pnpm check
pnpm verify
```

O navegador serve `out/` na porta 4181. Para apontar para outro servidor, defina
`E2E_BASE_URL`; nesse caso o Playwright não inicia um servidor. `test:e2e:ui`
abre o modo interativo. O gate `pnpm verify` ignora `E2E_BASE_URL`, recusa testes
com `.only` e inicia seu próprio servidor para testar a exportação local.
Relatórios, traces e screenshots de falhas ficam em
`playwright-report/` e `test-results/`, ignorados pelo Git e publicados como
artefatos pelo CI em caso de falha.

A suíte usa Chromium desktop (1440px), tablet (768px), mobile (390px) e WebKit
mobile (390px). Verifica geometria e comportamento, sem baselines de screenshot.
WebKit automatizado não substitui Safari no iPhone para refração, filtros,
máscaras e desempenho real. O CI só terá resultado remoto após publicar a branch.

O Husky é instalado por `pnpm install`: pre-commit executa `pnpm check` e pre-push
executa `pnpm verify`. Os hooks conferem os arquivos da árvore de trabalho, sem
isolar o stage. Instalações em CI ou produção dispensam a ativação dos hooks.
Um teste instala os hooks em um repositório temporário e comprova que ambos
propagam falhas e permitem sucesso, sem criar commits ou enviar ao remoto.
Hooks locais são contornáveis; a proteção da branch deve exigir o job `validate`
do workflow `Quality` para aplicar a regra no servidor.

Nesta revisão passaram 31 testes unitários, 40 cenários de navegador, TypeScript,
formatação, verificação de cascata e build padrão de produção. Veja o registro
e os limites em [QA](../qa/maintenance-refactor.md).
