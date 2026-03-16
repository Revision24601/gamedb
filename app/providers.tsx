'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ToastProvider';
import { MusicProvider } from '@/components/MusicProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <MusicProvider>
            {children}
          </MusicProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
