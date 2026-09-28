import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'folloeat. | Food Delivery, Asporto & Tavoli a Follonica',
  description: 'Piattaforma etica iperlocale per Follonica e il litorale maremmano. Ordini diretti ai ristoratori locali, consegna all\'ombrellone e prenotazione Radar Tavoli.',
  keywords: ['food delivery follonica', 'pizza follonica', 'delivery spiaggia follonica', 'maremma food', 'radar tavoli'],
  authors: [{ name: 'FolloEat Platform' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0284C7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-screen bg-follo-bg text-follo-slate antialiased">
        {children}
      </body>
    </html>
  );
}
