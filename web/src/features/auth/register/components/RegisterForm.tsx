'use client';

import { useState } from 'react';

import Link from 'next/link';

import { FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { useRegisterFormFields, useRegisterMutation } from '../hooks';

export default function RegisterForm() {
  const fields = useRegisterFormFields();
  const mutation = useRegisterMutation();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (values: Record<string, string>) => {
    setValidationError(null);

    if (values.password !== values.confirmPassword) {
      setValidationError('Passwords do not match');

      return;
    }

    mutation.mutate({
      email: values.email,
      password: values.password,
      name: values.name || undefined,
    });
  };

  const error =
    validationError ||
    (mutation.isError
      ? mutation.error instanceof Error
        ? mutation.error.message
        : 'Registration failed'
      : null);

  return (
    <fieldset
      disabled={mutation.isPending}
      className="border-none p-0 m-0 min-w-0"
    >
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
          mutation.isPending ? 'CREATING ACCOUNT...' : 'START TRACKING'
        }
        submitButtonClassName="mt-[2px] h-[47px] w-full rounded-[var(--radius-control)] bg-brand-accent px-4 text-center text-[20px] font-bold tracking-[0.01em] text-brand-accent-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      />
      <p className="mt-[31px] text-center text-[18px] font-bold tracking-[0.01em] text-brand">
        <Link href={APP_ROUTES.login} className="hover:underline">
          Back to log in page
        </Link>
      </p>
    </fieldset>
  );
}
