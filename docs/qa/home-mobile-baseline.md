# Home mobile — referência antes dos ajustes

Data: 30/10/2026. Implementação V1 na raiz. Capturas feitas no servidor de
desenvolvimento em `http://127.0.0.1:4173/`, antes das alterações deste trabalho.

## Referências registradas

Pasta: `artifacts/home-mobile/before/`.

Chromium e WebKit, em 390 × 844 com toque emulado e 1440 × 1000:

- hero e home completa;
- menu aberto no mobile;
- empresa com informações abertas;
- serviços, cases e processo.

Os arquivos usam o prefixo `<motor>-<mobile|desktop>-<estado>.png`.
`measurements.json` registra as medições da primeira passagem.

## Reprodução dos sintomas

**Empresa permanece aberta no segundo acionamento:** reproduzido em Chromium
e WebKit mobile. O primeiro acionamento criou um popover e o segundo manteve
um popover. A verificação acionou o botão em contexto com toque emulado; não
substitui um teste em aparelho físico.

**Processo:** a rota SVG atual contém três subpaths separados, enquanto o
marcador usa `getPointAtLength()` sobre o comprimento acumulado. A amostragem
em 1.000 intervalos encontrou saltos de aproximadamente 213–215 px nas duas
emendas em ambos os motores; intervalos contínuos próximos mediram cerca de
0,3 px. Essa descontinuidade explica saltos de posição, mas não constitui uma
medição de fluidez ou de frames perdidos em aparelho. Além disso, as animações
de entrada chamam `measure()` por frame; registrar esse custo separadamente do
salto geométrico. Dados em `diagnosis.json`.

**Logos:** todas as imagens estavam carregadas na primeira passagem. Não foi
confirmado visualmente um salto no ciclo completo. A primeira amostragem do
ciclo usou 28 s, porém a regra final define 48 s; portanto esses valores de
posição não são evidência de fechamento correto ou incorreto do ciclo. Uma
segunda passagem foi interrompida por timeout de navegação no servidor dev.
Manter esse sintoma como não diagnosticado até medir o período efetivo inteiro.

**Overflow e execução:** as quatro combinações de motor/largura registraram
largura do documento igual à viewport e nenhum erro JavaScript na passagem
inicial. Isso não valida todos os estados intermediários das animações.

## Decisões de escopo

A usuária determinou seguir o planejamento e o desktop como guia dos ajustes
responsivos. Propostas ainda abertas no documento não foram consideradas
aprovadas: composição alternativa de empresas, cards 2 + 1 e ocultação dos
botões finais permanecem sem aplicação automática. Não foi fornecida, nesta
etapa, gravação/site antigo ou referência adicional de cor da mídia.

Nenhum arquivo de produto foi alterado por esta coleta. Não houve commit ou
publicação. A verificação usa emulação; não houve teste em iPhone físico.
