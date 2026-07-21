import { NumberFieldConfig } from '../types';

import styles from './NumberField.module.scss';

interface NumberFieldProps {
  config: NumberFieldConfig;
  disabled?: boolean;
}

export default function NumberField({ config, disabled }: NumberFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={config.name} className={styles.label}>
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <input
        type="number"
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        min={config.min}
        max={config.max}
        step={config.step}
        className={styles.input}
      />
    </div>
  );
}
