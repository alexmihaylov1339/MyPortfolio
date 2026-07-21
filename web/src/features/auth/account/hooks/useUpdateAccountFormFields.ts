import { useMemo } from 'react';
import type { FieldConfig } from '@shared/components';

export function useUpdateAccountFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Display name',
        type: 'text',
        placeholder: 'Your name',
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'you@example.com',
        required: true,
      },
    ],
    []
  );
}
