import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'TaxOne', description: 'CA practice, accounting and GST automation' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
