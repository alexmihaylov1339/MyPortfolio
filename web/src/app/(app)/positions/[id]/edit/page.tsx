'use client';

import { useParams } from 'next/navigation';

import { PageLoader, ErrorMessage } from '@shared/components';

import {
  PositionForm,
  DividendsSection,
  usePositionQuery,
  toPositionFormValues,
} from '@features/positions';

export default function EditPositionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: position, isLoading, isError } = usePositionQuery(id);

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">Edit position</h1>
      <div className="max-w-md rounded-[var(--radius-card)] border border-line-soft bg-surface p-6 shadow-card">
        {isLoading && <PageLoader />}
        {isError && <ErrorMessage message="Could not load position." />}
        {position && (
          <>
            <PositionForm
              mode="edit"
              positionId={position.id}
              initialValues={toPositionFormValues(position)}
            />
            <DividendsSection positionId={position.id} currency={position.currency} />
          </>
        )}
      </div>
    </>
  );
}
