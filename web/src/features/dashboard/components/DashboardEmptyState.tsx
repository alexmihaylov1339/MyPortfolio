import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';

export default function DashboardEmptyState() {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line p-8 text-center">
      <p className="mb-4 text-ink-muted">You haven&apos;t added any positions yet.</p>
      <Link
        href={APP_ROUTES.newPosition}
        className="inline-block rounded-[var(--radius-control)] bg-brand-accent px-[18px] py-[10px] text-sm font-semibold text-brand-accent-ink transition hover:opacity-90"
      >
        Add your first position
      </Link>
    </div>
  );
}
