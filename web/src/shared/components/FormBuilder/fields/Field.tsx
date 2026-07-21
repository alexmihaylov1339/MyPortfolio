import {
  TextField,
  EmailField,
  PasswordField,
  NumberField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioField,
} from './';

import type { FieldConfig } from '../types';

interface FieldProps {
  config: FieldConfig;
  disabled?: boolean;
}

export default function Field({ config, disabled }: FieldProps) {
  switch (config.type) {
    case 'text':
      return <TextField config={config} disabled={disabled} />;
    case 'email':
      return <EmailField config={config} disabled={disabled} />;
    case 'password':
      return <PasswordField config={config} disabled={disabled} />;
    case 'number':
      return <NumberField config={config} disabled={disabled} />;
    case 'textarea':
      return <TextareaField config={config} disabled={disabled} />;
    case 'select':
      return <SelectField config={config} disabled={disabled} />;
    case 'checkbox':
      return <CheckboxField config={config} disabled={disabled} />;
    case 'radio':
      return <RadioField config={config} disabled={disabled} />;
    default:
      return null;
  }
}



