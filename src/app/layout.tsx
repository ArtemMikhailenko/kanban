// src/app/layout.tsx
import { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import '@/styles/variables.css';
import '@/styles/animations.css';

export const metadata: Metadata = {
  title: 'KanbanFlow - Управління проектами та задачами',
  description: 'Ефективна система управління проектами, задачами та дедлайнами з інтеграцією з Google Calendar',
  keywords: 'kanban, управління проектами, задачі, дедлайни, Google Calendar, планування',
  authors: [{ name: 'Ваше ім\'я' }],
};

// Fix for viewport warning - moved from metadata to separate viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body>
        {children}
      </body>
    </html>
  );
}