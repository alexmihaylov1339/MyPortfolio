import type { BaseFieldConfig } from '../../types';

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  rows?: number;
  cols?: number;
}
