import type { BaseFieldConfig } from '../../types';

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date';
  min?: string;
  max?: string;
}
