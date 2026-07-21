import { useMemo } from 'react';

import type { FieldConfig } from '@/shared/components';

export function useResetPasswordFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        name: 'password',
        label: 'New password',
        type: 'password',
        placeholder: 'At least 6 characters',
        required: true,
      },
      {
        name: 'confirmPassword',
        label: 'Confirm new password',
        type: 'password',
        placeholder: 'Repeat your password',
        required: true,
      },
    ],
    [],
  );
}
