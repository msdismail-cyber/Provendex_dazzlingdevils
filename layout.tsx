import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/lib/DataContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Provendex | Enterprise AI Procurement & Supplier Risk OS',
  description: 'Predictive procurement analytics, supplier risk scoring, supply chain disruption simulation, and strategy execution logging.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-brand-500 selection:text-white">
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}
