import './globals.css';
import type { Metadata } from 'next';
import { Raleway, Caveat } from 'next/font/google';
import { Suspense } from 'react';
import { Providers } from './providers';
import NavigationProgress from '@/components/NavigationProgress';
import BackgroundAnimation from '@/components/BackgroundAnimation';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});
const caveat = Caveat({ 
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GameDB - Track Your Gaming Journey',
  description: 'A personal game tracking database to manage your gaming collection and progress.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${raleway.className} ${caveat.variable} font-light text-gray-900 dark:text-white`}>
        <Providers>
          <BackgroundAnimation />
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
