export interface Product {
  id: string;
  _id?: string;
  title: string;
  name?: string;
  handle?: string;
  price?: number;
  currency?: string;
  description?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  tags?: string[];
  artist?: string | string[];
  label?: string | string[];
  format?: string | string[] | Array<string | { main?: string; sub?: string }>;
  featured?: boolean;
  attributes?: {
    per_customer?: boolean;
    [key: string]: any;
  };
  sanityContent?: SanityContent;
  inMixtapes?: any[];
}

export interface ProductImage {
  id?: string;
  file?: {
    url: string;
    width?: number;
    height?: number;
  };
  url?: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  option_value_ids?: string[];
  price?: number;
  [key: string]: any;
}

export interface ProductOption {
  id: string;
  name: string;
  values?: ProductOptionValue[];
  [key: string]: any;
}

export interface ProductOptionValue {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SanityContent {
  title?: string;
  additionalImages?: ProductImage[];
  inMixtapes?: any[];
  [key: string]: any;
}

export interface MergedProduct extends Product {
  // This ensures MergedProduct has all Product properties
}
