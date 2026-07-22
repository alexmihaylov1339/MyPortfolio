import type { AllocationInput, CreateModelInput } from '../services';

export function mapFormValuesToModelInput(
  values: Record<string, string>,
  allocations: AllocationInput[],
): CreateModelInput {
  return {
    name: values.name,
    // FormBuilder's CheckboxField returns a JS boolean at runtime (like
    // NumberField returns a number for positions) despite the
    // Record<string, string> type param here.
    isDefault: Boolean(values.isDefault),
    allocations,
  };
}
