export const MODEL_ERROR_MESSAGES = {
  nameRequired: 'Name is required',
  allocationsRequired: 'At least one allocation is required',
  allocationTickerRequired: 'Each allocation must have a ticker',
  allocationTargetPercentInvalid:
    'Each allocation target percent must be a positive number',
  duplicateTicker: 'Each ticker can only appear once in a model',
  percentagesMustSumTo100: 'Allocation percentages must sum to exactly 100',
  updateRequiresField: 'At least one field is required',
  modelNotFound: 'Model not found',
} as const;
