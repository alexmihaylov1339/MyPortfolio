'use client';

import { useRef, useState, type ChangeEvent } from 'react';

import { useRouter } from 'next/navigation';

import { FormBuilder, TickerAutocomplete } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { useSelectedPortfolio } from '@features/portfolios';

import { useCreatePositionMutation, useUpdatePositionMutation } from '../hooks';
import { usePositionFormFields } from '../hooks/usePositionFormFields';
import { mapFormValuesToPositionInput } from '../mapFormValuesToPositionInput';
import type { PositionStatus } from '../../services';

interface PositionFormProps {
  mode: 'create' | 'edit';
  positionId?: string;
  /** Form-ready values (dates as YYYY-MM-DD). Prepared by the consuming page. */
  initialValues?: Record<string, string>;
}

export default function PositionForm({
  mode,
  positionId,
  initialValues,
}: PositionFormProps) {
  const router = useRouter();
  const { selectedPortfolio, selectedPortfolioId } = useSelectedPortfolio();
  const [status, setStatus] = useState<PositionStatus>(
    (initialValues?.status as PositionStatus | undefined) ?? 'OPEN',
  );
  const [ticker, setTicker] = useState(initialValues?.ticker ?? '');
  const [exchangeMicCode, setExchangeMicCode] = useState<string | null>(
    initialValues?.exchangeMicCode || null,
  );
  // Tracks our own last auto-fill so a later ticker pick can update the name
  // field, while any value the user typed themselves is never overwritten.
  const lastAutoFilledNameRef = useRef('');

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
    const input = mapFormValuesToPositionInput({
      ...values,
      ticker,
      exchangeMicCode: exchangeMicCode ?? '',
    });

    if (mode === 'create') {
      await createMutation.mutateAsync({
        ...input,
        portfolioId: selectedPortfolioId ?? undefined,
      });
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
      {mode === 'create' && selectedPortfolio && (
        <p className="mb-4 text-sm text-ink-muted">
          Adding to portfolio: <span className="font-medium text-ink-strong">{selectedPortfolio.name}</span>
        </p>
      )}
      <FormBuilder<Record<string, string>>
        fields={fields}
        onSubmit={handleSubmit}
        initialValues={initialValues}
        errorMessage={error ?? undefined}
        leadingChildren={
          <TickerAutocomplete
            ticker={ticker}
            micCode={exchangeMicCode}
            onChange={(nextTicker, nextMicCode, matchedName) => {
              setTicker(nextTicker);
              setExchangeMicCode(nextMicCode);

              if (matchedName) {
                const nameInput = document.getElementById(
                  'name',
                ) as HTMLInputElement | null;
                if (
                  nameInput &&
                  (nameInput.value === '' ||
                    nameInput.value === lastAutoFilledNameRef.current)
                ) {
                  nameInput.value = matchedName;
                  lastAutoFilledNameRef.current = matchedName;
                }
              }
            }}
            required
          />
        }
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
