import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Beyond the Bytes — Tecnologia que move negócios',
  description:
    'Somos uma software house que pensa como sócia do seu negócio. Produtos digitais, sistemas e agentes de IA sob medida.',
};
export const viewport: Viewport = { themeColor: '#2f43fc' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#inicio">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
