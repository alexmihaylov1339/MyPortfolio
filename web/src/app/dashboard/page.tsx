'use client';

import Link from 'next/link';

import { ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@/shared/constants';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-ink-strong">Dashboard</h1>
          <Link
            href={APP_ROUTES.account}
            className="text-sm font-medium text-brand hover:underline"
          >
            Account
          </Link>
        </div>

        <p className="text-ink-muted">
          Your portfolio will appear here. Positions arrive in Step 2.
        </p>
      </main>
    </ProtectedRoute>
  );
}
