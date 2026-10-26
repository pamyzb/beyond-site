# Beyond — tokens do frame implementado

Referência: [Figma, frame 15857:1601](https://www.figma.com/design/6GJ5Lmw6KLMBCBBnioehPF/Beyond-%7C-Site-institucional?node-id=15857-1601).

Os valores foram corrigidos pela inspeção do Dev Mode e pela exportação original, em 13/10/2026. A documentação anterior com grid de 1200 px, display de 104 px e espaçamentos aproximados foi substituída.

| Fundação | Valor no frame |
| --- | --- |
| Prancha desktop | 1440 px |
| Conteúdo | 1320 px, margens de 60 px |
| Família | Poppins |
| Display | 152 px, peso 700, tracking -10 px |
| Heading de seção | 72 px, peso 500, tracking -4 px |
| Subheading | 44 px, peso 500, tracking -2 px |
| Texto | 16 e 18 px |
| Ação | #2F43FC |
| Destaque escuro | #AAED35 |
| Superfície clara | #F6F8FB |
| Cards claros | #EAEFF9 |
| Texto secundário claro | #4B5563 |
| Texto secundário escuro | #D1D5DB |
| Botão principal | 48 px de altura, raio 24 px |

`tokens.css` é a cópia compartilhada dos tokens utilizados pela implementação em `prototype/tokens.css`. Ao alterar a fundação, mantenha os dois arquivos sincronizados. Os assets vetoriais originais preservam seus próprios fills exportados; alterações de tema não recolorem automaticamente esses assets.

Medidas fracionárias fazem parte do desenho original. Elas são mantidas em `prototype/figma-layout.json`, junto aos textos, e não são arredondadas para a antiga escala de espaçamentos.

Consulte [a documentação da implementação](../prototype/README.md) para componentes, execução, geração de assets e limites dos conteúdos fornecidos no frame.


Responsividade: `--page-gutter` e `--section-space` controlam espaçamento fluido. Nenhum zoom global é aplicado. Cartões e navegação compartilham o DOM entre larguras; recortes do artwork original acompanham o reflow em grid/flex.

## Padrão de títulos de seção (V1)

Use `SectionHeading` de `prototype/src/components/site/section-heading.tsx` para novos cabeçalhos. Recebe `label`, `title` (ReactNode; use `<em>` no destaque entre colchetes) e `subtitle` opcional. O componente está aplicado em Cases. Os demais cabeçalhos importados do Figma continuam usando TextBlock com suas cores, pesos e coordenadas originais. A migração deve ser feita seção por seção, com validação visual, sem classificação automática por ancestral.

| Elemento | Claro | Escuro |
| --- | --- | --- |
| Título (`--section-heading-ink`) | #000000 | #FFFFFF |
| Rótulo, ícone e destaque (`--section-heading-accent`) | #2F43FC | #AAED35 |
| Subtítulo (`--section-heading-muted`) | #4B5563 | #D1D5DB |

O tema é herdado da seção (`.theme-dark`), não da preferência do sistema. A seção Aplicativo segue a transição existente de tema no scroll, inclusive as cores do cabeçalho. Não fixe cores locais nos novos títulos.

- Título: Poppins Medium (500), 72 px no desktop, fluido até 38 px; destaque itálico entre colchetes.
- Rótulo: Poppins Semibold (600), 18 px, tracking .08em, vertical no desktop; 14 px horizontal abaixo de 1440 px.
- Ícone: símbolo Beyond original, 14 × 14 px, mesma cor do destaque; abaixo do rótulo vertical e ao lado no layout horizontal.
- Subtítulo de apoio: Poppins Regular (400), 18 px, cinza do tema, alinhado à extrema direita.
- Títulos editoriais especiais (como hero e chamadas fora de `section-title`) mantêm sua composição própria.

Nos cabeçalhos legados, o ícone desktop está no artwork vetorial original. Não duplique esse ícone com outro asset sobreposto.
O título compacto dos clientes fica FORA da faixa preta, sobre fundo branco, em preto com destaque azul. A faixa preta pertence somente ao carrossel. Não aplicar o tema de scroll a esse título.

