import Link from 'next/link';

import { APP_ROUTES } from '@shared/constants';

export default function RebalanceEmptyState() {
  return (
    <div className="rounded-[8px] border border-dashed border-line p-8 text-center">
      <p className="mb-4 text-ink-muted">
        You don&apos;t have a default model portfolio yet. Create one to
        compare it against your real positions.
      </p>
      <Link
        href={APP_ROUTES.newModel}
        className="inline-block rounded-[4px] bg-brand-accent px-[18px] py-[10px] text-sm font-semibold text-white transition hover:opacity-90"
      >
        Create a model
      </Link>
    </div>
  );
}
