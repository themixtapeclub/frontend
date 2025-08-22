// @ts-nocheck
export type Maybe<T> = T | null;

export type ProductOptionValue = {
  id: string;
  name: string;
  description?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  variant?: boolean;
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  name?: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  optionValueIds: string[];
  availableForSale?: boolean;
  stockLevel?: number;
};

export type Product = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  images?: Array<{ file?: { url?: string } }>;
  options: ProductOption[];
  variants: {
    results: ProductVariant[];
    count?: number;
  };
  tags?: string[];
  categories?: Array<{ id: string; name: string }>;
};

export type User = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateCreated?: string;
};

export type Account = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailOptin?: boolean;
  orders?: { results: any[] };
};

// Legacy exports for compatibility
export const any = {} as any;
export type Any = any;
