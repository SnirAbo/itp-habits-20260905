import './globals.css';
import { ThemeProvider } from 'next-themes';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ITP Habits',
  description: 'Track daily habits with streaks. Built for ITP.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-dvh flex flex-col">
            <header className="border-b p-4 flex items-center justify-between">
              <h1 className="font-bold">ITP Habits</h1>
              <nav className="flex gap-3 text-sm">
                <a href="/" className="hover:underline">Today</a>
                <a href="/habits" className="hover:underline">Habits</a>
                <a href="/stats" className="hover:underline">Stats</a>
                <a href="/settings" className="hover:underline">Settings</a>
              </nav>
            </header>
            <main className="flex-1 container mx-auto p-4">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
