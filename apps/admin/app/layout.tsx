import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HSC Content Factory',
  description: 'AI-assisted secure educational content ingestion studio',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
