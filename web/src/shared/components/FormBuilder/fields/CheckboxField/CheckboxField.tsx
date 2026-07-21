import { CheckboxFieldConfig } from '../types';

import styles from './CheckboxField.module.scss';

interface CheckboxFieldProps {
  config: CheckboxFieldConfig;
  disabled?: boolean;
}

export default function CheckboxField({ config, disabled }: CheckboxFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={config.name} className={styles.label}>
        <input
          type="checkbox"
          id={config.name}
          name={config.name}
          defaultChecked={config.defaultChecked}
          required={config.required}
          disabled={disabled || config.disabled}
        />
        {config.label}
        {config.required && <span className={styles.required}>*</span>}
      </label>
    </div>
  );
}

