import type { BaseFieldConfig } from '../../types';

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  /**
   * Option labels are NOT automatically translated.
   * If using translation keys, translate them before passing to FormBuilder.
   * If options come from backend, pass them as-is.
   */
  options: Array<{ value: string; label: string }>;
}



