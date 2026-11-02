import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'open-madal — Nepali Madal Notation Compiler & Interactive Taal Sequencer',
  description:
    'Digital preservation, declarative MadalCode DSL, dual-drumhead percussion tablature, and Web Audio synthesizer for the traditional Nepali Madal hand drum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased selection:bg-orange-500/30 selection:text-orange-200">
        {children}
      </body>
    </html>
  );
}

