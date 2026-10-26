# Beyond — implementação do frame 15857:1601

Referência: [Figma / ia-friendly](https://www.figma.com/design/6GJ5Lmw6KLMBCBBnioehPF/Beyond-%7C-Site-institucional?node-id=15857-1601).

A implementação anterior não foi usada como referência visual. Esta versão utiliza a inspeção autenticada do Dev Mode e as exportações originais do frame, obtidas em 13/10/2026. O conector MCP do Figma não estava disponível nesta sessão.

## Executar

Na pasta `prototype/`, execute `node server.mjs` e abra http://localhost:4173. Não há dependências de frontend, CDN de imagens ou fontes remotas em tempo de execução.

## Estrutura

- `components.js`: componentes `DesignSection`, `ContentCards`, `TextBlock`, `SiteHeader`, `FaqAccordion`, `ContactForm` e `BlogReveal`.
- `figma-layout.json`: textos editáveis, hierarquia, coordenadas, tipografia e rastreabilidade das camadas. A geometria desktop preserva a composição de 1440 × 13708,59 px.
- `tokens.css`: cores, tipografia, espaçamentos e raios do frame. Os tokens comuns são utilizados pelos componentes.
- `style.css`: apresentação responsiva sem zoom ou escala global. A composição de 1440 px é preservada; abaixo dela, os mesmos textos, cartões e controles usam grid/flex. Em 1100 px a navegação vira menu; em 640 px as colunas se empilham. Textos corridos mantêm 16–18 px e controles, pelo menos 48 px.
- `assets/figma/`: vetores, máscaras, fotografias, logos, mockups e texturas originais. As decorações são SVGs por seção no desktop de referência, com recortes dos mesmos assets por componente para o layout fluido e conteúdo editorial em HTML. A palavra texturizada “negócios” utiliza os contornos exportados do Figma, com equivalente textual no heading HTML.
- `assets/fonts/`: Poppins local, com licença OFL.
- `build-figma.py`: reconstrução reproduzível dos assets e dados a partir da exportação. A opção `--optimize` requer Pillow e converte PNGs para WebP sem perda, comparando os pixels decodificados antes de aceitar a conversão.

Exportações-fonte: `../tmp/figma-reference/ia-friendly.svg` e `../tmp/figma-reference/hero-outlined.svg`. Exemplo, a partir da raiz do projeto:

```sh
python prototype/build-figma.py tmp/figma-reference/ia-friendly.svg --optimize
```

## Comportamentos e conteúdo do frame

- Navegação por âncoras, menu mobile, foco visível, link de pular conteúdo, FAQ nativo e botão de expansão do blog.
- O formulário valida campos obrigatórios/e-mail e abre um rascunho no WhatsApp. Não há backend de envio nem envio automático.
- O frame fornece a primeira resposta do FAQ. As outras perguntas abrem uma opção de conversar com a Beyond; não foram inventados preços, prazos ou condições contratuais.
- Os demais cases, conteúdos de artigos e destinos de “Ver matérias” não são fornecidos pelo frame selecionado. As abas de cases e paginação de depoimentos reproduzem o estado visual fornecido. “Explorar case” aponta para o contato enquanto não existe página do case no projeto.
- “X anos”, “APlicativos”, o label “PROCESSOS” na seção de contato e os textos repetidos do blog são literais do frame; foram preservados.
- O frame fornecido é desktop. A versão mobile é uma adaptação da implementação, não uma reprodução de um frame mobile.

## Verificação

- Comparação visual do desktop em 1440 px com a exportação original.
- Revisão de hero, serviços, aplicativo, FAQ e formulário.
- Verificação em 390 px: leitura, navegação mobile e ausência de overflow horizontal.
- Validação de sintaxe JavaScript, imagens carregadas, console e interação do FAQ.
- Evidências em `../tmp/figma-review/`.

Backup dos três arquivos anteriores em `../backlog/antes-da-correcao-figma-15857-1601/`.

## Tema acionado por scroll

`ScrollTheme` usa o título `#aplicativo h2` como fronteira: assim que o título entra pela borda inferior do viewport, `data-scroll-theme` muda para `dark`; ao subir acima da fronteira, volta para `light`. A atualização usa listener passivo e requestAnimationFrame, incluindo resize, restauração da página e alterações de altura. O fundo transiciona em 600 ms, com duração zero para prefers-reduced-motion. As telas SVG escuras têm canvas transparente para que o CSS controle a transição de ponta a ponta.

Verificado no navegador com PageDown / PageUp: branco → preto → branco, mantendo o conteúdo e a posição da página.

A seção Aplicativo possui paleta clara antes do gatilho (texto preto, destaques azuis e contornos claros) e escura depois dele. O artwork `aplicativo-light.svg` é gerado junto à versão escura, preservando as telas dos celulares. Os recortes decorativos `patterns_3` foram removidos das duas versões.
