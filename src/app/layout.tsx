import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegistrar } from './register-sw';

export const metadata: Metadata = {
  title: 'Shchakim Display',
  description: 'Kiosk display for tefillah times and updates'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}


