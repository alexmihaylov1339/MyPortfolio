'use client';

import { useTransition } from 'react';

import { Button } from '../Button';
import { ErrorMessage } from '../ErrorMessage';
import { Field } from './fields';
import { isNumber, isString, isUndefined } from '@shared/utils';

import type { FormBuilderProps } from './types';

const DEFAULT_SUBMIT_BUTTON_CLASSNAME =
  'mt-2 rounded-[var(--radius-control)] bg-brand-accent px-[18px] py-[10px] text-sm font-semibold text-brand-accent-ink transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-60';

const DEFAULT_DELETE_BUTTON_CLASSNAME =
  'mt-2 rounded-[var(--radius-control)] border border-destructive-line px-[18px] py-[10px] text-sm font-semibold text-destructive-text transition hover:bg-destructive-soft disabled:cursor-not-allowed disabled:opacity-60';

export default function FormBuilder<TFormValues = Record<string, unknown>>({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  submitButtonClassName,
  showDeleteButton = false,
  deleteLabel = 'Delete',
  deleteButtonClassName,
  onDelete,
  isDeleting = false,
  formClassName,
  initialValues,
  errorMessage,
  resetOnSubmit = true,
  leadingAction,
  actionsContainerClassName,
  children,
}: FormBuilderProps<TFormValues>) {
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Extract and validate form values based on field configuration
    const values: Record<string, unknown> = {};

    for (const field of fields) {
      const value = formData.get(field.name);

      // Handle different field types
      if (field.type === 'checkbox') {
        values[field.name] = value === 'on' || value === 'true';
      } else if (field.type === 'number') {
        const numValue = value ? Number(value) : undefined;
        values[field.name] = !isNaN(numValue as number) ? numValue : undefined;
      } else {
        // Text, email, password, textarea, select, etc.
        if (value && isString(value)) {
          values[field.name] = value;
        } else if (field.required) {
          throw new Error(`${field.label || field.name} is required`);
        } else {
          values[field.name] = undefined;
        }
      }
    }

    startTransition(async () => {
      try {
        await onSubmit(values as TFormValues);
      } catch {
        // A rejected onSubmit (e.g. a failed mutation) is surfaced by the
        // caller via its own error state (errorMessage prop). Catch it here
        // so isPending always resolves instead of leaving the submit button
        // stuck, and so the form is not cleared on a failed submission.
        return;
      }
      if (resetOnSubmit) {
        form.reset();
      }
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;

    startDeleteTransition(async () => {
      await onDelete();
    });
  };

  const shouldRenderActionRow = Boolean(
    showDeleteButton || leadingAction || actionsContainerClassName,
  );

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {fields.map((field) => {
        const initialValue = initialValues?.[field.name];
        const resolvedField = {
          ...field,
          ...(field.type === 'checkbox'
            ? { defaultChecked: Boolean(initialValue) }
            : {}),
          ...(field.type !== 'checkbox' && !isUndefined(initialValue)
            ? {
                defaultValue:
                  isString(initialValue) || isNumber(initialValue)
                    ? initialValue
                    : '',
              }
            : {}),
        };
        return <Field key={field.name} config={resolvedField} disabled={isPending} />;
      })}

      {children}

      {errorMessage && <ErrorMessage message={errorMessage} />}

      {shouldRenderActionRow ? (
        <div className={actionsContainerClassName}>
          {leadingAction}
          {showDeleteButton && (
            <Button
              type="button"
              onClick={handleDelete}
              isLoading={isDeleting || isDeletePending}
              className={deleteButtonClassName ?? DEFAULT_DELETE_BUTTON_CLASSNAME}
            >
              {deleteLabel}
            </Button>
          )}
          <Button
            type="submit"
            isLoading={isPending}
            className={submitButtonClassName ?? DEFAULT_SUBMIT_BUTTON_CLASSNAME}
          >
            {submitLabel}
          </Button>
        </div>
      ) : (
        <Button
          type="submit"
          isLoading={isPending}
          className={submitButtonClassName ?? DEFAULT_SUBMIT_BUTTON_CLASSNAME}
        >
          {submitLabel}
        </Button>
      )}
    </form>
  );
}
