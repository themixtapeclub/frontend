// components/price.tsx
import clsx from 'clsx';

const Price = ({
  amount,
  className,
  currencyCode = 'USD',
  currencyCodeClassName,
  removeZeroDecimals = true,
  ...props
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
  removeZeroDecimals?: boolean;
} & React.ComponentProps<'p'>) => {
  const numericAmount = parseFloat(amount);

  // Check if amount is a whole number
  const isWholeNumber = numericAmount % 1 === 0;

  // Format the price
  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: removeZeroDecimals && isWholeNumber ? 0 : 2,
    maximumFractionDigits: 2
  }).format(numericAmount);

  return (
    <p suppressHydrationWarning={true} className={className} {...props}>
      {formattedPrice}
      <span className={clsx('ml-1 inline', currencyCodeClassName)}>{currencyCode}</span>
    </p>
  );
};

export default Price;
