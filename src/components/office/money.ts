/** Lossless presentation tokens; no conversion or rounding beyond formatAmount's contract. */
export function officeMoneyTokens(
  amount: number,
  currency: string,
  locale: string,
  arabicIndicDigits: boolean,
) {
  const parts = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency,
    currencyDisplay: 'code',
    numberingSystem: arabicIndicDigits ? 'arab' : 'latn',
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).formatToParts(amount);
  const tokens: { kind: 'amount' | 'currency' | 'literal'; value: string }[] = [
    { kind: 'literal', value: '\u2068' },
  ];
  for (const part of parts) {
    const kind =
      part.type === 'currency' ? 'currency' : part.type === 'literal' ? 'literal' : 'amount';
    const previous = tokens.at(-1);
    if (previous?.kind === kind) previous.value += part.value;
    else tokens.push({ kind, value: part.value });
  }
  tokens.push({ kind: 'literal', value: '\u2069' });
  return tokens;
}
