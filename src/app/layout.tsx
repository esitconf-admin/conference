import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/context/AuthContext';
import { ConferenceDataProvider } from '../lib/context/ConferenceDataContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'ESIT 2025 | International Conference on Engineering Science & Innovative Technology',
  description: 'The 5th International Conference on Engineering Science and Innovative Technology (ESIT 2025), Pattaya, Thailand. Fostering Smart Innovation, Sustainable Green Energy & Industrial AI.',
  keywords: ['ESIT 2025', 'Conference', 'Engineering Science', 'KMUTNB', 'Pattaya', 'Call for Papers', 'Scopus', 'IEEE'],
  authors: [{ name: 'ESIT 2025 Organizing Committee' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ESIT 2025 | International Conference on Engineering Science & Innovative Technology',
    description: 'The 5th International Conference on Engineering Science and Innovative Technology (ESIT 2025), Pattaya, Thailand. Fostering Smart Innovation, Sustainable Green Energy & Industrial AI.',
    url: 'https://esit-conference.vercel.app',
    siteName: 'ESIT 2025 International Conference',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'ESIT 2025 Conference Official Poster',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ESIT 2025 | International Conference on Engineering Science & Innovative Technology',
    description: 'The 5th International Conference on Engineering Science and Innovative Technology (ESIT 2025), Pattaya, Thailand.',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'],
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
