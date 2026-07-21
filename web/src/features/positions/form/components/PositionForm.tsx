'use client';

import { useState, type ChangeEvent } from 'react';

import { useRouter } from 'next/navigation';

import { FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import { useCreatePositionMutation, useUpdatePositionMutation } from '../hooks';
import { usePositionFormFields } from '../hooks/usePositionFormFields';
import type {
  Broker,
  AssetType,
  CreatePositionInput,
  PositionStatus,
} from '../../services';

interface PositionFormProps {
  mode: 'create' | 'edit';
  positionId?: string;
  /** Form-ready values (dates as YYYY-MM-DD). Prepared by the consuming page. */
  initialValues?: Record<string, string>;
}

function mapFormValuesToPositionInput(
  values: Record<string, string>,
): CreatePositionInput {
  return {
    broker: values.broker as Broker,
    ticker: values.ticker,
    name: values.name || undefined,
    assetType: (values.assetType as AssetType) || undefined,
    quantity: values.quantity,
    averageBuyPrice: values.averageBuyPrice,
    currency: values.currency || undefined,
    status: (values.status as PositionStatus) || undefined,
    openedAt: values.openedAt || undefined,
    closedAt: values.closedAt || undefined,
  };
}

export default function PositionForm({
  mode,
  positionId,
  initialValues,
}: PositionFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PositionStatus>(
    (initialValues?.status as PositionStatus | undefined) ?? 'OPEN',
  );

  const fields = usePositionFormFields(status);
  const createMutation = useCreatePositionMutation();
  const updateMutation = useUpdatePositionMutation();
  const mutation = mode === 'create' ? createMutation : updateMutation;

  const handleFormChange = (event: ChangeEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof HTMLSelectElement && target.name === 'status') {
      setStatus(target.value as PositionStatus);
    }
  };

  const handleSubmit = async (values: Record<string, string>) => {
    const input = mapFormValuesToPositionInput(values);

    if (mode === 'create') {
      await createMutation.mutateAsync(input);
    } else if (positionId) {
      await updateMutation.mutateAsync({ id: positionId, input });
    }

    router.push(APP_ROUTES.positions);
  };

  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Could not save position'
    : null;

  return (
    <div onChange={handleFormChange}>
      <FormBuilder<Record<string, string>>
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        errorMessage={error ?? undefined}
        submitLabel={
          mutation.isPending
            ? 'Saving...'
            : mode === 'create'
              ? 'Add position'
              : 'Save changes'
        }
      />
    </div>
  );
}
