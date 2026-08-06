'use client';

import { useParams } from 'next/navigation';

import { PageLoader, ErrorMessage } from '@shared/components';

import { ModelForm, useModelQuery, toModelFormValues } from '@features/models';

export default function EditModelPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: model, isLoading, isError } = useModelQuery(id);

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold text-ink-strong">
        Edit model
      </h1>
      <div className="max-w-md rounded-[var(--radius-card)] border border-line-soft bg-surface p-6 shadow-card">
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
    </>
  );
}
