import type { CSSProperties } from 'react';

export type Style = CSSProperties & { [key: `--${string}`]: string | number };
export interface TextRun {
  text: string; x: number; y: number; size: number; weight: string;
  italic: boolean; tracking: string; color: string; angle: number; origin: number[] | null;
}
export interface DesignBlock {
  source: string; role: 'h1' | 'h2' | 'h3' | 'p' | 'label'; runs: TextRun[];
  ancestors: string[]; actionBox?: number[];
}
export interface SectionData {
  id: string; label: string; y: number; height: number; dark: boolean;
  art: string; blocks: DesignBlock[];
}
export interface DesignData { sections: SectionData[] }
export const WHATSAPP = 'https://wa.me/5511936182404';
export const LINKS: Record<string, string> = { Home:'#inicio', Cases:'#cases', Serviços:'#servicos', Processo:'#processo', 'App Beyond':'#aplicativo', Blog:'#blog', Contato:'#contato' };
export const asset = (src: string) => `/${src.replace(/^\//, '')}`;
const COLOR_TOKENS: Record<string, string> = {
  '#102E1D': '--color-forest',
  '#102e1d': '--color-forest',
};
const WEIGHT_TOKENS: Record<string, string> = {
  '400': '--weight-regular',
  '500': '--weight-medium',
  '600': '--weight-semibold',
  '700': '--weight-bold',
};
const TRACKING_TOKENS: Record<string, string> = {
  '0px': '--tracking-none',
  '0em': '--tracking-none',
  '-10px': '--tracking-display',
  '-4px': '--tracking-heading',
  '-2px': '--tracking-subheading',
  '0.2px': '--tracking-body',
  '0.08em': '--tracking-label',
  '0.12em': '--tracking-overline',
};
export const color = (value: string) => value.startsWith('--') ? `var(${value})` : COLOR_TOKENS[value] ? `var(${COLOR_TOKENS[value]})` : value;
export const fontWeight = (value: string | number) => `var(${WEIGHT_TOKENS[String(value)] ?? '--weight-regular'})`;
export const tracking = (value: string) => TRACKING_TOKENS[value] ? `var(${TRACKING_TOKENS[value]})` : value;
export const TYPE_TOKENS: Record<number, string> = {152:'display',72:'heading',44:'subheading',24:'card',18:'body-lg',16:'body',14:'small'};
export function actionFor(text: string, section: string): string | undefined {
  if (['cabecalho','rodape'].includes(section) && LINKS[text]) return LINKS[text];
  if (/WhatsApp|Agende uma visita|Fale com um sócio/.test(text)) return WHATSAPP;
  if (/Fale com um especialista|Ver detalhes do serviço|Explorar case/.test(text)) return '#contato';
  if (text.includes('Ver a rota no Maps')) return 'https://www.google.com/maps/search/?api=1&query=Rua+Cardeal+Arcoverde+745+Pinheiros+Sao+Paulo';
  if (text.startsWith('+55')) return 'tel:+5511936182404';
  if (text.includes('contato@')) return 'mailto:contato@beyondthebytes.com.br';
}
