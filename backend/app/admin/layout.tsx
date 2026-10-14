import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Abhinnati Admin Portal',
  description: 'Internal operations console for Abhinnati platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
