'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { useCreateModelMutation, useUpdateModelMutation } from '../hooks';
import { mapFormValuesToModelInput } from '../mapFormValuesToModelInput';
import type { ModelFormValues } from '../mapModelToFormValues';
import type { AllocationInput } from '../../services';
import AllocationRowsEditor from './AllocationRowsEditor';

interface ModelFormProps {
  mode: 'create' | 'edit';
  modelId?: string;
  initialValues?: ModelFormValues;
}

const DEFAULT_ROWS: AllocationInput[] = [{ ticker: '', targetPercent: '' }];

export default function ModelForm({
  mode,
  modelId,
  initialValues,
}: ModelFormProps) {
  const router = useRouter();
  const [allocations, setAllocations] = useState<AllocationInput[]>(
    initialValues?.allocations && initialValues.allocations.length > 0
      ? initialValues.allocations
      : DEFAULT_ROWS,
  );

  const createMutation = useCreateModelMutation();
  const updateMutation = useUpdateModelMutation();
  const mutation = mode === 'create' ? createMutation : updateMutation;

  const handleSubmit = async (values: Record<string, string>) => {
    const input = mapFormValuesToModelInput(values, allocations);

    if (mode === 'create') {
      await createMutation.mutateAsync(input);
    } else if (modelId) {
      await updateMutation.mutateAsync({ id: modelId, input });
    }

    router.push(APP_ROUTES.models);
  };

  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Could not save model'
    : null;

  return (
    <FormBuilder<Record<string, string>>
      fields={[
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'checkbox', name: 'isDefault', label: 'Set as default' },
      ]}
      onSubmit={handleSubmit}
      initialValues={
        initialValues
          ? { name: initialValues.name, isDefault: initialValues.isDefault }
          : undefined
      }
      errorMessage={error ?? undefined}
      submitLabel={
        mutation.isPending
          ? 'Saving...'
          : mode === 'create'
            ? 'Create model'
            : 'Save changes'
      }
    >
      <AllocationRowsEditor rows={allocations} onChange={setAllocations} />
    </FormBuilder>
  );
}
