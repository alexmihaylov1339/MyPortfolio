interface ExcludedCurrenciesNoteProps {
  currencies: string[];
}

export default function ExcludedCurrenciesNote({
  currencies,
}: ExcludedCurrenciesNoteProps) {
  if (currencies.length === 0) {
    return null;
  }

  return (
    <p className="mb-4 text-sm text-ink-muted">
      This comparison only covers your largest currency. Positions in{' '}
      {currencies.join(', ')} are not reflected here.
    </p>
  );
}
