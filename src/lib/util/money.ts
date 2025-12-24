import { isEmpty } from "./isEmpty"
type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}
export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (!currency_code || isEmpty(currency_code)) {
    return amount.toString()
  }
  const isWholeNumber = amount % 1 === 0
  const minDigits = minimumFractionDigits ?? (isWholeNumber ? 0 : 2)
  const maxDigits = maximumFractionDigits ?? (isWholeNumber ? 0 : 2)
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(amount)
}
