import { SelectFieldConfig } from '../types';

import styles from './SelectField.module.scss';

interface SelectFieldProps {
  config: SelectFieldConfig;
  disabled?: boolean;
}

export default function SelectField({ config, disabled }: SelectFieldProps) {
  return (
    <div
      className={
        config.fieldWrapperClassName
          ? `${styles.field} ${config.fieldWrapperClassName}`
          : styles.field
      }
      style={config.fieldWrapperStyle}
    >
      <label
        htmlFor={config.name}
        className={
          config.labelClassName
            ? `${styles.label} ${config.labelClassName}`
            : styles.label
        }
      >
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <select
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        required={config.required}
        disabled={disabled || config.disabled}
        className={
          config.inputClassName
            ? `${styles.select} ${config.inputClassName}`
            : styles.select
        }
        style={config.inputStyle}
      >
        {/* Empty option - label is already translated */}
        <option value="">{config.label}</option>
        {config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
