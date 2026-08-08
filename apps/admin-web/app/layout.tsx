import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'SARIRA Admin', description: 'SARIRA administration foundation' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
