import type { BaseFieldConfig } from '../../types';

export interface CheckboxFieldConfig extends Omit<BaseFieldConfig, 'placeholder'> {
  type: 'checkbox';
  defaultChecked?: boolean;
}



