'use client';

import { PositionForm } from '@features/positions/form/components';

export default function NewPositionPage() {
  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">Add position</h1>
      <div className="max-w-md">
        <PositionForm mode="create" />
      </div>
    </>
  );
}
