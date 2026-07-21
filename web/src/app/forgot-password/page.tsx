'use client';

import { GuestOnlyRoute } from '@/shared/components/AuthProvider';

import { AuthShell } from '@features/auth/components';
import { ForgotPasswordForm } from '@features/auth/forgot-password/components';

export default function ForgotPasswordPage() {
  return (
    <GuestOnlyRoute>
      <AuthShell
        description="Forgot your password? No worries. Enter your email to proceed."
        descriptionClassName="mb-[30px] max-w-[382px] text-[20px] font-bold leading-[30px] tracking-[0.01em] text-ink-heading"
      >
        <ForgotPasswordForm />
      </AuthShell>
    </GuestOnlyRoute>
  );
}
