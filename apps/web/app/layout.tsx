import './globals.css';
import './taxone.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Accounting Automation Platform for CAs and Tax Professionals | Vyapar Taxone',
  description:
    'AI accounting Automation simplifies daily operations with automated document collection, GST filing, and Tally sync',
  icons: {
    icon: 'https://taxone.vyapar.com/favicon.ico',
  },
  openGraph: {
    title: 'AI Accounting Automation Platform for CAs and Tax Professionals | Vyapar Taxone',
    description:
      'AI accounting Automation simplifies daily operations with automated document collection, GST filing, and Tally sync',
    images: ['https://static.taxone.vyapar.com/images/taxone/seo/s_home-page.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://static.taxone.vyapar.com" />
        <link rel="preconnect" href="https://strapi.taxone.vyapar.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
