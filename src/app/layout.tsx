import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/context/AuthContext';
import { ConferenceDataProvider } from '../lib/context/ConferenceDataContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://esit-conference.vercel.app'),
  title: 'ESIT 2027 | International Conference on Engineering Science & Innovative Technology',
  description: 'The 6th International Conference on Engineering Science and Innovative Technology (ESIT 2027), Danang, Vietnam. Fostering Smart Innovation, Sustainable Green Energy & Industrial AI.',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  keywords: ['ESIT 2027', 'Conference', 'Engineering Science', 'KMUTNB', 'Danang', 'Vietnam', 'Call for Papers', 'Scopus', 'IEEE'],
  authors: [{ name: 'ESIT 2027 Organizing Committee' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ESIT 2027 | International Conference on Engineering Science & Innovative Technology',
    description: 'The 6th International Conference on Engineering Science and Innovative Technology (ESIT 2027), Danang, Vietnam. Fostering Smart Innovation, Sustainable Green Energy & Industrial AI.',
    url: 'https://esit-conference.vercel.app',
    siteName: 'ESIT 2027 International Conference',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'ESIT 2027 Conference Official Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESIT 2027 | International Conference on Engineering Science & Innovative Technology',
    description: 'The 6th International Conference on Engineering Science and Innovative Technology (ESIT 2027), Danang, Vietnam.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <ConferenceDataProvider>
            {children}
          </ConferenceDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
