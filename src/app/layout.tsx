import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AETHER ATELIER | 3D Luxury Sneaker Showroom',
  description: 'Immersive 3D sneaker showroom exhibition featuring floating glass display shelves, cinematic camera transitions, and synchronized luxury shopping controls.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark min-h-full bg-[#0d0c14]">
      <body className="min-h-full overflow-x-hidden text-zinc-100 antialiased font-sans bg-[#0d0c14]">
        {children}
      </body>
    </html>
  );
}
