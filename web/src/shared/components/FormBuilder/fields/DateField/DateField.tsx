import type { DateFieldConfig } from './types';

import styles from './DateField.module.scss';

interface DateFieldProps {
  config: DateFieldConfig;
  disabled?: boolean;
}

export default function DateField({ config, disabled }: DateFieldProps) {
  return (
    <div
      className={
        config.fieldWrapperClassName
          ? `${styles.fieldWrapper} ${config.fieldWrapperClassName}`
          : styles.fieldWrapper
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
      <input
        type="date"
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        required={config.required}
        disabled={disabled || config.disabled}
        min={config.min}
        max={config.max}
        className={
          config.inputClassName
            ? `${styles.input} ${config.inputClassName}`
            : styles.input
        }
        style={config.inputStyle}
      />
    </div>
  );
}
