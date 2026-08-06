'use client';

import { LogoutButton, UpdateAccountForm } from '@features/auth';

export default function AccountPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">Account</h1>

      <div className="max-w-md rounded-[var(--radius-card)] border border-line-soft bg-surface p-6 shadow-card">
        <UpdateAccountForm />
        <LogoutButton />
      </div>
    </>
  );
}
