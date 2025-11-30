import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'TutorGo',
  description:
    'Uhm... meow?'
};

import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
        {children}
        <Toaster />
      </body>
      <Analytics />
    </html>
  );
}
