import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FolloEat | Piattaforma etica iperlocale per Follonica e il litorale maremmano',
  description: 'Piattaforma etica iperlocale per Follonica e il litorale maremmano. Food delivery, asporto e prenotazione rapida tavoli con terminale Sunmi e incassi diretti ai ristoratori.',
  openGraph: {
    title: 'FolloEat | Piattaforma etica iperlocale per Follonica e il litorale maremmano',
    description: 'Piattaforma etica iperlocale per Follonica e il litorale maremmano. Food delivery, asporto e prenotazione rapida tavoli con terminale Sunmi e incassi diretti ai ristoratori.',
  },
  applicationName: 'folloeat.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'folloeat.'
  },
  manifest: '/manifest.json',
  keywords: ['food delivery follonica', 'pizza follonica', 'delivery spiaggia follonica', 'maremma food', 'radar tavoli', 'sotto l\'ombrellone', 'sunmi v2s'],
  authors: [{ name: 'FolloEat Platform' }],
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
