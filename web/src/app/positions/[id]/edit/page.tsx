'use client';

import { useParams } from 'next/navigation';

import { ProtectedRoute, PageLoader, ErrorMessage } from '@shared/components';

import { PositionForm } from '@features/positions/form/components';
import { usePositionQuery } from '@features/positions/form/hooks';
import { toPositionFormValues } from '@features/positions/form/positionFormValues';

export default function EditPositionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: position, isLoading, isError } = usePositionQuery(id);

  return (
    <ProtectedRoute>
      <main className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-ink-strong">Edit position</h1>
        <div className="max-w-md">
          {isLoading && <PageLoader />}
          {isError && <ErrorMessage message="Could not load position." />}
          {position && (
            <PositionForm
              mode="edit"
              positionId={position.id}
              initialValues={toPositionFormValues(position)}
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
