export const SITE_LINKS = {
  home: '#inicio',
  contact: '#contato',
  agentService: '/colaboradores-agenticos/',
  whatsapp: 'https://wa.me/5511936191071',
  maps: 'https://www.google.com/maps/search/?api=1&query=Rua+Cardeal+Arcoverde+745+Pinheiros+Sao+Paulo',
  phone: 'tel:+5511936191071',
  email: 'mailto:contato@beyondthebytes.com.br',
} as const;
export const WHATSAPP = SITE_LINKS.whatsapp;
export const NAVIGATION = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Cases', href: '#cases' },
  { label: 'App Beyond', href: '#aplicativo' },
  { label: 'Processos', href: '#processo' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contato', href: SITE_LINKS.contact },
] as const;
// Dedicated header pages will be linked when they are available.
export const HEADER_NAVIGATION = [
  { label: 'IA', href: SITE_LINKS.agentService },
  { label: 'Cases' },
  { label: 'Serviços' },
  { label: 'Conteúdo' },
] as const;
export const HEADER_ACTION = {
  label: 'Fale com um especialista',
  href: SITE_LINKS.contact,
} as const;
export const SOCIAL_LINKS = [
  { name: 'email', label: 'E-mail', href: SITE_LINKS.email },
  { name: 'whatsapp', label: 'WhatsApp', href: SITE_LINKS.whatsapp },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/beyond-the-bytes/',
  },
  { name: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/beyond.thebytes/' },
  { name: 'x', label: 'X', href: 'https://x.com/beyondthebytes' },
] as const;
