import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Source_Serif_4,
  IBM_Plex_Sans,
  JetBrains_Mono,
  Archivo,
  Manrope,
  Public_Sans,
} from 'next/font/google';
import Script from 'next/script';

import { AuthProvider } from '@/shared/components/AuthProvider';
import { ThemeProvider } from '@/shared/components/ThemeProvider';
import { QueryProvider, NotificationProvider } from '@shared/providers';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Theme fonts — one display + one body face per theme (see globals.css'
// [data-theme] blocks for which pair each theme uses).
const sourceSerif = Source_Serif_4({
  variable: '--font-source-serif',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const plexSans = IBM_Plex_Sans({
  variable: '--font-plex-sans',
  subsets: ['latin'],
  weight: ['400', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['600', '700'],
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
  weight: ['400', '600'],
});

const THEME_FONT_VARIABLES = [
  sourceSerif.variable,
  plexSans.variable,
  jetbrainsMono.variable,
  archivo.variable,
  manrope.variable,
  publicSans.variable,
].join(' ');

export const metadata: Metadata = {
  title: 'MyPortfolio',
  description: 'MyPortfolio — all your stock positions in one place',
};

// Runs before hydration so the stored theme is applied on the very first
// paint — without this, the page would flash the default theme first.
const SET_THEME_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem('myportfolio-theme');
    if (theme === 'ledger' || theme === 'terminal' || theme === 'studio') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="set-theme" strategy="beforeInteractive">
          {SET_THEME_SCRIPT}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${THEME_FONT_VARIABLES} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
