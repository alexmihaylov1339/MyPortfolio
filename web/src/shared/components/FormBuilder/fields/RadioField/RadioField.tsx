import { RadioFieldConfig } from '../types';

import styles from './RadioField.module.scss';

interface RadioFieldProps {
  config: RadioFieldConfig;
  disabled?: boolean;
}

export default function RadioField({ config, disabled }: RadioFieldProps) {
  return (
    <div className={styles.field}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {config.label}
          {config.required && <span className={styles.required}> *</span>}
        </legend>
        {config.options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${config.name}-${option.value}`}
            className={styles.option}
          >
            <input
              type="radio"
              id={`${config.name}-${option.value}`}
              name={config.name}
              value={option.value}
              required={config.required}
              disabled={disabled || config.disabled}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

