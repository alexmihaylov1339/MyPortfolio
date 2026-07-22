import type { CSSProperties, ReactNode } from 'react';

// Base types shared across all fields
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date';

export interface BaseFieldConfig {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Initial/default value for uncontrolled input rendering */
  defaultValue?: string | number;
  fieldWrapperClassName?: string;
  fieldWrapperStyle?: CSSProperties;
  labelClassName?: string;
  inputClassName?: string;
  inputStyle?: CSSProperties;
}

// Import field types to create union
import type {
  TextFieldConfig,
  EmailFieldConfig,
  PasswordFieldConfig,
  NumberFieldConfig,
  TextareaFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
  RadioFieldConfig,
  DateFieldConfig,
} from './fields/types';

// Union of all field configs
export type FieldConfig =
  | TextFieldConfig
  | EmailFieldConfig
  | PasswordFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig
  | DateFieldConfig;

export interface FormBuilderProps<TFormValues = Record<string, unknown>> {
  fields: FieldConfig[];
  onSubmit: (values: TFormValues) => Promise<unknown> | void;
  submitLabel?: string;
  /** Optional className for submit button styling */
  submitButtonClassName?: string;
  /** Optional delete button visibility (hidden by default) */
  showDeleteButton?: boolean;
  deleteLabel?: string;
  /** Optional className for delete button styling */
  deleteButtonClassName?: string;
  /** Optional delete handler */
  onDelete?: () => Promise<unknown> | void;
  /** Optional external loading state for delete action */
  isDeleting?: boolean;
  formClassName?: string;
  /** Optional initial values mapped by field name */
  initialValues?: Partial<Record<string, unknown>>;
  /** Error message from backend (displayed as-is) */
  errorMessage?: string;
  resetOnSubmit?: boolean;
  leadingAction?: ReactNode;
  actionsContainerClassName?: string;
  /**
   * Extra content rendered inside the real <form>, before the declared
   * fields — for content that needs to appear first in reading order
   * (e.g. a ticker lookup ahead of the rest of a position's fields) but
   * still manages its own state outside FormBuilder's FormData-based
   * field extraction. Not read by handleSubmit's `values`.
   */
  leadingChildren?: ReactNode;
  /**
   * Extra content rendered inside the real <form>, after the declared
   * fields and before the error message/submit row. For content that
   * needs native form participation (Enter-to-submit) but manages its
   * own state outside FormBuilder's FormData-based field extraction —
   * e.g. a repeatable row editor. Not read by handleSubmit's `values`.
   */
  children?: ReactNode;
}
