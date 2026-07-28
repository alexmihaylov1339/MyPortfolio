'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { APP_ROUTES } from '@shared/constants';
import { PortfolioSwitcher } from '@features/portfolios/components';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';

const NAV_LINKS = [
  { href: APP_ROUTES.dashboard, label: 'Dashboard' },
  { href: APP_ROUTES.positions, label: 'Positions' },
  { href: APP_ROUTES.models, label: 'Models' },
  { href: APP_ROUTES.rebalance, label: 'Rebalance' },
  { href: APP_ROUTES.account, label: 'Account' },
] as const;

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-line-nav bg-surface-nav">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <span className="text-sm font-semibold text-brand-ink [font-family:var(--font-display)]">
          MyPortfolio
        </span>
        <PortfolioSwitcher />
        <ul className="flex gap-5">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    isActive
                      ? 'text-sm font-semibold text-brand'
                      : 'text-sm font-medium text-ink-muted transition hover:text-brand'
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
