'use client';

import { GuestOnlyRoute } from '@/shared/components/AuthProvider';

import { AuthShell, LoginForm } from '@features/auth';

export default function LoginPage() {
  return (
    <GuestOnlyRoute>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </GuestOnlyRoute>
  );
}
