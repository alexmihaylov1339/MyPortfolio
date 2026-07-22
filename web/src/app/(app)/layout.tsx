'use client';

import { ProtectedRoute, AppNav } from '@shared/components';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppNav />
      <main className="p-6">{children}</main>
    </ProtectedRoute>
  );
}
