export const PORTFOLIO_ERROR_MESSAGES = {
  nameRequired: 'Name is required',
  updateRequiresField: 'At least one field is required',
  portfolioNotFound: 'Portfolio not found',
  cannotDeleteLastPortfolio:
    'Cannot delete your only portfolio — every account needs at least one',
  cannotUnsetDefault:
    'Set another portfolio as default instead of unsetting this one — there must always be exactly one default',
} as const;
