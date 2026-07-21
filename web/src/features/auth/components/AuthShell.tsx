'use client';

import type { ReactNode } from 'react';

import { Roboto_Flex } from 'next/font/google';

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  weight: '400',
});

interface AuthShellProps {
  children: ReactNode;
  description?: ReactNode;
  descriptionClassName?: string;
}

export default function AuthShell({
  children,
  description = 'All your positions in one place',
  descriptionClassName,
}: AuthShellProps) {
  return (
    <div
      className={`${robotoFlex.className} min-h-screen bg-white px-6 py-10 sm:px-8`}
    >
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[404px] items-center">
        <div className="w-full">
          <p className="mb-9 text-[32px] font-bold tracking-[0.01em] text-brand">
            MyPortfolio
          </p>

          <p
            className={
              descriptionClassName ||
              'mb-10 text-[20px] font-bold leading-[20px] tracking-[0.01em] text-ink-heading'
            }
          >
            {description}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
