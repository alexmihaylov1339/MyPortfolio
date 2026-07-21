import { useMemo } from 'react';

import type { FieldConfig } from '@/shared/components';

export function useRegisterFormFields(): FieldConfig[] {
  return useMemo<FieldConfig[]>(
    () => [
      {
        name: 'email',
        label: 'Your email',
        type: 'email',
        placeholder: 'Your email',
        required: true,
        fieldWrapperClassName: 'mb-[30px]',
        fieldWrapperStyle: { width: '100%' },
        labelClassName: 'sr-only',
        inputClassName:
          'auth-input h-[47px] w-full rounded-[5px] border border-line-strong bg-white px-[13px] text-[20px] leading-[20px] font-normal tracking-[0.01em] text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.15)] outline-none transition placeholder:text-ink-muted focus:border-[rgba(29,111,165,0.45)] focus:ring-1 focus:ring-[rgba(29,111,165,0.2)]',
        inputStyle: { width: '100%' },
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Password',
        required: true,
        fieldWrapperClassName: 'mb-[30px]',
        fieldWrapperStyle: { width: '100%' },
        labelClassName: 'sr-only',
        inputClassName:
          'auth-input h-[47px] w-full rounded-[5px] border border-line-strong bg-white px-[13px] text-[20px] leading-[20px] font-normal tracking-[0.01em] text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.15)] outline-none transition placeholder:text-ink-muted focus:border-[rgba(29,111,165,0.45)] focus:ring-1 focus:ring-[rgba(29,111,165,0.2)]',
        inputStyle: { width: '100%' },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: 'password',
        placeholder: 'Confirm password',
        required: true,
        fieldWrapperClassName: 'mb-[30px]',
        fieldWrapperStyle: { width: '100%' },
        labelClassName: 'sr-only',
        inputClassName:
          'auth-input h-[47px] w-full rounded-[5px] border border-line-strong bg-white px-[13px] text-[20px] leading-[20px] font-normal tracking-[0.01em] text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.15)] outline-none transition placeholder:text-ink-muted focus:border-[rgba(29,111,165,0.45)] focus:ring-1 focus:ring-[rgba(29,111,165,0.2)]',
        inputStyle: { width: '100%' },
      },
      {
        name: 'name',
        label: 'Display name',
        type: 'text',
        placeholder: 'Display name',
        fieldWrapperClassName: 'mb-[30px]',
        fieldWrapperStyle: { width: '100%' },
        labelClassName: 'sr-only',
        inputClassName:
          'auth-input h-[47px] w-full rounded-[5px] border border-line-strong bg-white px-[13px] text-[20px] leading-[20px] font-normal tracking-[0.01em] text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.15)] outline-none transition placeholder:text-ink-muted focus:border-[rgba(29,111,165,0.45)] focus:ring-1 focus:ring-[rgba(29,111,165,0.2)]',
        inputStyle: { width: '100%' },
      },
    ],
    [],
  );
}
