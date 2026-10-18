# Beyond — V1 em Next.js

A implementação ativa permanece em `prototype/`, agora com **Next.js App Router, React, TypeScript, Tailwind CSS 4 e GSAP**. O layout aprovado, responsividade, fontes e assets do Figma foram preservados. A implementação anterior foi guardada em `../backlog/antes-da-migracao-nextjs/`.

## Executar

Requisitos: Node.js 20.9+ (validado com Node 25) e npm.

```sh
npm ci
npm run dev
```

Abra http://localhost:4173. O servidor usa somente loopback. Para produção:

```sh
npm run typecheck
npm run build
npm start
```

Pare o servidor de desenvolvimento antes de executar `npm start`, pois ambos usam a porta 4173. As versões exatas estão em `package-lock.json`. Não é mais necessário executar `server.mjs`.

## Estrutura

- `src/app/`: App Router, metadata, layout, página e integração Tailwind/PostCSS.
- `src/components/site/`: componentes React de seção, cartões, texto, botão, navegação, FAQ, imagens e formulário.
- `src/components/motion/motion-root.tsx`: ciclo de vida das animações e trigger do tema.
- `src/lib/gsap.ts`: GSAP, ScrollTrigger e useGSAP registrados em um único lugar.
- `src/lib/design.ts`: tipos do layout e destinos das ações.
- `figma-layout.json`: conteúdo e geometria rastreáveis ao frame original.
- `tokens.css`: cores, tipografia e espaçamentos compartilhados. O `@theme inline` conecta esses tokens ao Tailwind.
- `style.css`: composição Figma, breakpoints e transições de paleta. As regras específicas de geometria continuam em CSS; Tailwind cuida da composição e de primitivas reutilizáveis. O Preflight não é importado para não alterar o reset aprovado.
- `public/assets/`: fontes Poppins locais, fotografias, máscaras e SVGs.
- `docs/animations.md`: como adicionar timelines, scrub, variantes responsivas e SVGs animáveis, com cleanup e movimento reduzido.

A página é pré-renderizada pelo Next.js. Não há fetch do layout no navegador nem um script legado montando o DOM. Componentes interativos são hidratados pelo React.

## Tema e interações

O dark mode é acionado por ScrollTrigger quando o título "Aplicativo da Beyond" começa a aparecer na tela. Ao subir e o título sair pela borda inferior, o tema volta ao branco. A transição de 600 ms respeita `prefers-reduced-motion`; fotos e mockups mantêm suas cores.

Menu, FAQ nativo e expansão do blog foram preservados. O formulário mantém validação nativa e abre um rascunho no WhatsApp; não há backend nem envio automático. Respostas não fornecidas pelo Figma não foram inventadas.

## Assets do Figma

Referência: https://www.figma.com/design/6GJ5Lmw6KLMBCBBnioehPF/Beyond-%7C-Site-institucional?node-id=15857-1601

Para reconstruir os assets a partir da raiz do projeto (Python com Pillow):

```sh
python prototype/build-figma.py tmp/figma-reference/ia-friendly.svg --optimize
python prototype/scripts/build-bleed-art.py
```

O exportador agora grava em `prototype/public/assets/figma/`. Ele preserva as versões clara/escura do aplicativo e o overlay inline da seção de conversa. A otimização continua verificando igualdade dos pixels antes de converter PNG para WebP lossless.

As variantes `*-bleed.svg` separam fundos fluidos, fotos ancoradas às bordas e elementos centrais de tamanho fixo. A largura vem do container da seção (`cqw`), sem incluir a barra de rolagem. A faixa de clientes usa conteúdo React repetido, com cópias ocultas de leitores de tela, e recorta somente na borda da página. Abaixo de 1440 px, os componentes continuam usando o layout responsivo existente.
