'use client';

import { useParams } from 'next/navigation';

import { ProtectedRoute, PageLoader, ErrorMessage } from '@shared/components';

import { ModelForm } from '@features/models/form/components';
import { useModelQuery } from '@features/models/form/hooks';
import { toModelFormValues } from '@features/models/form/mapModelToFormValues';

export default function EditModelPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: model, isLoading, isError } = useModelQuery(id);

  return (
    <ProtectedRoute>
      <main className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-ink-strong">
          Edit model
        </h1>
        <div className="max-w-md">
          {isLoading && <PageLoader />}
          {isError && <ErrorMessage message="Could not load model." />}
          {model && (
            <ModelForm
              mode="edit"
              modelId={model.id}
              initialValues={toModelFormValues(model)}
            />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
