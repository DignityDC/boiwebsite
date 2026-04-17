import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Bureau of Operational Integrity | BOI',
  description:
    'The Bureau of Operational Integrity, Defending Order. Ensuring Trust. Upholding Integrity.',
  keywords: 'BOI, Bureau of Operational Integrity, Operations, Integrity',
  icons: {
    icon: '/boi-seal.png',
    apple: '/boi-seal.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="bg-boi-bg text-boi-text antialiased font-sans" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
