import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minimal Expense Tracker',
  description: 'Track daily expenses simply',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <main className="mx-auto max-w-2xl p-4 sm:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
