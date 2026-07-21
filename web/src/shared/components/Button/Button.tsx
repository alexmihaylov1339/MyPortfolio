'use client';

import type { ButtonProps } from './types';

const BUTTON_CURSOR_CLASSES = 'cursor-pointer disabled:cursor-not-allowed';

export default function Button({
  children,
  isLoading = false,
  disabled,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${BUTTON_CURSOR_CLASSES} ${className}`.trim()}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
