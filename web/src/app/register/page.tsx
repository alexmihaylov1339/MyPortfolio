'use client';

import { GuestOnlyRoute } from '@/shared/components/AuthProvider';

import { AuthShell, RegisterForm } from '@features/auth';

export default function RegisterPage() {
  return (
    <GuestOnlyRoute>
      <AuthShell>
        <RegisterForm />
      </AuthShell>
    </GuestOnlyRoute>
  );
}
