'use client';

import Link from 'next/link';

import { FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import {
  useForgotPasswordFormFields,
  useForgotPasswordMutation,
} from '../hooks';

export default function ForgotPasswordForm() {
  const fields = useForgotPasswordFormFields();
  const mutation = useForgotPasswordMutation();

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate(values.email);
  };

  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Something went wrong'
    : null;

  const success = mutation.isSuccess ? mutation.data : null;

  return (
    <fieldset
      disabled={mutation.isPending}
      className="border-none p-0 m-0 min-w-0"
    >
      {error && (
        <p
          className="mb-4 rounded-[8px] border border-destructive-line bg-destructive-soft px-4 py-3 text-sm font-medium text-destructive-text"
          role="alert"
        >
          {error}
        </p>
      )}
      {success && (
        <div className="mb-4 rounded-[8px] border border-success-line bg-success-soft px-4 py-3">
          <p className="text-sm font-medium text-success-text">{success.message}</p>
          {success.resetToken && (
            <p className="mt-2 break-all text-xs text-info">
              Dev reset link:{' '}
              <Link
                href={APP_ROUTES.resetPasswordWithToken(success.resetToken)}
                className="text-brand underline"
              >
                Reset password
              </Link>
            </p>
          )}
        </div>
      )}
      {!success && (
        <FormBuilder<Record<string, string>>
          fields={fields}
          onSubmit={handleSubmit}
          formClassName="flex flex-col"
          submitLabel={mutation.isPending ? 'SENDING...' : 'Send Reset link'}
          submitButtonClassName="mt-[2px] h-[47px] w-full rounded-[5px] bg-brand-accent px-4 text-center text-[20px] font-bold tracking-[0.01em] text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        />
      )}
      <p className="mt-[31px] text-center text-[18px] font-bold tracking-[0.01em] text-brand">
        <Link href={APP_ROUTES.login} className="hover:underline">
          Back to log in page
        </Link>
      </p>
    </fieldset>
  );
}
