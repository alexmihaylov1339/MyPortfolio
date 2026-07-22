'use client';

import { ModelForm } from '@features/models/form/components';

export default function NewModelPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">
        Add model
      </h1>
      <div className="max-w-md rounded-[var(--radius-card)] border border-line-soft bg-surface p-6 shadow-card">
        <ModelForm mode="create" />
      </div>
    </>
  );
}
