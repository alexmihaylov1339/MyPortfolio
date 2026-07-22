'use client';

import type { FieldConfig } from '@shared/components';

import {
  ASSET_TYPE_OPTIONS,
  BROKER_OPTIONS,
  CURRENCY_OPTIONS,
  POSITION_STATUS_OPTIONS,
} from '../../constants';
import type { PositionStatus } from '../../services';

function todayAsDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function usePositionFormFields(status: PositionStatus): FieldConfig[] {
  const fields: FieldConfig[] = [
    {
      type: 'select',
      name: 'broker',
      label: 'Broker',
      required: true,
      options: [...BROKER_OPTIONS],
    },
    {
      type: 'text',
      name: 'name',
      label: 'Company name',
    },
    {
      type: 'select',
      name: 'assetType',
      label: 'Asset type',
      options: [...ASSET_TYPE_OPTIONS],
      defaultValue: 'STOCK',
    },
    {
      type: 'number',
      name: 'quantity',
      label: 'Quantity',
      required: true,
      min: 0,
      step: 0.000001,
    },
    {
      type: 'number',
      name: 'averageBuyPrice',
      label: 'Average buy price',
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      type: 'select',
      name: 'currency',
      label: 'Currency',
      options: [...CURRENCY_OPTIONS],
      defaultValue: 'USD',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [...POSITION_STATUS_OPTIONS],
      defaultValue: 'OPEN',
    },
    {
      type: 'date',
      name: 'openedAt',
      label: 'Opened date',
      defaultValue: todayAsDateInputValue(),
    },
  ];

  if (status === 'CLOSED') {
    fields.push({
      type: 'date',
      name: 'closedAt',
      label: 'Closed date',
      required: true,
      defaultValue: todayAsDateInputValue(),
    });
  }

  return fields;
}
