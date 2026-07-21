import type { EmailFieldConfig } from './types';

import styles from './EmailField.module.scss';

interface EmailFieldProps {
  config: EmailFieldConfig;
  disabled?: boolean;
}

export default function EmailField({ config, disabled }: EmailFieldProps) {
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
        type="email"
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
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
