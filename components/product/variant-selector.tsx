// components/product/variant-selector.tsx

'use client';

import clsx from 'clsx';
import { createUrl } from 'lib/utils/core';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type OptionValue = {
  id: string;
  name: string;
};

type Option = {
  id: string;
  name: string;
  variant?: boolean;
  values: OptionValue[];
};

type Variant = {
  id: string;
  optionValueIds: string[];
};

type Combination = {
  id: string;
  availableForSale: boolean;
  params: URLSearchParams;
  [key: string]: string | boolean | URLSearchParams;
};

type ParamsMap = {
  [key: string]: string;
};

function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

export function VariantSelector({
  options,
  variants,
  stockPurchasable
}: {
  options: Option[] | null | undefined;
  variants: Variant[] | null | undefined;
  stockPurchasable: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const searchParams = useSearchParams();

  const safeOptions = safeArray(options);
  const safeVariants = safeArray(variants);

  const hasNoOptionsOrJustOneOption =
    !safeOptions ||
    !safeOptions.length ||
    (safeOptions.length === 1 && safeArray(safeOptions[0]?.values).length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  const variantParamsMap: ParamsMap = Object.fromEntries(
    Array.from(currentParams.entries()).filter(([key, value]) =>
      safeOptions.find(
        (option) =>
          option?.variant &&
          option?.name?.toLowerCase() === key &&
          safeArray(option?.values).find((v) => v?.name === value)
      )
    )
  );

  const paramsMap: ParamsMap = Object.fromEntries(
    Array.from(currentParams.entries()).filter(([key, value]) =>
      safeOptions.find(
        (option) =>
          option?.name?.toLowerCase() === key &&
          safeArray(option?.values).find((v) => v?.name === value)
      )
    )
  );

  const combinations: Combination[] = safeVariants.map((variant) => {
    const optimized: Combination = {
      id: variant?.id || '',
      availableForSale: true,
      params: new URLSearchParams()
    };

    const optionValueIds = safeArray(variant?.optionValueIds);

    optionValueIds.forEach((selectedOptionValueID) => {
      if (!selectedOptionValueID) return;

      const selectedOption = safeOptions.find((option) =>
        safeArray(option?.values).find((value) => value?.id === selectedOptionValueID)
      );

      const selectedOptionValue = selectedOption
        ? safeArray(selectedOption.values).find((value) => value?.id === selectedOptionValueID)
        : null;

      if (!selectedOption || !selectedOptionValue) return;

      const name = selectedOption.name?.toLowerCase();
      if (name && selectedOptionValue?.name) {
        optimized[name] = selectedOptionValue.name;
        optimized.params.set(name, selectedOptionValue.name);
      }
    });

    return optimized;
  });

  if (safeVariants.length === 0 && safeOptions.length > 0) {
    safeOptions.forEach((option) => {
      const optionValues = safeArray(option?.values);
      optionValues.forEach((value) => {
        if (value?.id && value?.name) {
          const combination: Combination = {
            id: value.id,
            availableForSale: true,
            params: new URLSearchParams(),
            [option.name?.toLowerCase() || 'value']: value.name
          };
          combination.params.set(option.name?.toLowerCase() || 'value', value.name);
          combinations.push(combination);
        }
      });
    });
  }

  return safeOptions
    .map((option) => {
      if (!option?.id || !option?.name) {
        return null;
      }

      const optionValues = safeArray(option.values);

      if (optionValues.length === 0) {
        return null;
      }

      return (
        <dl className="mb-8" key={option.id}>
          {option.name.toLowerCase() !== 'value' && (
            <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
          )}
          <dd className="flex flex-wrap gap-3">
            {optionValues
              .map((value) => {
                if (!value?.id || !value?.name) {
                  return null;
                }

                const optionNameLowerCase = option.name.toLowerCase();
                const optionSearchParams = new URLSearchParams(searchParams.toString());
                optionSearchParams.set(optionNameLowerCase, value.name);
                const optionUrl = createUrl(pathname, optionSearchParams);

                const filtered = Array.from(optionSearchParams.entries()).filter(([key, value]) =>
                  safeOptions.find(
                    (option) =>
                      option?.name?.toLowerCase() === key &&
                      safeArray(option?.values).find((a) => a?.name === value)
                  )
                );

                const isAvailableForSale =
                  combinations.length > 0
                    ? combinations.find((combination) =>
                        filtered.every(
                          ([key, value]) =>
                            combination[key] === value && combination.availableForSale
                        )
                      )
                    : true;

                const isActive = option.variant
                  ? searchParams.get(optionNameLowerCase) === value.name
                  : paramsMap[option.name.toLowerCase()] === value.name;

                return (
                  <button
                    key={value.id}
                    aria-disabled={!isAvailableForSale}
                    disabled={!isAvailableForSale}
                    onClick={() => {
                      router.replace(optionUrl, { scroll: false });
                    }}
                    title={`${option.name} ${value.name}${
                      !isAvailableForSale ? ' (Out of Stock)' : ''
                    }`}
                    className={clsx(
                      'flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900',
                      {
                        'cursor-default ring-2 ring-blue-600': isActive,
                        'ring-1 ring-transparent transition duration-300 ease-in-out hover:scale-110 hover:ring-blue-600 ':
                          !isActive && isAvailableForSale,
                        'relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 ring-1 ring-neutral-300 before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 before:dark:bg-neutral-700':
                          !isAvailableForSale
                      }
                    )}
                  >
                    {value.name}
                  </button>
                );
              })
              .filter(Boolean)}
          </dd>
        </dl>
      );
    })
    .filter(Boolean);
}
