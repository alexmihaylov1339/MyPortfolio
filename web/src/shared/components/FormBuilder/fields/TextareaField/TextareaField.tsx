import { TextareaFieldConfig } from '../types';

import styles from './TextareaField.module.scss';

interface TextareaFieldProps {
  config: TextareaFieldConfig;
  disabled?: boolean;
}

export default function TextareaField({ config, disabled }: TextareaFieldProps) {
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
      <textarea
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        rows={config.rows || 4}
        cols={config.cols}
        className={
          config.inputClassName
            ? `${styles.textarea} ${config.inputClassName}`
            : styles.textarea
        }
        style={config.inputStyle}
      />
    </div>
  );
}
