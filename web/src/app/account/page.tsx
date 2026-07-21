'use client';

import { ProtectedRoute } from '@shared/components';

import { LogoutButton, UpdateAccountForm } from '@features/auth/account/components';

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <main className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-ink-strong">Account</h1>

        <div className="max-w-md">
          <UpdateAccountForm />
          <LogoutButton />
        </div>
      </main>
    </ProtectedRoute>
  );
}
