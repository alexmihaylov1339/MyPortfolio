'use client';

import { useMemo } from 'react';

import { FormBuilder } from '@shared/components';

import {
  useGetCurrentUser,
  useUpdateAccountFormFields,
  useUpdateAccountMutation,
} from '../hooks';

export default function UpdateAccountForm() {
  const fields = useUpdateAccountFormFields();
  const { data: user, isLoading, isError, error } = useGetCurrentUser();
  const mutation = useUpdateAccountMutation();

  const initialValues = useMemo(
    () =>
      user
        ? {
            name: user.name ?? '',
            email: user.email ?? '',
          }
        : undefined,
    [user],
  );

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate({
      name: values.name || undefined,
      email: values.email?.trim() || undefined,
    });
  };

  if (isLoading) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive-text" role="alert">
        {error instanceof Error ? error.message : 'Failed to load account'}
      </p>
    );
  }

  const submitError = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Update failed'
    : null;

  return (
    <fieldset
      disabled={mutation.isPending}
      className="border-none p-0 m-0 min-w-0"
    >
      {submitError && (
        <p className="mb-4 text-sm text-destructive-text" role="alert">
          {submitError}
        </p>
      )}
      <FormBuilder<Record<string, string>>
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={mutation.isPending ? 'Updating…' : 'Update account'}
      />
    </fieldset>
  );
}
