'use client';

import Link from 'next/link';

import { FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { useLoginFormFields, useLoginMutation } from '../hooks';

export default function LoginForm() {
  const fields = useLoginFormFields();
  const mutation = useLoginMutation();

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Login failed'
    : null;

  return (
    <fieldset
      disabled={mutation.isPending}
      className="border-none p-0 m-0 min-w-0"
    >
      <p className="mb-[30px] text-[18px] font-bold tracking-[0.01em] text-brand">
        <Link href={APP_ROUTES.register} className="hover:underline">
          I&apos;m new here. Register and start tracking.
        </Link>
      </p>

      {error && (
        <p
          className="mb-4 rounded-[var(--radius-card)] border border-destructive-line bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive-text"
          role="alert"
        >
          {error}
        </p>
      )}
      <FormBuilder<Record<string, string>>
        fields={fields}
        onSubmit={handleSubmit}
        formClassName="flex flex-col"
        submitLabel={
          mutation.isPending ? 'SIGNING IN...' : 'SIGN IN'
        }
        submitButtonClassName="mt-[2px] h-[47px] w-full rounded-[var(--radius-control)] bg-brand-accent px-4 text-center text-[20px] font-bold tracking-[0.01em] text-brand-accent-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="mt-[31px] text-center text-[18px] font-bold tracking-[0.01em] text-brand">
        <Link
          href={APP_ROUTES.forgotPassword}
          className="hover:underline"
        >
          Forgot password? Click to reset it.
        </Link>
      </p>
    </fieldset>
  );
}
