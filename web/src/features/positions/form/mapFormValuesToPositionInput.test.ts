import { mapFormValuesToPositionInput } from './mapFormValuesToPositionInput';

describe('mapFormValuesToPositionInput', () => {
  it('sends quantity and averageBuyPrice as strings even when FormBuilder hands back numbers', () => {
    // FormBuilder's NumberField extracts number-type fields as a JS number at
    // runtime, not a string, regardless of the Record<string, string> type
    // param used at the call site. The API's Decimal fields require strings
    // and previously rejected a real submission with 400 "Quantity must be a
    // positive number" because a JSON number was sent instead.
    const values = {
      broker: 'REVOLUT',
      ticker: 'aapl',
      quantity: 10.5 as unknown as string,
      averageBuyPrice: 150.25 as unknown as string,
    };

    const result = mapFormValuesToPositionInput(values);

    expect(result.quantity).toBe('10.5');
    expect(typeof result.quantity).toBe('string');
    expect(result.averageBuyPrice).toBe('150.25');
    expect(typeof result.averageBuyPrice).toBe('string');
  });

  it('normalizes optional empty-string fields to undefined', () => {
    const values = {
      broker: 'IBKR',
      ticker: 'msft',
      quantity: '5',
      averageBuyPrice: '300',
      name: '',
      currency: '',
      status: '',
      openedAt: '',
      closedAt: '',
      exchangeMicCode: '',
    };

    const result = mapFormValuesToPositionInput(values);

    expect(result.name).toBeUndefined();
    expect(result.currency).toBeUndefined();
    expect(result.status).toBeUndefined();
    expect(result.openedAt).toBeUndefined();
    expect(result.closedAt).toBeUndefined();
    expect(result.exchangeMicCode).toBeUndefined();
  });

  it('passes through a selected exchangeMicCode', () => {
    // Set when the user picks a match from the ticker search results,
    // rather than typing free text — disambiguates tickers that collide
    // across companies/exchanges (e.g. "DSN" means different companies
    // in Germany, Indonesia, and the US) so the right instrument gets
    // priced instead of a bare, ambiguous symbol lookup.
    const values = {
      broker: 'REVOLUT',
      ticker: 'DSN',
      quantity: '1',
      averageBuyPrice: '10',
      exchangeMicCode: 'XETR',
    };

    const result = mapFormValuesToPositionInput(values);

    expect(result.exchangeMicCode).toBe('XETR');
  });
});
