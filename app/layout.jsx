import './globals.css';

export const metadata = {
  title: 'Brick Quality Dashboard',
  description: 'Realtime monitoring for brick QA throughput and defects.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
