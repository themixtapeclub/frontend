// @ts-nocheck
import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import { print } from 'graphql'
import gql from 'graphql-tag';
export type Maybe<T> = T;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  SafeNumber: { input: any; output: any; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addAccountAddress: Maybe<SwellAccountAddress>;
  addAccountCard: Maybe<SwellAccountCard>;
  addCartItem: Maybe<SwellCart>;
  addSubscriptionItem: Maybe<SwellSubscriptionItem>;
  applyCoupon: Maybe<SwellCart>;
  applyGiftcard: Maybe<SwellCart>;
  createAccount: Maybe<SwellAccount>;
  createSubscription: Maybe<SwellSubscription>;
  deleteAccountAddress: Maybe<SwellAccountAddress>;
  deleteAccountCard: Maybe<SwellAccountCard>;
  deleteCartItem: Maybe<SwellCart>;
  deleteSubscriptionItem: Maybe<SwellSubscriptionItem>;
  loginAccount: Maybe<SuccessfulResponse>;
  logoutAccount: Maybe<SuccessfulResponse>;
  recoverAccount: Maybe<SuccessfulResponse>;
  removeCoupon: Maybe<SwellCart>;
  removeGiftcard: Maybe<SwellCart>;
  sendAccountRecovery: Maybe<SuccessfulResponse>;
  submitCartOrder: Maybe<SwellOrder>;
  updateAccount: Maybe<SwellAccount>;
  updateAccountAddress: Maybe<SwellAccountAddress>;
  updateAccountCard: Maybe<SwellAccountCard>;
  updateCart: Maybe<SwellCart>;
  updateCartItem: Maybe<SwellCart>;
  updateSubscription: Maybe<SwellSubscription>;
  updateSubscriptionItem: Maybe<SwellSubscriptionItem>;
};


export type MutationAddAccountAddressArgs = {
  input: InputMaybe<SwellAccountAddressInput>;
};


export type MutationAddAccountCardArgs = {
  input: InputMaybe<SwellAccountCardInput>;
};


export type MutationAddCartItemArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  input: InputMaybe<SwellCartItemInput>;
};


export type MutationAddSubscriptionItemArgs = {
  input: InputMaybe<SwellSubscriptionItemInput>;
  subscriptionId: InputMaybe<Scalars['String']['input']>;
};


export type MutationApplyCouponArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  code: InputMaybe<Scalars['String']['input']>;
};


export type MutationApplyGiftcardArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  code: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateAccountArgs = {
  input: InputMaybe<SwellAccountInput>;
};


export type MutationCreateSubscriptionArgs = {
  input: InputMaybe<SwellSubscriptionInput>;
};


export type MutationDeleteAccountAddressArgs = {
  addressId: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteAccountCardArgs = {
  cardId: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteCartItemArgs = {
  itemId: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteSubscriptionItemArgs = {
  itemId: InputMaybe<Scalars['String']['input']>;
  subscriptionId: InputMaybe<Scalars['String']['input']>;
};


export type MutationLoginAccountArgs = {
  email: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  passwordToken: InputMaybe<Scalars['String']['input']>;
};


export type MutationRecoverAccountArgs = {
  password: InputMaybe<Scalars['String']['input']>;
  passwordResetKey: InputMaybe<Scalars['String']['input']>;
};


export type MutationRemoveGiftcardArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  giftcardId: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendAccountRecoveryArgs = {
  email: InputMaybe<Scalars['String']['input']>;
  passwordResetUrl: InputMaybe<Scalars['String']['input']>;
};


export type MutationSubmitCartOrderArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateAccountArgs = {
  input: InputMaybe<SwellAccountInput>;
};


export type MutationUpdateAccountAddressArgs = {
  addressId: InputMaybe<Scalars['String']['input']>;
  input: InputMaybe<SwellAccountAddressInput>;
};


export type MutationUpdateAccountCardArgs = {
  cardId: InputMaybe<Scalars['String']['input']>;
  input: InputMaybe<SwellAccountCardInput>;
};


export type MutationUpdateCartArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  input: InputMaybe<SwellCartInput>;
};


export type MutationUpdateCartItemArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  input: InputMaybe<SwellCartItemInput>;
  itemId: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateSubscriptionArgs = {
  id: InputMaybe<Scalars['String']['input']>;
  input: InputMaybe<SwellSubscriptionInput>;
};


export type MutationUpdateSubscriptionItemArgs = {
  input: InputMaybe<SwellSubscriptionItemInput>;
  itemId: InputMaybe<Scalars['String']['input']>;
  subscriptionId: InputMaybe<Scalars['String']['input']>;
};

export type Page = {
  __typename?: 'Page';
  end: Maybe<Scalars['Int']['output']>;
  number: Maybe<Scalars['Int']['output']>;
  start: Maybe<Scalars['Int']['output']>;
};

export type ProductPricing = {
  accountId: InputMaybe<Scalars['String']['input']>;
  quantity: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  account: Maybe<SwellAccount>;
  attributeById: Maybe<SwellAttribute>;
  attributes: Maybe<SwellAttributes>;
  cart: Maybe<SwellCart>;
  categories: Maybe<SwellCategories>;
  categoryById: Maybe<SwellCategory>;
  categoryBySlug: Maybe<SwellCategory>;
  contentPageById: Maybe<SwellContentPage>;
  contentPageBySlug: Maybe<SwellContentPage>;
  contentPages: Maybe<SwellContentPages>;
  menuSettings: Maybe<SwellSettingsMenus>;
  orderById: Maybe<SwellOrder>;
  orderByNumber: Maybe<SwellOrder>;
  orders: Maybe<SwellOrders>;
  paymentSettings: Maybe<SwellSettingsPayments>;
  productById: Maybe<SwellProduct>;
  productBySlug: Maybe<SwellProduct>;
  products: Maybe<SwellProducts>;
  session: Maybe<Session>;
  storeSettings: Maybe<SwellSettings>;
  subscriptionById: Maybe<SwellSubscription>;
  subscriptionSettings: Maybe<SwellSettingsSubscriptions>;
  subscriptions: Maybe<SwellSubscriptions>;
};


export type QueryAccountArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type QueryAttributeByIdArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
};


export type QueryAttributesArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};


export type QueryCartArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoriesArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};


export type QueryCategoryByIdArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoryBySlugArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
};


export type QueryContentPageByIdArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  _preview: InputMaybe<Scalars['Boolean']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
};


export type QueryContentPageBySlugArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  _preview: InputMaybe<Scalars['Boolean']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
};


export type QueryContentPagesArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  _preview: InputMaybe<Scalars['Boolean']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};


export type QueryMenuSettingsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrderByIdArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrderByNumberArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  number: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrdersArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};


export type QueryPaymentSettingsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductByIdArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  _pricing: InputMaybe<ProductPricing>;
  categories: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  category: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductBySlugArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  _pricing: InputMaybe<ProductPricing>;
  categories: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  category: InputMaybe<Scalars['String']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  _pricing: InputMaybe<ProductPricing>;
  categories: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  category: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};


export type QueryStoreSettingsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubscriptionByIdArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubscriptionSettingsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


export type QuerySubscriptionsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};

export type Session = {
  __typename?: 'Session';
  accountId: Maybe<Scalars['String']['output']>;
  cartId: Maybe<Scalars['String']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  publicKey: Maybe<Scalars['String']['output']>;
};

export type SuccessfulResponse = {
  __typename?: 'SuccessfulResponse';
  success: Maybe<Scalars['Boolean']['output']>;
};

/** Customer */
export type SwellAccount = {
  __typename?: 'SwellAccount';
  /** Stored addresses used by an account */
  addresses: Maybe<SwellAccountsAddresses>;
  balance: Maybe<Scalars['SafeNumber']['output']>;
  /** Default account billing information */
  billing: Maybe<SwellAccountBilling>;
  /** Stored credit cards used by an account */
  cards: Maybe<SwellAccountsCards>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  dateFirstOrder: Maybe<Scalars['DateTime']['output']>;
  dateLastOrder: Maybe<Scalars['DateTime']['output']>;
  email: Maybe<Scalars['String']['output']>;
  emailOptin: Maybe<Scalars['Boolean']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  group: Maybe<Scalars['String']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  /** Account Name */
  name: Maybe<Scalars['String']['output']>;
  orderCount: Maybe<Scalars['Int']['output']>;
  orderValue: Maybe<Scalars['SafeNumber']['output']>;
  orders: Maybe<Array<Maybe<SwellOrder>>>;
  phone: Maybe<Scalars['String']['output']>;
  /** Default account shipping information */
  shipping: Maybe<SwellAccountShipping>;
  subscriptions: Maybe<Array<Maybe<SwellSubscription>>>;
  /** Account Type */
  type: Maybe<Scalars['String']['output']>;
  vatNumber: Maybe<Scalars['String']['output']>;
};


/** Customer */
export type SwellAccountOrdersArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


/** Customer */
export type SwellAccountSubscriptionsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** Stored addresses used by an account */
export type SwellAccountAddress = {
  __typename?: 'SwellAccountAddress';
  active: Maybe<Scalars['Boolean']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  dateUpdated: Maybe<Scalars['DateTime']['output']>;
  fingerprint: Maybe<Scalars['String']['output']>;
  /** First Name */
  firstName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  /** Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parent: Maybe<SwellAccount>;
  parentId: Maybe<Scalars['ID']['output']>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};


/** Stored addresses used by an account */
export type SwellAccountAddressParentArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

export type SwellAccountAddressInput = {
  active: InputMaybe<Scalars['Boolean']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  dateCreated: InputMaybe<Scalars['DateTime']['input']>;
  dateUpdated: InputMaybe<Scalars['DateTime']['input']>;
  fingerprint: InputMaybe<Scalars['String']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  parentId: InputMaybe<Scalars['ID']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

/** Default account billing information */
export type SwellAccountBilling = {
  __typename?: 'SwellAccountBilling';
  accountCardId: Maybe<Scalars['ID']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  /** Payment Card */
  card: Maybe<SwellAccountBillingCard>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Billing First Name */
  firstName: Maybe<Scalars['String']['output']>;
  /** Billing Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Payment Method */
  method: Maybe<Scalars['String']['output']>;
  /** Billing Name */
  name: Maybe<Scalars['String']['output']>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

/** Payment Card */
export type SwellAccountBillingCard = {
  __typename?: 'SwellAccountBillingCard';
  addressCheck: Maybe<Scalars['String']['output']>;
  brand: Maybe<Scalars['String']['output']>;
  cvcCheck: Maybe<Scalars['String']['output']>;
  expMonth: Maybe<Scalars['Int']['output']>;
  expYear: Maybe<Scalars['Int']['output']>;
  gateway: Maybe<Scalars['String']['output']>;
  last4: Maybe<Scalars['String']['output']>;
  test: Maybe<Scalars['Boolean']['output']>;
  token: Maybe<Scalars['String']['output']>;
  zipCheck: Maybe<Scalars['String']['output']>;
};

export type SwellAccountBillingCardInput = {
  addressCheck: InputMaybe<Scalars['String']['input']>;
  brand: InputMaybe<Scalars['String']['input']>;
  cvcCheck: InputMaybe<Scalars['String']['input']>;
  expMonth: InputMaybe<Scalars['Int']['input']>;
  expYear: InputMaybe<Scalars['Int']['input']>;
  gateway: InputMaybe<Scalars['String']['input']>;
  last4: InputMaybe<Scalars['String']['input']>;
  test: InputMaybe<Scalars['Boolean']['input']>;
  token: InputMaybe<Scalars['String']['input']>;
  zipCheck: InputMaybe<Scalars['String']['input']>;
};

export type SwellAccountBillingInput = {
  accountCardId: InputMaybe<Scalars['ID']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  card: InputMaybe<SwellAccountBillingCardInput>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  method: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

/** Stored credit cards used by an account */
export type SwellAccountCard = {
  __typename?: 'SwellAccountCard';
  active: Maybe<Scalars['Boolean']['output']>;
  addressCheck: Maybe<Scalars['String']['output']>;
  billing: Maybe<SwellAccountCardBilling>;
  brand: Maybe<Scalars['String']['output']>;
  cvcCheck: Maybe<Scalars['String']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  dateUpdated: Maybe<Scalars['DateTime']['output']>;
  expMonth: Maybe<Scalars['Int']['output']>;
  expYear: Maybe<Scalars['Int']['output']>;
  fingerprint: Maybe<Scalars['String']['output']>;
  gateway: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  /** Last 4 Digits */
  last4: Maybe<Scalars['String']['output']>;
  parent: Maybe<SwellAccount>;
  parentId: Maybe<Scalars['ID']['output']>;
  test: Maybe<Scalars['Boolean']['output']>;
  token: Maybe<Scalars['String']['output']>;
  zipCheck: Maybe<Scalars['String']['output']>;
};


/** Stored credit cards used by an account */
export type SwellAccountCardParentArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

export type SwellAccountCardBilling = {
  __typename?: 'SwellAccountCardBilling';
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  /** Billing Company Name */
  company: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Billing Email */
  email: Maybe<Scalars['String']['output']>;
  /** Billing First Name */
  firstName: Maybe<Scalars['String']['output']>;
  /** Billing Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Billing Name */
  name: Maybe<Scalars['String']['output']>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  vatNumber: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellAccountCardBillingInput = {
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  city: InputMaybe<Scalars['String']['input']>;
  company: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  vatNumber: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

export type SwellAccountCardInput = {
  active: InputMaybe<Scalars['Boolean']['input']>;
  addressCheck: InputMaybe<Scalars['String']['input']>;
  billing: InputMaybe<SwellAccountCardBillingInput>;
  brand: InputMaybe<Scalars['String']['input']>;
  cvcCheck: InputMaybe<Scalars['String']['input']>;
  dateCreated: InputMaybe<Scalars['DateTime']['input']>;
  dateUpdated: InputMaybe<Scalars['DateTime']['input']>;
  expMonth: InputMaybe<Scalars['Int']['input']>;
  expYear: InputMaybe<Scalars['Int']['input']>;
  fingerprint: InputMaybe<Scalars['String']['input']>;
  gateway: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  last4: InputMaybe<Scalars['String']['input']>;
  parentId: InputMaybe<Scalars['ID']['input']>;
  test: InputMaybe<Scalars['Boolean']['input']>;
  token: InputMaybe<Scalars['String']['input']>;
  zipCheck: InputMaybe<Scalars['String']['input']>;
};

export type SwellAccountInput = {
  addresses: InputMaybe<Array<InputMaybe<SwellAccountAddressInput>>>;
  billing: InputMaybe<SwellAccountBillingInput>;
  cards: InputMaybe<Array<InputMaybe<SwellAccountCardInput>>>;
  email: InputMaybe<Scalars['String']['input']>;
  emailOptin: InputMaybe<Scalars['Boolean']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  metadata: InputMaybe<Scalars['JSON']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  passwordResetKey: InputMaybe<Scalars['String']['input']>;
  passwordResetUrl: InputMaybe<Scalars['String']['input']>;
  passwordToken: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  shipping: InputMaybe<SwellAccountShippingInput>;
  type: InputMaybe<Scalars['String']['input']>;
  vatNumber: InputMaybe<Scalars['String']['input']>;
};

/** Default account shipping information */
export type SwellAccountShipping = {
  __typename?: 'SwellAccountShipping';
  accountAddressId: Maybe<Scalars['ID']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Shipping First Name */
  firstName: Maybe<Scalars['String']['output']>;
  /** Shipping Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Shipping Name */
  name: Maybe<Scalars['String']['output']>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellAccountShippingInput = {
  accountAddressId: InputMaybe<Scalars['ID']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

export type SwellAccountsAddresses = {
  __typename?: 'SwellAccountsAddresses';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellAccountAddress>>>;
};

export type SwellAccountsCards = {
  __typename?: 'SwellAccountsCards';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellAccountCard>>>;
};

/** Attribute */
export type SwellAttribute = {
  __typename?: 'SwellAttribute';
  default: Maybe<Scalars['JSON']['output']>;
  filterable: Maybe<Scalars['Boolean']['output']>;
  multi: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  searchable: Maybe<Scalars['Boolean']['output']>;
  type: Maybe<Scalars['String']['output']>;
  values: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  visible: Maybe<Scalars['Boolean']['output']>;
};

export type SwellAttributes = {
  __typename?: 'SwellAttributes';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellAttribute>>>;
};

/** Cart */
export type SwellCart = {
  __typename?: 'SwellCart';
  /** Indicates the cart was abandoned after 3 hours of inactivity. After being marked as abandoned, this field is automatically set back to `false` after an update to items, billing, or shipping info. */
  abandoned: Maybe<Scalars['Boolean']['output']>;
  /** Number of abandoned cart notifications sent to the customer. */
  abandonedNotifications: Maybe<Scalars['Int']['output']>;
  account: Maybe<SwellAccount>;
  /** Amount of customer's account credit applied for initial payment, if applicable. */
  accountCreditAmount: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the customer's account credit is applied to the initial payment. */
  accountCreditApplied: Maybe<Scalars['Boolean']['output']>;
  /** ID of the customer's account. */
  accountId: Maybe<Scalars['ID']['output']>;
  /** Indicates the customer chose to save shipping and billing information to their account when submitting the order. */
  accountInfoSaved: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the customer was logged into their account when placing the order. */
  accountLoggedIn: Maybe<Scalars['Boolean']['output']>;
  authTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** The customer's billing details. Defaults to `account.billing`. Updating billing will also update the corresponding account billing object. */
  billing: Maybe<SwellCartBilling>;
  captureTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Customer-facing unique identifier for the cart used in URLs and for abandoned cart recovery. */
  checkoutId: Maybe<Scalars['String']['output']>;
  /** URL to checkout for the cart, set automatically when the cart has at least `items`, `shipping`, or `billing` details set. Can also be set explicitly when creating or updating the cart for custom checkouts. */
  checkoutUrl: Maybe<Scalars['String']['output']>;
  /** Customer notes provided when placing the order, if any. */
  comments: Maybe<Scalars['String']['output']>;
  coupon: Maybe<SwellCartCoupon>;
  /** Coupon code applied to the cart. */
  couponCode: Maybe<Scalars['String']['output']>;
  /** ID of the coupon applied to the cart. */
  couponId: Maybe<Scalars['ID']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  /** Currency percentage used in calculating the fixed amount. */
  currencyRate: Maybe<Scalars['SafeNumber']['output']>;
  /** Date the cart was or will be marked as abandoned. */
  dateAbandoned: Maybe<Scalars['DateTime']['output']>;
  /** Next date the cart will be marked as abandoned when using a series of abandoned cart recovery notices (advanced cart recovery). */
  dateAbandonedNext: Maybe<Scalars['DateTime']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  /** Total discount amount. */
  discountTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of discounts applied to the cart. */
  discounts: Maybe<Array<Maybe<SwellCartDiscount>>>;
  /** Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html) representing the user's preferred display currency, if applicable. */
  displayCurrency: Maybe<Scalars['String']['output']>;
  /** Locale code representing the user's preferred display locale, if applicable. */
  displayLocale: Maybe<Scalars['String']['output']>;
  /** Indicates the order is intended as a gift for the recipient. */
  gift: Maybe<Scalars['Boolean']['output']>;
  /** Optional message to include with the order when shipping to the recipient. */
  giftMessage: Maybe<Scalars['String']['output']>;
  /** Indicates the cart has at least one line item with     `delivery=giftcard`. */
  giftcardDelivery: Maybe<Scalars['Boolean']['output']>;
  /** Total payment amount applied to the order from `giftcards`. */
  giftcardTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of gift cards applied to the cart. */
  giftcards: Maybe<Array<Maybe<SwellCartGiftcard>>>;
  /** Grand total including items, shipping, and taxes. */
  grandTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the customer was not logged in when placing the order. */
  guest: Maybe<Scalars['Boolean']['output']>;
  /** Total discount applied to line items. */
  itemDiscount: Maybe<Scalars['SafeNumber']['output']>;
  /** Total quantity of all line items. */
  itemQuantity: Maybe<Scalars['Int']['output']>;
  /** Total shipping weight of all line items. */
  itemShipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  /** Total taxes applied to line items. */
  itemTax: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates line item prices include taxes. */
  itemTaxIncluded: Maybe<Scalars['Boolean']['output']>;
  /** List of line items describing the products ordered. */
  items: Maybe<Array<Maybe<SwellCartItem>>>;
  /** Arbitrary data, typically set in a checkout flow to store custom values. See Frontend API for more details. */
  metadata: Maybe<Scalars['JSON']['output']>;
  order: Maybe<SwellOrder>;
  /** ID of the the converted order, if applicable. */
  orderId: Maybe<Scalars['ID']['output']>;
  /** List of promotion IDs applied to the cart. */
  promotionIds: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  promotions: Maybe<SwellCartsPromotions>;
  /** List of purchase link errors applied to the cart. Added when clicking on the purchase link, if any resources are blocking the creation of the cart. */
  purchaseLinksErrors: Maybe<Array<Maybe<SwellCartPurchaseLinksError>>>;
  /** Indicates the cart was recovered and converted to an order after being abandoned. */
  recovered: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the cart has at least one line item with   `delivery=shipment`. */
  shipmentDelivery: Maybe<Scalars['Boolean']['output']>;
  /** Shipping discount applied by coupons, promotions, or custom logic. */
  shipmentDiscount: Maybe<Scalars['SafeNumber']['output']>;
  /** Total shipping price before discounts. */
  shipmentPrice: Maybe<Scalars['SafeNumber']['output']>;
  /** Object describing the shipping services and rates available for the cart. Shipping `country` must be set before retrieving shipping rates. */
  shipmentRating: Maybe<SwellCartShipmentRating>;
  /** Shipping tax amount, if applicable. */
  shipmentTax: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates shipping total includes taxes, if applicable. */
  shipmentTaxIncluded: Maybe<Scalars['Boolean']['output']>;
  /** Total shipping price after discounts. */
  shipmentTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** The customer's shipping details. Defaults to `account.shipping`. Updating shipping will also update the corresponding account shipping object. */
  shipping: Maybe<SwellCartShipping>;
  /** Sum of all line items before discounts, taxes and shipping. */
  subTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the cart has at least one line item with `delivery=subscription`. */
  subscriptionDelivery: Maybe<Scalars['Boolean']['output']>;
  /** Total with shipping and item taxes included. Allows for an alternate display style, as normally `sub_total` and `tax_total` are shown separately. */
  taxIncludedTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total tax amount applied to the cart including line items and shipping. */
  taxTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of taxes applied to the cart. */
  taxes: Maybe<Array<Maybe<SwellCartTax>>>;
  /** Indicates the order is tax-exempt. Taxes will not be calculated or applied when true. */
  taxesFixed: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the cart was made in test mode. */
  test: Maybe<Scalars['Boolean']['output']>;
  trial: Maybe<Scalars['Boolean']['output']>;
  trialAuthTotal: Maybe<Scalars['SafeNumber']['output']>;
  trialGrandTotal: Maybe<Scalars['SafeNumber']['output']>;
  trialItemDiscount: Maybe<Scalars['SafeNumber']['output']>;
  trialItemTax: Maybe<Scalars['SafeNumber']['output']>;
  trialSubTotal: Maybe<Scalars['SafeNumber']['output']>;
  trialTaxIncludedTotal: Maybe<Scalars['SafeNumber']['output']>;
};


/** Cart */
export type SwellCartAccountArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


/** Cart */
export type SwellCartOrderArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** The customer's billing details. Defaults to `account.billing`. Updating billing will also update the corresponding account billing object. */
export type SwellCartBilling = {
  __typename?: 'SwellCartBilling';
  accountCardId: Maybe<Scalars['ID']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  affirm: Maybe<SwellCartBillingAffirm>;
  amazon: Maybe<SwellCartBillingAmazon>;
  apple: Maybe<SwellCartBillingApple>;
  bancontact: Maybe<SwellCartBillingBancontact>;
  /** Payment Card */
  card: Maybe<SwellCartBillingCard>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Default Billing */
  default: Maybe<Scalars['Boolean']['output']>;
  /** Billing First Name */
  firstName: Maybe<Scalars['String']['output']>;
  google: Maybe<SwellCartBillingGoogle>;
  ideal: Maybe<SwellCartBillingIdeal>;
  intent: Maybe<Scalars['JSON']['output']>;
  klarna: Maybe<SwellCartBillingKlarna>;
  /** Billing Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Payment Method */
  method: Maybe<Scalars['String']['output']>;
  /** Billing Name */
  name: Maybe<Scalars['String']['output']>;
  paypal: Maybe<SwellCartBillingPaypal>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  resolve: Maybe<SwellCartBillingResolve>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingAffirm = {
  __typename?: 'SwellCartBillingAffirm';
  checkoutToken: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingAffirmInput = {
  checkoutToken: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingAmazon = {
  __typename?: 'SwellCartBillingAmazon';
  accessToken: Maybe<Scalars['String']['output']>;
  checkoutSessionId: Maybe<Scalars['String']['output']>;
  orderReferenceId: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingAmazonInput = {
  accessToken: InputMaybe<Scalars['String']['input']>;
  checkoutSessionId: InputMaybe<Scalars['String']['input']>;
  orderReferenceId: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingApple = {
  __typename?: 'SwellCartBillingApple';
  gateway: Maybe<Scalars['String']['output']>;
  nonce: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingAppleInput = {
  gateway: InputMaybe<Scalars['String']['input']>;
  nonce: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingBancontact = {
  __typename?: 'SwellCartBillingBancontact';
  source: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingBancontactInput = {
  source: InputMaybe<Scalars['String']['input']>;
};

/** Payment Card */
export type SwellCartBillingCard = {
  __typename?: 'SwellCartBillingCard';
  addressCheck: Maybe<Scalars['String']['output']>;
  brand: Maybe<Scalars['String']['output']>;
  cvcCheck: Maybe<Scalars['String']['output']>;
  expMonth: Maybe<Scalars['Int']['output']>;
  expYear: Maybe<Scalars['Int']['output']>;
  gateway: Maybe<Scalars['String']['output']>;
  last4: Maybe<Scalars['String']['output']>;
  test: Maybe<Scalars['Boolean']['output']>;
  token: Maybe<Scalars['String']['output']>;
  zipCheck: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingCardInput = {
  addressCheck: InputMaybe<Scalars['String']['input']>;
  brand: InputMaybe<Scalars['String']['input']>;
  cvcCheck: InputMaybe<Scalars['String']['input']>;
  expMonth: InputMaybe<Scalars['Int']['input']>;
  expYear: InputMaybe<Scalars['Int']['input']>;
  gateway: InputMaybe<Scalars['String']['input']>;
  last4: InputMaybe<Scalars['String']['input']>;
  test: InputMaybe<Scalars['Boolean']['input']>;
  token: InputMaybe<Scalars['String']['input']>;
  zipCheck: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingGoogle = {
  __typename?: 'SwellCartBillingGoogle';
  gateway: Maybe<Scalars['String']['output']>;
  nonce: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingGoogleInput = {
  gateway: InputMaybe<Scalars['String']['input']>;
  nonce: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingIdeal = {
  __typename?: 'SwellCartBillingIdeal';
  token: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingIdealInput = {
  token: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingInput = {
  accountCardId: InputMaybe<Scalars['ID']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  affirm: InputMaybe<SwellCartBillingAffirmInput>;
  amazon: InputMaybe<SwellCartBillingAmazonInput>;
  apple: InputMaybe<SwellCartBillingAppleInput>;
  bancontact: InputMaybe<SwellCartBillingBancontactInput>;
  card: InputMaybe<SwellCartBillingCardInput>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  default: InputMaybe<Scalars['Boolean']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  google: InputMaybe<SwellCartBillingGoogleInput>;
  ideal: InputMaybe<SwellCartBillingIdealInput>;
  intent: InputMaybe<Scalars['JSON']['input']>;
  klarna: InputMaybe<SwellCartBillingKlarnaInput>;
  lastName: InputMaybe<Scalars['String']['input']>;
  method: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  paypal: InputMaybe<SwellCartBillingPaypalInput>;
  phone: InputMaybe<Scalars['String']['input']>;
  resolve: InputMaybe<SwellCartBillingResolveInput>;
  state: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingKlarna = {
  __typename?: 'SwellCartBillingKlarna';
  source: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingKlarnaInput = {
  source: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingPaypal = {
  __typename?: 'SwellCartBillingPaypal';
  authorizationId: Maybe<Scalars['String']['output']>;
  nonce: Maybe<Scalars['String']['output']>;
  orderId: Maybe<Scalars['String']['output']>;
  payerId: Maybe<Scalars['String']['output']>;
  paymentId: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingPaypalInput = {
  authorizationId: InputMaybe<Scalars['String']['input']>;
  nonce: InputMaybe<Scalars['String']['input']>;
  orderId: InputMaybe<Scalars['String']['input']>;
  payerId: InputMaybe<Scalars['String']['input']>;
  paymentId: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartBillingResolve = {
  __typename?: 'SwellCartBillingResolve';
  chargeId: Maybe<Scalars['String']['output']>;
};

export type SwellCartBillingResolveInput = {
  chargeId: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartCoupon = {
  __typename?: 'SwellCartCoupon';
  /** A brief description of the coupon, as it may be displayed to customers. */
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  /** A short descriptive name of the coupon. */
  name: Maybe<Scalars['String']['output']>;
};

/** List of discounts applied to the cart. */
export type SwellCartDiscount = {
  __typename?: 'SwellCartDiscount';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
  rule: Maybe<Scalars['JSON']['output']>;
  /** References the related discount source object (e.g., promotion or coupon) */
  sourceId: Maybe<Scalars['ID']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

/** List of gift cards applied to the cart. */
export type SwellCartGiftcard = {
  __typename?: 'SwellCartGiftcard';
  /** Amount of gift card credit to spend for automatic payment */
  amount: Maybe<Scalars['SafeNumber']['output']>;
  code: Maybe<Scalars['String']['output']>;
  codeFormatted: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  last4: Maybe<Scalars['String']['output']>;
};

export type SwellCartInput = {
  billing: InputMaybe<SwellCartBillingInput>;
  comments: InputMaybe<Scalars['String']['input']>;
  couponCode: InputMaybe<Scalars['String']['input']>;
  items: InputMaybe<Array<InputMaybe<SwellCartItemInput>>>;
  metadata: InputMaybe<Scalars['JSON']['input']>;
  shipmentRating: InputMaybe<SwellCartShipmentRatingInput>;
  shipping: InputMaybe<SwellCartShippingInput>;
};

/** List of line items describing the products ordered. */
export type SwellCartItem = {
  __typename?: 'SwellCartItem';
  bundleItems: Maybe<Array<Maybe<SwellCartItemBundleItem>>>;
  /** Discount Amount */
  discountEach: Maybe<Scalars['SafeNumber']['output']>;
  discountTotal: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  options: Maybe<Array<Maybe<SwellCartItemOption>>>;
  origPrice: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  priceTotal: Maybe<Scalars['SafeNumber']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  purchaseOption: Maybe<SwellCartItemPurchaseOption>;
  quantity: Maybe<Scalars['Int']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  /** Tax Amount */
  taxEach: Maybe<Scalars['SafeNumber']['output']>;
  taxTotal: Maybe<Scalars['SafeNumber']['output']>;
  taxes: Maybe<Array<Maybe<SwellCartItemTax>>>;
  variant: Maybe<SwellProductVariant>;
  variantId: Maybe<Scalars['ID']['output']>;
};

export type SwellCartItemBundleItem = {
  __typename?: 'SwellCartItemBundleItem';
  id: Maybe<Scalars['ID']['output']>;
  options: Maybe<Array<Maybe<SwellCartItemBundleItemOption>>>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  quantity: Maybe<Scalars['Int']['output']>;
  /** Bundled Quantity */
  quantityTotal: Maybe<Scalars['Int']['output']>;
  variant: Maybe<SwellProductVariant>;
  variantId: Maybe<Scalars['ID']['output']>;
};

export type SwellCartItemBundleItemInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  options: InputMaybe<Array<InputMaybe<SwellCartItemBundleItemOptionInput>>>;
  productId: InputMaybe<Scalars['ID']['input']>;
  quantity: InputMaybe<Scalars['Int']['input']>;
  quantityTotal: InputMaybe<Scalars['Int']['input']>;
  variantId: InputMaybe<Scalars['ID']['input']>;
};

export type SwellCartItemBundleItemOption = {
  __typename?: 'SwellCartItemBundleItemOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueId: Maybe<Scalars['ID']['output']>;
  variant: Maybe<Scalars['Boolean']['output']>;
};

export type SwellCartItemBundleItemOptionInput = {
  id: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  shipmentWeight: InputMaybe<Scalars['SafeNumber']['input']>;
  value: InputMaybe<Scalars['String']['input']>;
  valueId: InputMaybe<Scalars['ID']['input']>;
  variant: InputMaybe<Scalars['Boolean']['input']>;
};

export type SwellCartItemInput = {
  bundleItems: InputMaybe<Array<InputMaybe<SwellCartItemBundleItemInput>>>;
  id: InputMaybe<Scalars['ID']['input']>;
  metadata: InputMaybe<Scalars['JSON']['input']>;
  options: InputMaybe<Array<InputMaybe<SwellCartItemOptionInput>>>;
  productId: InputMaybe<Scalars['ID']['input']>;
  purchaseOption: InputMaybe<SwellCartItemPurchaseOptionInput>;
  quantity: InputMaybe<Scalars['Int']['input']>;
  variantId: InputMaybe<Scalars['ID']['input']>;
};

export type SwellCartItemOption = {
  __typename?: 'SwellCartItemOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueId: Maybe<Scalars['ID']['output']>;
  variant: Maybe<Scalars['Boolean']['output']>;
};

export type SwellCartItemOptionInput = {
  id: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  shipmentWeight: InputMaybe<Scalars['SafeNumber']['input']>;
  value: InputMaybe<Scalars['String']['input']>;
  valueId: InputMaybe<Scalars['ID']['input']>;
  variant: InputMaybe<Scalars['Boolean']['input']>;
};

export type SwellCartItemPurchaseOption = {
  __typename?: 'SwellCartItemPurchaseOption';
  authAmount: Maybe<Scalars['SafeNumber']['output']>;
  billingSchedule: Maybe<SwellCartItemPurchaseOptionBillingSchedule>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  orderSchedule: Maybe<SwellCartItemPurchaseOptionOrderSchedule>;
  planDescription: Maybe<Scalars['String']['output']>;
  planId: Maybe<Scalars['ID']['output']>;
  planName: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type SwellCartItemPurchaseOptionBillingSchedule = {
  __typename?: 'SwellCartItemPurchaseOptionBillingSchedule';
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
};

export type SwellCartItemPurchaseOptionInput = {
  planDescription: InputMaybe<Scalars['String']['input']>;
  planId: InputMaybe<Scalars['ID']['input']>;
  planName: InputMaybe<Scalars['String']['input']>;
  type: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartItemPurchaseOptionOrderSchedule = {
  __typename?: 'SwellCartItemPurchaseOptionOrderSchedule';
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
};

export type SwellCartItemTax = {
  __typename?: 'SwellCartItemTax';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
};

export type SwellCartPromotion = {
  __typename?: 'SwellCartPromotion';
  /** Date the promo ends and is no longer available. When defined, the promo will not be applied after this date. */
  dateEnd: Maybe<Scalars['DateTime']['output']>;
  /** Date the promo is first available. When defined, the promo will not be valid until after this date and before `date_end`. */
  dateStart: Maybe<Scalars['DateTime']['output']>;
  /** A brief description of the promo, as it may be displayed to customers. */
  description: Maybe<Scalars['String']['output']>;
  /** A short descriptive name of the promo. */
  name: Maybe<Scalars['String']['output']>;
};

/** List of purchase link errors applied to the cart. Added when clicking on the purchase link, if any resources are blocking the creation of the cart. */
export type SwellCartPurchaseLinksError = {
  __typename?: 'SwellCartPurchaseLinksError';
  error: Maybe<SwellCartPurchaseLinksErrorError>;
  id: Maybe<Scalars['ID']['output']>;
  purchaseLinkId: Maybe<Scalars['String']['output']>;
};

export type SwellCartPurchaseLinksErrorError = {
  __typename?: 'SwellCartPurchaseLinksErrorError';
  code: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
  resource: Maybe<SwellCartPurchaseLinksErrorErrorResource>;
};

export type SwellCartPurchaseLinksErrorErrorResource = {
  __typename?: 'SwellCartPurchaseLinksErrorErrorResource';
  id: Maybe<Scalars['ID']['output']>;
  model: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

/** Object describing the shipping services and rates available for the cart. Shipping `country` must be set before retrieving shipping rates. */
export type SwellCartShipmentRating = {
  __typename?: 'SwellCartShipmentRating';
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  errors: Maybe<Array<Maybe<SwellCartShipmentRatingError>>>;
  md5: Maybe<Scalars['String']['output']>;
  services: Maybe<Array<Maybe<SwellCartShipmentRatingService>>>;
};

export type SwellCartShipmentRatingError = {
  __typename?: 'SwellCartShipmentRatingError';
  code: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
};

export type SwellCartShipmentRatingErrorInput = {
  code: InputMaybe<Scalars['String']['input']>;
  message: InputMaybe<Scalars['String']['input']>;
};

export type SwellCartShipmentRatingInput = {
  dateCreated: InputMaybe<Scalars['DateTime']['input']>;
  errors: InputMaybe<Array<InputMaybe<SwellCartShipmentRatingErrorInput>>>;
  md5: InputMaybe<Scalars['String']['input']>;
  services: InputMaybe<Array<InputMaybe<SwellCartShipmentRatingServiceInput>>>;
};

export type SwellCartShipmentRatingService = {
  __typename?: 'SwellCartShipmentRatingService';
  carrier: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  pickup: Maybe<Scalars['Boolean']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  taxCode: Maybe<Scalars['String']['output']>;
};

export type SwellCartShipmentRatingServiceInput = {
  carrier: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  pickup: InputMaybe<Scalars['Boolean']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  taxCode: InputMaybe<Scalars['String']['input']>;
};

/** The customer's shipping details. Defaults to `account.shipping`. Updating shipping will also update the corresponding account shipping object. */
export type SwellCartShipping = {
  __typename?: 'SwellCartShipping';
  accountAddressId: Maybe<Scalars['ID']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Default Shipping */
  default: Maybe<Scalars['Boolean']['output']>;
  /** Shipping First Name */
  firstName: Maybe<Scalars['String']['output']>;
  /** Shipping Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Shipping Name */
  name: Maybe<Scalars['String']['output']>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  pickup: Maybe<Scalars['Boolean']['output']>;
  /** Shipping Price */
  price: Maybe<Scalars['SafeNumber']['output']>;
  /** Shipping Service ID */
  service: Maybe<Scalars['String']['output']>;
  /** Shipping Service Name */
  serviceName: Maybe<Scalars['String']['output']>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellCartShippingInput = {
  accountAddressId: InputMaybe<Scalars['ID']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  default: InputMaybe<Scalars['Boolean']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  pickup: InputMaybe<Scalars['Boolean']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  service: InputMaybe<Scalars['String']['input']>;
  serviceName: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

/** List of taxes applied to the cart. */
export type SwellCartTax = {
  __typename?: 'SwellCartTax';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  priority: Maybe<Scalars['Int']['output']>;
  rate: Maybe<Scalars['SafeNumber']['output']>;
  shipping: Maybe<Scalars['Boolean']['output']>;
};

export type SwellCartsPromotions = {
  __typename?: 'SwellCartsPromotions';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellCartPromotion>>>;
};

export type SwellCategories = {
  __typename?: 'SwellCategories';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellCategory>>>;
};

/** Category */
export type SwellCategory = {
  __typename?: 'SwellCategory';
  children: Maybe<Array<Maybe<SwellCategory>>>;
  /** A long-form description of the category. Can contain HTML or other markup languages. */
  description: Maybe<Scalars['String']['output']>;
  /** Image depicting the category. */
  image: Maybe<SwellCategoryImage>;
  /** List of images depicting the category. */
  images: Maybe<Array<Maybe<SwellCategoryImage>>>;
  /** Page description used for search engine optimization purposes. */
  metaDescription: Maybe<Scalars['String']['output']>;
  /** Page keywords used for search engine optimization purposes. */
  metaKeywords: Maybe<Scalars['String']['output']>;
  /** A human-friendly name for the category. */
  name: Maybe<Scalars['String']['output']>;
  parent: Maybe<SwellCategory>;
  /** ID of the parent category, if applicable. */
  parentId: Maybe<Scalars['ID']['output']>;
  products: Maybe<Array<Maybe<SwellProduct>>>;
  /** Unique identifier typically used in URLs. Defaults to `name` converted to lowercase and hyphenated. If the category has a parent, the default slug will be prefixed with the parent slug. Maximum length of 1,000 characters. */
  slug: Maybe<Scalars['String']['output']>;
  /** Position of the category in a list. */
  sort: Maybe<Scalars['Int']['output']>;
  /** Default product sorting applied when retrieving products using the `category` or `categories` filter. Can be one of `popularity`, `price_asc`, `price_desc`, `date_asc`. `date_desc`. If not specified, products are sorted by their manually defined `sort` value. */
  sorting: Maybe<Scalars['String']['output']>;
  top: Maybe<SwellCategory>;
  /** ID of the top level category in the hierarchy. */
  topId: Maybe<Scalars['ID']['output']>;
};


/** Category */
export type SwellCategoryChildrenArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


/** Category */
export type SwellCategoryParentArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


/** Category */
export type SwellCategoryProductsArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};


/** Category */
export type SwellCategoryTopArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** List of images depicting the category. */
export type SwellCategoryImage = {
  __typename?: 'SwellCategoryImage';
  caption: Maybe<Scalars['String']['output']>;
  file: Maybe<SwellCategoryImageFile>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type SwellCategoryImageFile = {
  __typename?: 'SwellCategoryImageFile';
  contentType: Maybe<Scalars['String']['output']>;
  data: Maybe<Scalars['JSON']['output']>;
  dateUploaded: Maybe<Scalars['DateTime']['output']>;
  filename: Maybe<Scalars['String']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  length: Maybe<Scalars['Int']['output']>;
  md5: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  private: Maybe<Scalars['Boolean']['output']>;
  url: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

/** Page */
export type SwellContentPage = {
  __typename?: 'SwellContentPage';
  content: Maybe<Scalars['String']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  datePublished: Maybe<Scalars['DateTime']['output']>;
  dateUpdated: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaKeywords: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  published: Maybe<Scalars['Boolean']['output']>;
  redirect: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
};

export type SwellContentPages = {
  __typename?: 'SwellContentPages';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellContentPage>>>;
};

/** Order */
export type SwellOrder = {
  __typename?: 'SwellOrder';
  /** Amount of customer's account credit applied for initial payment, if applicable. */
  accountCreditAmount: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the customer’s account credit is applied when submitting the order. */
  accountCreditApplied: Maybe<Scalars['Boolean']['output']>;
  /** The `id` of the customer's account. During checkout, customer accounts without a password are designated as `guest=true`. */
  accountId: Maybe<Scalars['ID']['output']>;
  /** Indicates the customer chose to save shipping and billing information to their account when submitting the order. */
  accountInfoSaved: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the customer was logged into their account when placing the order. */
  accountLoggedIn: Maybe<Scalars['Boolean']['output']>;
  /** The customer's billing details. Defaults to `account.billing`. Updating billing will also update the corresponding account billing object. */
  billing: Maybe<SwellOrderBilling>;
  /** Indicates the order was completely canceled. */
  canceled: Maybe<Scalars['Boolean']['output']>;
  /** Customer notes provided when placing the order, if any. */
  comments: Maybe<Scalars['String']['output']>;
  coupon: Maybe<SwellOrderCoupon>;
  /** Coupon code applied to the order. */
  couponCode: Maybe<Scalars['String']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  /** The store’s base currency. */
  currencyBase: Maybe<Scalars['String']['output']>;
  /** Currency percentage used in calculating the fixed amount. */
  currencyRate: Maybe<Scalars['SafeNumber']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  /** Indicates the order was completely fulfilled. Always `true` when `delivery_marked=true`, otherwise depends on the sum of `shipments`, `giftcards`, and `subscriptions`. */
  delivered: Maybe<Scalars['Boolean']['output']>;
  /** Total discount amount. */
  discountTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of discounts applied to the order. */
  discounts: Maybe<Array<Maybe<SwellOrderDiscount>>>;
  /** Indicates the order is intended as a gift for the recipient. */
  gift: Maybe<Scalars['Boolean']['output']>;
  /** Optional message to include with the order when shipping to the recipient. */
  giftMessage: Maybe<Scalars['String']['output']>;
  /** Indicates the order has at least one line item with `delivery=giftcard`. */
  giftcardDelivery: Maybe<Scalars['Boolean']['output']>;
  /** Total payment amount applied to the order from `giftcards`. */
  giftcardTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of gift cards applied to the order. */
  giftcards: Maybe<Array<Maybe<SwellOrderGiftcard>>>;
  /** Grand total including items, shipping and taxes. */
  grandTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the customer was not logged in when placing the order. */
  guest: Maybe<Scalars['Boolean']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  /** Total discount applied to line items. */
  itemDiscount: Maybe<Scalars['SafeNumber']['output']>;
  /** Total quantity of all line items. */
  itemQuantity: Maybe<Scalars['Int']['output']>;
  /** Total quantity of cancelable items on the order. */
  itemQuantityCancelable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items canceled. */
  itemQuantityCanceled: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that can be credited. */
  itemQuantityCreditable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of items credited on the order. */
  itemQuantityCredited: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that can be fulfilled. */
  itemQuantityDeliverable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that have been fulfilled. */
  itemQuantityDelivered: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that can be fulfilled by gift card. Applies when `item.delivery=giftcard`. */
  itemQuantityGiftcardDeliverable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of items eligible for invoicing on the order. */
  itemQuantityInvoiceable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of items invoiced on the order. */
  itemQuantityInvoiced: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that can still be returned. */
  itemQuantityReturnable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that have been returned. */
  itemQuantityReturned: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that can be fulfilled by shipment. Applies when `item.delivery=shipment`. */
  itemQuantityShipmentDeliverable: Maybe<Scalars['Int']['output']>;
  /** Total quantity of line items that can be fulfilled by subscription. Applies when `item.delivery=subscription`. */
  itemQuantitySubscriptionDeliverable: Maybe<Scalars['Int']['output']>;
  /** Total shipping weight of all line items. */
  itemShipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  /** Total taxes applied to line items. */
  itemTax: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates line item prices include taxes. */
  itemTaxIncluded: Maybe<Scalars['Boolean']['output']>;
  /** List of line items describing the products ordered. */
  items: Maybe<Array<Maybe<SwellOrderItem>>>;
  /** Arbitrary data, typically set in a checkout flow to store custom values. See Frontend API for details. */
  metadata: Maybe<Scalars['JSON']['output']>;
  /** Unique incremental order number, assigned automatically using a format configured in general settings. */
  number: Maybe<Scalars['String']['output']>;
  /** Indicates the order was paid in full. Always `true` when `payment_marked=true`, otherwise depends on the sum of `payments`. */
  paid: Maybe<Scalars['Boolean']['output']>;
  payments: Maybe<SwellOrdersPayments>;
  /** List of promotion IDs applied to the order. */
  promotionIds: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  promotions: Maybe<SwellOrdersPromotions>;
  /** Expandable list of refunds issued for the payment. */
  refunds: Maybe<SwellOrdersRefunds>;
  /** Indicates the order has at least one line item with `delivery=shipment`. */
  shipmentDelivery: Maybe<Scalars['Boolean']['output']>;
  /** Shipping discount applied by coupons, promotions, or custom logic. */
  shipmentDiscount: Maybe<Scalars['SafeNumber']['output']>;
  /** Total shipping price before discounts. */
  shipmentPrice: Maybe<Scalars['SafeNumber']['output']>;
  /** Object describing the shipping services and rates available for the order. Shipping `country` must be set before retrieving shipping rates. */
  shipmentRating: Maybe<SwellOrderShipmentRating>;
  /** Shipping tax amount, if applicable. */
  shipmentTax: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates shipping total includes taxes, if applicable. */
  shipmentTaxIncluded: Maybe<Scalars['Boolean']['output']>;
  /** Total shipping price including taxes and discount. Allows for an alternate display style as normally `shipment_total` and `tax_total` are shown separately. */
  shipmentTaxIncludedTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total shipping price after discounts. */
  shipmentTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total shipping price for items credited on the order. */
  shipmentTotalCredited: Maybe<Scalars['SafeNumber']['output']>;
  /** Total shipping price for items invoiced on the order. */
  shipmentTotalInvoiced: Maybe<Scalars['SafeNumber']['output']>;
  shipments: Maybe<SwellOrdersShipments>;
  /** The customer's shipping details. Defaults to `account.shipping`. Updating shipping will also update the corresponding account shipping object. */
  shipping: Maybe<SwellOrderShipping>;
  /** Current status of the order. Can be `pending`, `draft`, `payment_pending`, `delivery_pending`, `hold`, `complete`, or `canceled`. */
  status: Maybe<Scalars['String']['output']>;
  /** Sum of all line items before discounts, taxes and shipping. */
  subTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the order has at least one line item with `delivery=subscription`. */
  subscriptionDelivery: Maybe<Scalars['Boolean']['output']>;
  /** Total of taxes applied separately from line items. */
  taxIncludedTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total tax amount applied to the order including line items and shipping. */
  taxTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of taxes applied to the order. */
  taxes: Maybe<Array<Maybe<SwellOrderTax>>>;
  /** Indicates the order is tax-exempt. Taxes will not be calculated or applied when true. */
  taxesFixed: Maybe<Scalars['Boolean']['output']>;
};

/** The customer's billing details. Defaults to `account.billing`. Updating billing will also update the corresponding account billing object. */
export type SwellOrderBilling = {
  __typename?: 'SwellOrderBilling';
  accountCardId: Maybe<Scalars['ID']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  affirm: Maybe<SwellOrderBillingAffirm>;
  amazon: Maybe<SwellOrderBillingAmazon>;
  apple: Maybe<SwellOrderBillingApple>;
  bancontact: Maybe<SwellOrderBillingBancontact>;
  /** Payment Card */
  card: Maybe<SwellOrderBillingCard>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Default Billing */
  default: Maybe<Scalars['Boolean']['output']>;
  /** Billing First Name */
  firstName: Maybe<Scalars['String']['output']>;
  google: Maybe<SwellOrderBillingGoogle>;
  ideal: Maybe<SwellOrderBillingIdeal>;
  /** Payment Instructions */
  instructions: Maybe<Scalars['String']['output']>;
  intent: Maybe<Scalars['JSON']['output']>;
  klarna: Maybe<SwellOrderBillingKlarna>;
  /** Billing Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Payment Method */
  method: Maybe<Scalars['String']['output']>;
  /** Billing Name */
  name: Maybe<Scalars['String']['output']>;
  paypal: Maybe<SwellOrderBillingPaypal>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  resolve: Maybe<SwellOrderBillingResolve>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingAffirm = {
  __typename?: 'SwellOrderBillingAffirm';
  checkoutToken: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingAmazon = {
  __typename?: 'SwellOrderBillingAmazon';
  accessToken: Maybe<Scalars['String']['output']>;
  checkoutSessionId: Maybe<Scalars['String']['output']>;
  orderReferenceId: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingApple = {
  __typename?: 'SwellOrderBillingApple';
  gateway: Maybe<Scalars['String']['output']>;
  nonce: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingBancontact = {
  __typename?: 'SwellOrderBillingBancontact';
  source: Maybe<Scalars['String']['output']>;
};

/** Payment Card */
export type SwellOrderBillingCard = {
  __typename?: 'SwellOrderBillingCard';
  addressCheck: Maybe<Scalars['String']['output']>;
  brand: Maybe<Scalars['String']['output']>;
  cvcCheck: Maybe<Scalars['String']['output']>;
  expMonth: Maybe<Scalars['Int']['output']>;
  expYear: Maybe<Scalars['Int']['output']>;
  gateway: Maybe<Scalars['String']['output']>;
  last4: Maybe<Scalars['String']['output']>;
  test: Maybe<Scalars['Boolean']['output']>;
  token: Maybe<Scalars['String']['output']>;
  zipCheck: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingGoogle = {
  __typename?: 'SwellOrderBillingGoogle';
  gateway: Maybe<Scalars['String']['output']>;
  nonce: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingIdeal = {
  __typename?: 'SwellOrderBillingIdeal';
  token: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingKlarna = {
  __typename?: 'SwellOrderBillingKlarna';
  source: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingPaypal = {
  __typename?: 'SwellOrderBillingPaypal';
  authorizationId: Maybe<Scalars['String']['output']>;
  nonce: Maybe<Scalars['String']['output']>;
  orderId: Maybe<Scalars['String']['output']>;
  payerId: Maybe<Scalars['String']['output']>;
  paymentId: Maybe<Scalars['String']['output']>;
};

export type SwellOrderBillingResolve = {
  __typename?: 'SwellOrderBillingResolve';
  chargeId: Maybe<Scalars['String']['output']>;
};

export type SwellOrderCoupon = {
  __typename?: 'SwellOrderCoupon';
  /** A brief description of the coupon, as it may be displayed to customers. */
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  /** A short descriptive name of the coupon. */
  name: Maybe<Scalars['String']['output']>;
};

/** List of discounts applied to the order. */
export type SwellOrderDiscount = {
  __typename?: 'SwellOrderDiscount';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
  rule: Maybe<Scalars['JSON']['output']>;
  /** References the related discount source object (e.g., promotion or coupon) */
  sourceId: Maybe<Scalars['ID']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

/** List of gift cards applied to the order. */
export type SwellOrderGiftcard = {
  __typename?: 'SwellOrderGiftcard';
  /** Amount of gift card credit to spend for automatic payment */
  amount: Maybe<Scalars['SafeNumber']['output']>;
  code: Maybe<Scalars['String']['output']>;
  codeFormatted: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  last4: Maybe<Scalars['String']['output']>;
};

/** List of line items describing the products ordered. */
export type SwellOrderItem = {
  __typename?: 'SwellOrderItem';
  bundleItems: Maybe<Array<Maybe<SwellOrderItemBundleItem>>>;
  /** Discount Amount */
  discountEach: Maybe<Scalars['SafeNumber']['output']>;
  discountTotal: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  options: Maybe<Array<Maybe<SwellOrderItemOption>>>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  priceTotal: Maybe<Scalars['SafeNumber']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  purchaseOption: Maybe<SwellOrderItemPurchaseOption>;
  quantity: Maybe<Scalars['Int']['output']>;
  quantityCancelable: Maybe<Scalars['Int']['output']>;
  quantityCanceled: Maybe<Scalars['Int']['output']>;
  quantityConsumed: Maybe<Scalars['Int']['output']>;
  quantityCreditable: Maybe<Scalars['Int']['output']>;
  quantityCredited: Maybe<Scalars['Int']['output']>;
  quantityDeliverable: Maybe<Scalars['Int']['output']>;
  quantityDelivered: Maybe<Scalars['Int']['output']>;
  quantityGiftcardDeliverable: Maybe<Scalars['Int']['output']>;
  quantityInvoiceable: Maybe<Scalars['Int']['output']>;
  quantityInvoiced: Maybe<Scalars['Int']['output']>;
  quantityRestocked: Maybe<Scalars['Int']['output']>;
  quantityReturnable: Maybe<Scalars['Int']['output']>;
  quantityReturned: Maybe<Scalars['Int']['output']>;
  quantityShipmentDeliverable: Maybe<Scalars['Int']['output']>;
  quantitySubscriptionDeliverable: Maybe<Scalars['Int']['output']>;
  quantitySubscriptionDelivered: Maybe<Scalars['Int']['output']>;
  quantityTotal: Maybe<Scalars['Int']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  /** Tax Amount */
  taxEach: Maybe<Scalars['SafeNumber']['output']>;
  taxTotal: Maybe<Scalars['SafeNumber']['output']>;
  taxes: Maybe<Array<Maybe<SwellOrderItemTax>>>;
  variant: Maybe<SwellProductVariant>;
  variantId: Maybe<Scalars['ID']['output']>;
};

export type SwellOrderItemBundleItem = {
  __typename?: 'SwellOrderItemBundleItem';
  id: Maybe<Scalars['ID']['output']>;
  options: Maybe<Array<Maybe<SwellOrderItemBundleItemOption>>>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  quantity: Maybe<Scalars['Int']['output']>;
  quantityCancelable: Maybe<Scalars['Int']['output']>;
  quantityCanceled: Maybe<Scalars['Int']['output']>;
  quantityConsumed: Maybe<Scalars['Int']['output']>;
  quantityDeliverable: Maybe<Scalars['Int']['output']>;
  quantityDelivered: Maybe<Scalars['Int']['output']>;
  quantityGiftcardDeliverable: Maybe<Scalars['Int']['output']>;
  quantityRestocked: Maybe<Scalars['Int']['output']>;
  quantityReturnable: Maybe<Scalars['Int']['output']>;
  quantityReturned: Maybe<Scalars['Int']['output']>;
  quantityShipmentDeliverable: Maybe<Scalars['Int']['output']>;
  quantityShipmentDelivered: Maybe<Scalars['Int']['output']>;
  quantityTotal: Maybe<Scalars['Int']['output']>;
  variant: Maybe<SwellProductVariant>;
  variantId: Maybe<Scalars['ID']['output']>;
};

export type SwellOrderItemBundleItemOption = {
  __typename?: 'SwellOrderItemBundleItemOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  subscription: Maybe<Scalars['Boolean']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueId: Maybe<Scalars['ID']['output']>;
  variant: Maybe<Scalars['Boolean']['output']>;
};

export type SwellOrderItemOption = {
  __typename?: 'SwellOrderItemOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  subscription: Maybe<Scalars['Boolean']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueId: Maybe<Scalars['ID']['output']>;
  variant: Maybe<Scalars['Boolean']['output']>;
};

export type SwellOrderItemPurchaseOption = {
  __typename?: 'SwellOrderItemPurchaseOption';
  billingSchedule: Maybe<SwellOrderItemPurchaseOptionBillingSchedule>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  orderSchedule: Maybe<SwellOrderItemPurchaseOptionOrderSchedule>;
  planDescription: Maybe<Scalars['String']['output']>;
  planId: Maybe<Scalars['ID']['output']>;
  planName: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type SwellOrderItemPurchaseOptionBillingSchedule = {
  __typename?: 'SwellOrderItemPurchaseOptionBillingSchedule';
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
};

export type SwellOrderItemPurchaseOptionOrderSchedule = {
  __typename?: 'SwellOrderItemPurchaseOptionOrderSchedule';
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
};

export type SwellOrderItemTax = {
  __typename?: 'SwellOrderItemTax';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
};

export type SwellOrderPayment = {
  __typename?: 'SwellOrderPayment';
  /** Payment amount denominated in `currency`. Minimum of 0.01 */
  amount: Maybe<Scalars['SafeNumber']['output']>;
  /** Remaining amount that can be refunded. */
  amountRefundable: Maybe<Scalars['SafeNumber']['output']>;
  /** Amount of the payment that has been refunded. */
  amountRefunded: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the payment was authorized before being captured. */
  authorized: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the payment has been captured. */
  captured: Maybe<Scalars['Boolean']['output']>;
  /** Credit card details used to make the payment, if applicable. */
  card: Maybe<SwellOrderPaymentCard>;
  currency: Maybe<Scalars['String']['output']>;
  /** Currency percentage used in calculating the fixed amount. */
  currencyRate: Maybe<Scalars['SafeNumber']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  /** ID of the payment gateway that was used to process the payment. */
  gateway: Maybe<Scalars['String']['output']>;
  /** Method of payment. Can be `card`, `account`, `amazon`, `paypal` or any one of the manual methods defined in payment settings. */
  method: Maybe<Scalars['String']['output']>;
  /** Unique incremental payment number assigned automatically. */
  number: Maybe<Scalars['String']['output']>;
  /** Status of the payment. Can be `pending`, which is awaiting async processing, `error`, `success` or `authorized`. */
  status: Maybe<Scalars['String']['output']>;
  /** Indicates the payment was successful. When an error occurs with a payment gateway, this status will be `false` and `error` field will be populated. */
  success: Maybe<Scalars['Boolean']['output']>;
};

/** Credit card details used to make the payment, if applicable. */
export type SwellOrderPaymentCard = {
  __typename?: 'SwellOrderPaymentCard';
  addressCheck: Maybe<Scalars['String']['output']>;
  brand: Maybe<Scalars['String']['output']>;
  cvcCheck: Maybe<Scalars['String']['output']>;
  expMonth: Maybe<Scalars['Int']['output']>;
  expYear: Maybe<Scalars['Int']['output']>;
  last4: Maybe<Scalars['String']['output']>;
  test: Maybe<Scalars['Boolean']['output']>;
  token: Maybe<Scalars['String']['output']>;
  zipCheck: Maybe<Scalars['String']['output']>;
};

export type SwellOrderPromotion = {
  __typename?: 'SwellOrderPromotion';
  /** Date the promo ends and is no longer available. When defined, the promo will not be applied after this date. */
  dateEnd: Maybe<Scalars['DateTime']['output']>;
  /** Date the promo is first available. When defined, the promo will not be valid until after this date and before `date_end`. */
  dateStart: Maybe<Scalars['DateTime']['output']>;
  /** A brief description of the promo, as it may be displayed to customers. */
  description: Maybe<Scalars['String']['output']>;
  /** A short descriptive name of the promo. */
  name: Maybe<Scalars['String']['output']>;
};

/** Expandable list of refunds issued for the payment. */
export type SwellOrderRefund = {
  __typename?: 'SwellOrderRefund';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  currencyRate: Maybe<Scalars['SafeNumber']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  method: Maybe<Scalars['String']['output']>;
  number: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['String']['output']>;
  /** Indicates the refund was successfully processed */
  success: Maybe<Scalars['Boolean']['output']>;
};

export type SwellOrderShipment = {
  __typename?: 'SwellOrderShipment';
  /** Indicates the shipment was canceled. */
  canceled: Maybe<Scalars['Boolean']['output']>;
  /** The id of a third-party carrier offering the service, if applicable. */
  carrier: Maybe<Scalars['String']['output']>;
  /** Name of a third-party carrier offering the service, if applicable. */
  carrierName: Maybe<Scalars['String']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  /** Date the expected shipment is meant to arrive at the destination, if applicable. */
  dateEstimated: Maybe<Scalars['DateTime']['output']>;
  /** The customer's shipping address. */
  destination: Maybe<SwellOrderShipmentDestination>;
  /** List of line items describing the products shipped. */
  items: Maybe<Array<Maybe<SwellOrderShipmentItem>>>;
  /** Unique incremental shipment number, assigned automatically. */
  number: Maybe<Scalars['String']['output']>;
  /** The shipment origin location. */
  origin: Maybe<SwellOrderShipmentOrigin>;
  /** The id of a shipping service as configured in shipment settings. */
  service: Maybe<Scalars['String']['output']>;
  /** Name of the shipping service. */
  serviceName: Maybe<Scalars['String']['output']>;
  /** Tracking code used to identify the shipment, if applicable. */
  trackingCode: Maybe<Scalars['String']['output']>;
};

/** The customer's shipping address. */
export type SwellOrderShipmentDestination = {
  __typename?: 'SwellOrderShipmentDestination';
  address1: Maybe<Scalars['String']['output']>;
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  state: Maybe<Scalars['String']['output']>;
  zip: Maybe<Scalars['String']['output']>;
};

/** List of line items describing the products shipped. */
export type SwellOrderShipmentItem = {
  __typename?: 'SwellOrderShipmentItem';
  bundleItemId: Maybe<Scalars['ID']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  options: Maybe<Array<Maybe<SwellOrderShipmentItemOption>>>;
  orderItemId: Maybe<Scalars['ID']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  quantity: Maybe<Scalars['Int']['output']>;
  variantId: Maybe<Scalars['ID']['output']>;
};


/** List of line items describing the products shipped. */
export type SwellOrderShipmentItemProductArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

export type SwellOrderShipmentItemOption = {
  __typename?: 'SwellOrderShipmentItemOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  value: Maybe<Scalars['String']['output']>;
};

/** The shipment origin location. */
export type SwellOrderShipmentOrigin = {
  __typename?: 'SwellOrderShipmentOrigin';
  location: Maybe<Scalars['String']['output']>;
};

/** Object describing the shipping services and rates available for the order. Shipping `country` must be set before retrieving shipping rates. */
export type SwellOrderShipmentRating = {
  __typename?: 'SwellOrderShipmentRating';
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  errors: Maybe<Array<Maybe<SwellOrderShipmentRatingError>>>;
  fingerprint: Maybe<Scalars['String']['output']>;
  services: Maybe<Array<Maybe<SwellOrderShipmentRatingService>>>;
};

export type SwellOrderShipmentRatingError = {
  __typename?: 'SwellOrderShipmentRatingError';
  code: Maybe<Scalars['String']['output']>;
  message: Maybe<Scalars['String']['output']>;
};

export type SwellOrderShipmentRatingService = {
  __typename?: 'SwellOrderShipmentRatingService';
  carrier: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  pickup: Maybe<Scalars['Boolean']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  taxCode: Maybe<Scalars['String']['output']>;
};

/** The customer's shipping details. Defaults to `account.shipping`. Updating shipping will also update the corresponding account shipping object. */
export type SwellOrderShipping = {
  __typename?: 'SwellOrderShipping';
  accountAddressId: Maybe<Scalars['ID']['output']>;
  /** Address Line 1 */
  address1: Maybe<Scalars['String']['output']>;
  /** Address Line 2 */
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  /** Default Shipping */
  default: Maybe<Scalars['Boolean']['output']>;
  /** Shipping First Name */
  firstName: Maybe<Scalars['String']['output']>;
  /** Shipping Last Name */
  lastName: Maybe<Scalars['String']['output']>;
  /** Shipping Name */
  name: Maybe<Scalars['String']['output']>;
  /** Phone Number */
  phone: Maybe<Scalars['String']['output']>;
  pickup: Maybe<Scalars['Boolean']['output']>;
  /** Shipping Price */
  price: Maybe<Scalars['SafeNumber']['output']>;
  /** Shipping Service ID */
  service: Maybe<Scalars['String']['output']>;
  /** Shipping Service Name */
  serviceName: Maybe<Scalars['String']['output']>;
  /** State/Province */
  state: Maybe<Scalars['String']['output']>;
  /** Zip/Postal Code */
  zip: Maybe<Scalars['String']['output']>;
};

/** List of taxes applied to the order. */
export type SwellOrderTax = {
  __typename?: 'SwellOrderTax';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  priority: Maybe<Scalars['Int']['output']>;
  rate: Maybe<Scalars['SafeNumber']['output']>;
  shipping: Maybe<Scalars['Boolean']['output']>;
};

export type SwellOrders = {
  __typename?: 'SwellOrders';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellOrder>>>;
};

export type SwellOrdersPayments = {
  __typename?: 'SwellOrdersPayments';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellOrderPayment>>>;
};

export type SwellOrdersPromotions = {
  __typename?: 'SwellOrdersPromotions';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellOrderPromotion>>>;
};

export type SwellOrdersRefunds = {
  __typename?: 'SwellOrdersRefunds';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellOrderRefund>>>;
};

export type SwellOrdersShipments = {
  __typename?: 'SwellOrdersShipments';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellOrderShipment>>>;
};

/** Product */
export type SwellProduct = {
  __typename?: 'SwellProduct';
  /** An object containing custom attribute key/value pairs. */
  attributes: Maybe<Scalars['JSON']['output']>;
  /** Indicates whether the product is a bundle of other products. */
  bundle: Maybe<Scalars['Boolean']['output']>;
  /** List of products sold as a bundle. Applicable only when `bundle=true`. */
  bundleItems: Maybe<Array<Maybe<SwellProductBundleItem>>>;
  categories: Maybe<Array<Maybe<SwellCategory>>>;
  /** List of products to display as cross-sells on a shopping cart page. */
  crossSells: Maybe<Array<Maybe<SwellProductCrossSell>>>;
  currency: Maybe<Scalars['String']['output']>;
  /** A long-form description of the product. May contain HTML or other markup languages. */
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  /** List of images depicting the bundle. */
  images: Maybe<Array<Maybe<SwellProductImage>>>;
  /** Page description used for search engine optimization purposes. */
  metaDescription: Maybe<Scalars['String']['output']>;
  /** Page title used to override product name in storefronts. */
  metaTitle: Maybe<Scalars['String']['output']>;
  /** Human-friendly name of the product. */
  name: Maybe<Scalars['String']['output']>;
  /** Options that allow for variations of the base product. If the option is part of a variant or `required=true`, an option value must be set for the product to be added to a cart. */
  options: Maybe<Array<Maybe<SwellProductOption>>>;
  /** Reflects the non-sale price of the product */
  origPrice: Maybe<Scalars['SafeNumber']['output']>;
  /** List price used when `sale=false` or `sale_price` is not defined. This value is intended for use via the frontend. See the `purchase_options` array to manage a product's price. */
  price: Maybe<Scalars['SafeNumber']['output']>;
  /** Price rules determined by cart quantity or customer account group. Overrides `price` and `sale_price` when conditions match. */
  prices: Maybe<Array<Maybe<SwellProductPrice>>>;
  /** Configuration of one or more purchase options for the product. Can be `standard` for one-time purchases or `subscription` for a subscription plan. Products can support both purchase options simultaneously. */
  purchaseOptions: Maybe<SwellProductPurchaseOptions>;
  /** Indicates whether the product is on sale. If `true`, the `sale_price` will be used by default when the product is added to a cart. */
  sale: Maybe<Scalars['Boolean']['output']>;
  /** Sale price used to override list price when `sale=true`. */
  salePrice: Maybe<Scalars['SafeNumber']['output']>;
  /** Stock keeping unit (SKU) used to track inventory in a warehouse. */
  sku: Maybe<Scalars['String']['output']>;
  /** Lowercase, hyphenated identifier typically used in URLs. When creating a product, a `slug `will be generated automatically from the `name`. Maximum length of 1,000 characters. */
  slug: Maybe<Scalars['String']['output']>;
  /** Quantity of the product currently in stock (including all variants), based on the sum of the stock entries. */
  stockLevel: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the product's stock is purchasable. */
  stockPurchasable: Maybe<Scalars['Boolean']['output']>;
  /** String indicating the product's stock status for the purpose of ordering. When `stock_purchasable=true`, an order can be placed for this product regardless of current stock status. Otherwise an order submission will be blocked unless stock status is `available`, `preorder`, or `backorder`. */
  stockStatus: Maybe<Scalars['String']['output']>;
  /** Indicates whether the product has stock tracking enabled. */
  stockTracking: Maybe<Scalars['Boolean']['output']>;
  /** Array of searchable tags to aid in search discoverability. */
  tags: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** List of products to display as up-sells on a product detail page. */
  upSells: Maybe<Array<Maybe<SwellProductUpSell>>>;
  /** Expandable list of variants representing unique variations of the product. Each variant is a combination of one or more `options`. For example, Size and Color. */
  variants: Maybe<SwellProductsVariants>;
};


/** Product */
export type SwellProductCategoriesArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** List of products sold as a bundle. Applicable only when `bundle=true`. */
export type SwellProductBundleItem = {
  __typename?: 'SwellProductBundleItem';
  id: Maybe<Scalars['ID']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  productName: Maybe<Scalars['String']['output']>;
  quantity: Maybe<Scalars['Int']['output']>;
  variant: Maybe<SwellProductVariant>;
  variantId: Maybe<Scalars['ID']['output']>;
};


/** List of products sold as a bundle. Applicable only when `bundle=true`. */
export type SwellProductBundleItemProductArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** List of products to display as cross-sells on a shopping cart page. */
export type SwellProductCrossSell = {
  __typename?: 'SwellProductCrossSell';
  discountAmount: Maybe<Scalars['SafeNumber']['output']>;
  discountPercent: Maybe<Scalars['SafeNumber']['output']>;
  discountType: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
};


/** List of products to display as cross-sells on a shopping cart page. */
export type SwellProductCrossSellProductArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** List of images depicting the bundle. */
export type SwellProductImage = {
  __typename?: 'SwellProductImage';
  caption: Maybe<Scalars['String']['output']>;
  file: Maybe<SwellProductImageFile>;
  id: Maybe<Scalars['ID']['output']>;
};

export type SwellProductImageFile = {
  __typename?: 'SwellProductImageFile';
  height: Maybe<Scalars['Int']['output']>;
  md5: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

/** Options that allow for variations of the base product. If the option is part of a variant or `required=true`, an option value must be set for the product to be added to a cart. */
export type SwellProductOption = {
  __typename?: 'SwellProductOption';
  active: Maybe<Scalars['Boolean']['output']>;
  attributeId: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  inputHint: Maybe<Scalars['String']['output']>;
  inputMulti: Maybe<Scalars['Boolean']['output']>;
  inputType: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parentId: Maybe<Scalars['ID']['output']>;
  parentValueIds: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  /** Indicates the option requires a value */
  required: Maybe<Scalars['Boolean']['output']>;
  subscription: Maybe<Scalars['Boolean']['output']>;
  /** List of values for this option */
  values: Maybe<Array<Maybe<SwellProductOptionValue>>>;
  /** Indicates the option is an aspect of variants */
  variant: Maybe<Scalars['Boolean']['output']>;
};

/** List of values for this option */
export type SwellProductOptionValue = {
  __typename?: 'SwellProductOptionValue';
  color: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  image: Maybe<SwellProductOptionValueImage>;
  images: Maybe<Array<Maybe<SwellProductOptionValueImage>>>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  /** Shipment weight added if the option value is selected */
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  subscriptionInterval: Maybe<Scalars['String']['output']>;
  subscriptionIntervalCount: Maybe<Scalars['Int']['output']>;
  subscriptionTrialDays: Maybe<Scalars['Int']['output']>;
};

export type SwellProductOptionValueImage = {
  __typename?: 'SwellProductOptionValueImage';
  caption: Maybe<Scalars['String']['output']>;
  contentType: Maybe<Scalars['String']['output']>;
  data: Maybe<Scalars['JSON']['output']>;
  dateUploaded: Maybe<Scalars['DateTime']['output']>;
  file: Maybe<SwellProductOptionValueImageFile>;
  filename: Maybe<Scalars['String']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  length: Maybe<Scalars['Int']['output']>;
  md5: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  private: Maybe<Scalars['Boolean']['output']>;
  url: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

export type SwellProductOptionValueImageFile = {
  __typename?: 'SwellProductOptionValueImageFile';
  contentType: Maybe<Scalars['String']['output']>;
  data: Maybe<Scalars['JSON']['output']>;
  dateUploaded: Maybe<Scalars['DateTime']['output']>;
  filename: Maybe<Scalars['String']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  length: Maybe<Scalars['Int']['output']>;
  md5: Maybe<Scalars['String']['output']>;
  metadata: Maybe<Scalars['JSON']['output']>;
  private: Maybe<Scalars['Boolean']['output']>;
  url: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

/** Price rules determined by cart quantity or customer account group. Overrides `price` and `sale_price` when conditions match. */
export type SwellProductPrice = {
  __typename?: 'SwellProductPrice';
  accountGroup: Maybe<Scalars['String']['output']>;
  discountPercent: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  quantityMax: Maybe<Scalars['Int']['output']>;
  quantityMin: Maybe<Scalars['Int']['output']>;
};

/** Configuration of one or more purchase options for the product. Can be `standard` for one-time purchases or `subscription` for a subscription plan. Products can support both purchase options simultaneously. */
export type SwellProductPurchaseOptions = {
  __typename?: 'SwellProductPurchaseOptions';
  standard: Maybe<SwellProductPurchaseOptionsStandard>;
  subscription: Maybe<SwellProductPurchaseOptionsSubscription>;
  trial: Maybe<SwellProductPurchaseOptionsTrial>;
};

export type SwellProductPurchaseOptionsStandard = {
  __typename?: 'SwellProductPurchaseOptionsStandard';
  accountGroups: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  active: Maybe<Scalars['Boolean']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  origPrice: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  prices: Maybe<Array<Maybe<SwellProductPurchaseOptionsStandardPrice>>>;
  sale: Maybe<Scalars['Boolean']['output']>;
  salePrice: Maybe<Scalars['SafeNumber']['output']>;
};

export type SwellProductPurchaseOptionsStandardPrice = {
  __typename?: 'SwellProductPurchaseOptionsStandardPrice';
  accountGroup: Maybe<Scalars['String']['output']>;
  discountPercent: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  quantityMax: Maybe<Scalars['Int']['output']>;
  quantityMin: Maybe<Scalars['Int']['output']>;
};

export type SwellProductPurchaseOptionsSubscription = {
  __typename?: 'SwellProductPurchaseOptionsSubscription';
  accountGroups: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  active: Maybe<Scalars['Boolean']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  plans: Maybe<Array<Maybe<SwellProductPurchaseOptionsSubscriptionPlan>>>;
};

export type SwellProductPurchaseOptionsSubscriptionPlan = {
  __typename?: 'SwellProductPurchaseOptionsSubscriptionPlan';
  active: Maybe<Scalars['Boolean']['output']>;
  billingSchedule: Maybe<SwellProductPurchaseOptionsSubscriptionPlanBillingSchedule>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  name: Maybe<Scalars['String']['output']>;
  orderSchedule: Maybe<SwellProductPurchaseOptionsSubscriptionPlanOrderSchedule>;
  price: Maybe<Scalars['SafeNumber']['output']>;
};

export type SwellProductPurchaseOptionsSubscriptionPlanBillingSchedule = {
  __typename?: 'SwellProductPurchaseOptionsSubscriptionPlanBillingSchedule';
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
};

export type SwellProductPurchaseOptionsSubscriptionPlanOrderSchedule = {
  __typename?: 'SwellProductPurchaseOptionsSubscriptionPlanOrderSchedule';
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
};

export type SwellProductPurchaseOptionsTrial = {
  __typename?: 'SwellProductPurchaseOptionsTrial';
  active: Maybe<Scalars['Boolean']['output']>;
  authAmount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  prices: Maybe<Array<Maybe<SwellProductPurchaseOptionsTrialPrice>>>;
  trialDays: Maybe<Scalars['Int']['output']>;
};

export type SwellProductPurchaseOptionsTrialPrice = {
  __typename?: 'SwellProductPurchaseOptionsTrialPrice';
  accountGroup: Maybe<Scalars['String']['output']>;
  authAmount: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
};

/** List of products to display as up-sells on a product detail page. */
export type SwellProductUpSell = {
  __typename?: 'SwellProductUpSell';
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
};


/** List of products to display as up-sells on a product detail page. */
export type SwellProductUpSellProductArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

/** Expandable list of variants representing unique variations of the product. Each variant is a combination of one or more `options`. For example, Size and Color. */
export type SwellProductVariant = {
  __typename?: 'SwellProductVariant';
  attributes: Maybe<Scalars['JSON']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  images: Maybe<Array<Maybe<SwellProductVariantImage>>>;
  name: Maybe<Scalars['String']['output']>;
  optionValueIds: Maybe<Array<Maybe<Scalars['ID']['output']>>>;
  origPrice: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  prices: Maybe<Array<Maybe<SwellProductVariantPrice>>>;
  purchaseOptions: Maybe<SwellProductVariantPurchaseOptions>;
  /** SKU */
  sku: Maybe<Scalars['String']['output']>;
  stockLevel: Maybe<Scalars['Int']['output']>;
};

export type SwellProductVariantImage = {
  __typename?: 'SwellProductVariantImage';
  caption: Maybe<Scalars['String']['output']>;
  file: Maybe<SwellProductVariantImageFile>;
  id: Maybe<Scalars['ID']['output']>;
};

export type SwellProductVariantImageFile = {
  __typename?: 'SwellProductVariantImageFile';
  height: Maybe<Scalars['Int']['output']>;
  md5: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

export type SwellProductVariantPrice = {
  __typename?: 'SwellProductVariantPrice';
  accountGroup: Maybe<Scalars['String']['output']>;
  discountPercent: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  quantityMax: Maybe<Scalars['Int']['output']>;
  quantityMin: Maybe<Scalars['Int']['output']>;
};

export type SwellProductVariantPurchaseOptions = {
  __typename?: 'SwellProductVariantPurchaseOptions';
  standard: Maybe<SwellProductVariantPurchaseOptionsStandard>;
};

export type SwellProductVariantPurchaseOptionsStandard = {
  __typename?: 'SwellProductVariantPurchaseOptionsStandard';
  origPrice: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  prices: Maybe<Array<Maybe<SwellProductVariantPurchaseOptionsStandardPrice>>>;
  sale: Maybe<Scalars['Boolean']['output']>;
  salePrice: Maybe<Scalars['SafeNumber']['output']>;
};

export type SwellProductVariantPurchaseOptionsStandardPrice = {
  __typename?: 'SwellProductVariantPurchaseOptionsStandardPrice';
  accountGroup: Maybe<Scalars['String']['output']>;
  discountPercent: Maybe<Scalars['SafeNumber']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  quantityMax: Maybe<Scalars['Int']['output']>;
  quantityMin: Maybe<Scalars['Int']['output']>;
};

export type SwellProducts = {
  __typename?: 'SwellProducts';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellProduct>>>;
};

export type SwellProductsVariants = {
  __typename?: 'SwellProductsVariants';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellProductVariant>>>;
};

export type SwellSettings = {
  __typename?: 'SwellSettings';
  store: Maybe<SwellSettingsStore>;
  values: Maybe<Scalars['JSON']['output']>;
};

export type SwellSettingsMenus = {
  __typename?: 'SwellSettingsMenus';
  sections: Maybe<Array<Maybe<SwellSettingsMenusSection>>>;
};

export type SwellSettingsMenusSection = {
  __typename?: 'SwellSettingsMenusSection';
  id: Maybe<Scalars['String']['output']>;
  items: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
  name: Maybe<Scalars['String']['output']>;
  themeId: Maybe<Scalars['String']['output']>;
  themeMenuId: Maybe<Scalars['String']['output']>;
};

export type SwellSettingsPayments = {
  __typename?: 'SwellSettingsPayments';
  methods: Maybe<Scalars['JSON']['output']>;
};

export type SwellSettingsStore = {
  __typename?: 'SwellSettingsStore';
  analyticsScripts: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  currencies: Maybe<Array<Maybe<SwellSettingsStoreCurrency>>>;
  currency: Maybe<Scalars['String']['output']>;
  facebookPixelId: Maybe<Scalars['String']['output']>;
  homePage: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['String']['output']>;
  locale: Maybe<Scalars['String']['output']>;
  locales: Maybe<Array<Maybe<SwellSettingsStoreLocale>>>;
  name: Maybe<Scalars['String']['output']>;
  publicKey: Maybe<Scalars['String']['output']>;
  supportEmail: Maybe<Scalars['String']['output']>;
  supportPhone: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export type SwellSettingsStoreCurrency = {
  __typename?: 'SwellSettingsStoreCurrency';
  code: Maybe<Scalars['String']['output']>;
  decimals: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  priced: Maybe<Scalars['Boolean']['output']>;
  rate: Maybe<Scalars['SafeNumber']['output']>;
  symbol: Maybe<Scalars['String']['output']>;
  type: Maybe<Scalars['String']['output']>;
};

export type SwellSettingsStoreLocale = {
  __typename?: 'SwellSettingsStoreLocale';
  code: Maybe<Scalars['String']['output']>;
  fallback: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type SwellSettingsSubscriptions = {
  __typename?: 'SwellSettingsSubscriptions';
  features: Maybe<Scalars['JSON']['output']>;
  pauseNextSkipThreshold: Maybe<Scalars['Int']['output']>;
};

/** Subscription */
export type SwellSubscription = {
  __typename?: 'SwellSubscription';
  /** ID of the subscribed customer's account. */
  accountId: Maybe<Scalars['ID']['output']>;
  /** Indicates the subscription is currently active. */
  active: Maybe<Scalars['Boolean']['output']>;
  /** Subscription billing details. */
  billing: Maybe<SwellSubscriptionBilling>;
  /** Billing schedule for subscription plan. */
  billingSchedule: Maybe<SwellSubscriptionBillingSchedule>;
  /** When `true`, indicates the subscription was or will be canceled at the end of the billing period. */
  cancelAtEnd: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the subscription was canceled. */
  canceled: Maybe<Scalars['Boolean']['output']>;
  /** Coupon code applied to the subscription. See coupons for details. */
  couponCode: Maybe<Scalars['String']['output']>;
  currency: Maybe<Scalars['String']['output']>;
  /** Currency rate used in calculating the fixed amount. */
  currencyRate: Maybe<Scalars['SafeNumber']['output']>;
  /** Date the subscription was canceled, if applicable. */
  dateCanceled: Maybe<Scalars['DateTime']['output']>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  /** End date for the subscription order period. */
  dateOrderPeriodEnd: Maybe<Scalars['DateTime']['output']>;
  /** Date the subscription was unpaused, if applicable. */
  datePauseEnd: Maybe<Scalars['DateTime']['output']>;
  /** Date the subscription was paused, if applicable. */
  datePaused: Maybe<Scalars['DateTime']['output']>;
  /** When automated payment has failed, this is the date when the system will automatically retry. */
  datePaymentRetry: Maybe<Scalars['DateTime']['output']>;
  /** End date of the current billing period. */
  datePeriodEnd: Maybe<Scalars['DateTime']['output']>;
  /** Start date of the current billing period. */
  datePeriodStart: Maybe<Scalars['DateTime']['output']>;
  /** Date the trial period did end in the past or will end in the future. Changing this value can be used to update the billing period of a subscription with or without a trial. For example, to set the monthly billing date to the 1st of the month, update `date_trial_end `to the first of the next month. */
  dateTrialEnd: Maybe<Scalars['DateTime']['output']>;
  /** Date the trial period started, if applicable. */
  dateTrialStart: Maybe<Scalars['DateTime']['output']>;
  dateUpdated: Maybe<Scalars['DateTime']['output']>;
  /** Total discount amount. */
  discountTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Grand total of the next invoice including line items and taxes. */
  grandTotal: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  /** Amount invoiced for the last billing period. */
  invoiceTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total discount applied to line items. */
  itemDiscount: Maybe<Scalars['SafeNumber']['output']>;
  /** Total taxes applied to line items. */
  itemTax: Maybe<Scalars['SafeNumber']['output']>;
  /** Amount invoiced for the last billing period. */
  itemTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of invoice line items added to the subscription. Recurring items are charged repeatedly, otherwise they are charged on the next invoice and then removed from the subscription. */
  items: Maybe<Array<Maybe<SwellSubscriptionItem>>>;
  /** Plan options matching one or more of `product.options`. When setting this value, specify either option `id` or `name` (case-insensitive) to identify the option. */
  options: Maybe<Array<Maybe<SwellSubscriptionOption>>>;
  /** ID of the order that originated the subscription, if applicable. */
  orderId: Maybe<Scalars['ID']['output']>;
  /** Order schedule for the subscription plan. */
  orderSchedule: Maybe<SwellSubscriptionOrderSchedule>;
  orders: Maybe<SwellOrders>;
  /** Indicates the last invoice was fully paid. */
  paid: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether or not a subscription is paused. */
  paused: Maybe<Scalars['Boolean']['output']>;
  /** Balance of payments on the invoice for the last billing period. A negative number indicates payment is owed, while a positive balance indicates refund is due. Zero balance indicates the invoice was fully paid. */
  paymentBalance: Maybe<Scalars['SafeNumber']['output']>;
  /** Total amount of payments for the last billing period. */
  paymentTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** ID of the subscription plan. */
  planId: Maybe<Scalars['ID']['output']>;
  /** Name of the subscription plan. */
  planName: Maybe<Scalars['String']['output']>;
  /** Price of the plan. Plan price can be overridden when creating or updating a subscription. */
  price: Maybe<Scalars['SafeNumber']['output']>;
  /** Total price of the plan (`price * quantity`). */
  priceTotal: Maybe<Scalars['SafeNumber']['output']>;
  product: Maybe<SwellProduct>;
  /** Total discount amount of the subscription plan, divided by quantity. */
  productDiscountEach: Maybe<Scalars['SafeNumber']['output']>;
  /** Total discount applied to the subscription plan. */
  productDiscountTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** ID of the subscription plan product. */
  productId: Maybe<Scalars['ID']['output']>;
  /** Total tax amount of the subscription plan, divided by quantity. */
  productTaxEach: Maybe<Scalars['SafeNumber']['output']>;
  /** Total tax applied to the subscription plan. */
  productTaxTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Quantity of the plan to charge. */
  quantity: Maybe<Scalars['Int']['output']>;
  /** Total recurring discount applied to the subscription including line items. */
  recurringDiscountTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total discount applied to recurring line items. */
  recurringItemDiscount: Maybe<Scalars['SafeNumber']['output']>;
  /** Total taxes applied to recurring line items. */
  recurringItemTax: Maybe<Scalars['SafeNumber']['output']>;
  /** Sum of all recurring line items before discounts and taxes. */
  recurringItemTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total of taxes applied separately from the subscription plan and recurring line items. */
  recurringTaxIncludedTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total taxes applied to the subscription including recurring line items. */
  recurringTaxTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Recurring total of the subscription including line items and taxes. */
  recurringTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Subscription shipping details. */
  shipping: Maybe<SwellSubscriptionShipping>;
  /** Current status of the subscription. Can be `pending`, `active`, `trial`, `pastdue`, `unpaid`, `canceled`, or `paid`. */
  status: Maybe<Scalars['String']['output']>;
  /** Sum of all line items before discounts and taxes. */
  subTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total of taxes applied separately from the subscription plan and line items. */
  taxIncludedTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** Total taxes applied to the subscription including line items. */
  taxTotal: Maybe<Scalars['SafeNumber']['output']>;
  /** List of taxes applied to the subscription. */
  taxes: Maybe<Array<Maybe<SwellSubscriptionTax>>>;
  /** When true, taxes are not applied to the subscription. When false, taxes are calculated and applied to the subscription. */
  taxesFixed: Maybe<Scalars['Boolean']['output']>;
  /** Indicates the subscription is in a trial period and the first invoice will be issued on `date_trial_end`. */
  trial: Maybe<Scalars['Boolean']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
  /** Indicates the last invoice was marked as unpaid. This occurs automatically after all payment attempts are exhausted, as configured in subscription settings. */
  unpaid: Maybe<Scalars['Boolean']['output']>;
  variant: Maybe<SwellProductVariant>;
  /** ID of the subscription plan variant, if applicable. */
  variantId: Maybe<Scalars['ID']['output']>;
};


/** Subscription */
export type SwellSubscriptionOrdersArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  where: InputMaybe<Scalars['JSON']['input']>;
};

/** Subscription billing details. */
export type SwellSubscriptionBilling = {
  __typename?: 'SwellSubscriptionBilling';
  accountCardId: Maybe<Scalars['ID']['output']>;
  address1: Maybe<Scalars['String']['output']>;
  address2: Maybe<Scalars['String']['output']>;
  card: Maybe<SwellSubscriptionBillingCard>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  default: Maybe<Scalars['Boolean']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  intent: Maybe<Scalars['JSON']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  method: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  state: Maybe<Scalars['String']['output']>;
  useAccount: Maybe<Scalars['Boolean']['output']>;
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellSubscriptionBillingCard = {
  __typename?: 'SwellSubscriptionBillingCard';
  addressCheck: Maybe<Scalars['String']['output']>;
  brand: Maybe<Scalars['String']['output']>;
  cvcCheck: Maybe<Scalars['String']['output']>;
  expMonth: Maybe<Scalars['Int']['output']>;
  expYear: Maybe<Scalars['Int']['output']>;
  gateway: Maybe<Scalars['String']['output']>;
  last4: Maybe<Scalars['String']['output']>;
  test: Maybe<Scalars['Boolean']['output']>;
  token: Maybe<Scalars['String']['output']>;
  zipCheck: Maybe<Scalars['String']['output']>;
};

export type SwellSubscriptionBillingCardInput = {
  addressCheck: InputMaybe<Scalars['String']['input']>;
  brand: InputMaybe<Scalars['String']['input']>;
  cvcCheck: InputMaybe<Scalars['String']['input']>;
  expMonth: InputMaybe<Scalars['Int']['input']>;
  expYear: InputMaybe<Scalars['Int']['input']>;
  gateway: InputMaybe<Scalars['String']['input']>;
  last4: InputMaybe<Scalars['String']['input']>;
  test: InputMaybe<Scalars['Boolean']['input']>;
  token: InputMaybe<Scalars['String']['input']>;
  zipCheck: InputMaybe<Scalars['String']['input']>;
};

export type SwellSubscriptionBillingInput = {
  accountCardId: InputMaybe<Scalars['ID']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  card: InputMaybe<SwellSubscriptionBillingCardInput>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  default: InputMaybe<Scalars['Boolean']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  intent: InputMaybe<Scalars['JSON']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  method: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  useAccount: InputMaybe<Scalars['Boolean']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

/** Billing schedule for subscription plan. */
export type SwellSubscriptionBillingSchedule = {
  __typename?: 'SwellSubscriptionBillingSchedule';
  dateLimitEnd: Maybe<Scalars['DateTime']['output']>;
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
  limitCurrent: Maybe<Scalars['Int']['output']>;
  trialDays: Maybe<Scalars['Int']['output']>;
};

export type SwellSubscriptionBillingScheduleInput = {
  dateLimitEnd: InputMaybe<Scalars['DateTime']['input']>;
  interval: InputMaybe<Scalars['String']['input']>;
  intervalCount: InputMaybe<Scalars['Int']['input']>;
  limit: InputMaybe<Scalars['Int']['input']>;
  limitCurrent: InputMaybe<Scalars['Int']['input']>;
  trialDays: InputMaybe<Scalars['Int']['input']>;
};

export type SwellSubscriptionInput = {
  billing: InputMaybe<SwellSubscriptionBillingInput>;
  billingSchedule: InputMaybe<SwellSubscriptionBillingScheduleInput>;
  cancelAtEnd: InputMaybe<Scalars['Boolean']['input']>;
  canceled: InputMaybe<Scalars['Boolean']['input']>;
  couponCode: InputMaybe<Scalars['String']['input']>;
  datePauseEnd: InputMaybe<Scalars['DateTime']['input']>;
  items: InputMaybe<Array<InputMaybe<SwellSubscriptionItemInput>>>;
  options: InputMaybe<Array<InputMaybe<SwellSubscriptionOptionInput>>>;
  paused: InputMaybe<Scalars['Boolean']['input']>;
  planId: InputMaybe<Scalars['ID']['input']>;
  productId: InputMaybe<Scalars['ID']['input']>;
  quantity: InputMaybe<Scalars['Int']['input']>;
  shipping: InputMaybe<SwellSubscriptionShippingInput>;
  variantId: InputMaybe<Scalars['ID']['input']>;
};

/** List of invoice line items added to the subscription. Recurring items are charged repeatedly, otherwise they are charged on the next invoice and then removed from the subscription. */
export type SwellSubscriptionItem = {
  __typename?: 'SwellSubscriptionItem';
  bundleItems: Maybe<Array<Maybe<SwellSubscriptionItemBundleItem>>>;
  dateCreated: Maybe<Scalars['DateTime']['output']>;
  delivery: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  discountEach: Maybe<Scalars['SafeNumber']['output']>;
  discountTotal: Maybe<Scalars['SafeNumber']['output']>;
  discounts: Maybe<Array<Maybe<SwellSubscriptionItemDiscount>>>;
  id: Maybe<Scalars['ID']['output']>;
  options: Maybe<Array<Maybe<SwellSubscriptionItemOption>>>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  priceTotal: Maybe<Scalars['SafeNumber']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  proration: Maybe<Scalars['Boolean']['output']>;
  prorationProductId: Maybe<Scalars['ID']['output']>;
  quantity: Maybe<Scalars['Int']['output']>;
  recurring: Maybe<Scalars['Boolean']['output']>;
  recurringDiscountEach: Maybe<Scalars['SafeNumber']['output']>;
  recurringDiscountTotal: Maybe<Scalars['SafeNumber']['output']>;
  recurringPrice: Maybe<Scalars['SafeNumber']['output']>;
  recurringPriceTotal: Maybe<Scalars['SafeNumber']['output']>;
  recurringTaxEach: Maybe<Scalars['SafeNumber']['output']>;
  recurringTaxTotal: Maybe<Scalars['SafeNumber']['output']>;
  taxEach: Maybe<Scalars['SafeNumber']['output']>;
  taxTotal: Maybe<Scalars['SafeNumber']['output']>;
  taxes: Maybe<Array<Maybe<SwellSubscriptionItemTax>>>;
  variantId: Maybe<Scalars['ID']['output']>;
};


/** List of invoice line items added to the subscription. Recurring items are charged repeatedly, otherwise they are charged on the next invoice and then removed from the subscription. */
export type SwellSubscriptionItemProductArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

export type SwellSubscriptionItemBundleItem = {
  __typename?: 'SwellSubscriptionItemBundleItem';
  amountRatio: Maybe<Scalars['SafeNumber']['output']>;
  discountEach: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  product: Maybe<SwellProduct>;
  productId: Maybe<Scalars['ID']['output']>;
  quantity: Maybe<Scalars['Int']['output']>;
  quantityTotal: Maybe<Scalars['Int']['output']>;
  taxEach: Maybe<Scalars['SafeNumber']['output']>;
  variantId: Maybe<Scalars['ID']['output']>;
};


export type SwellSubscriptionItemBundleItemProductArgs = {
  _currency: InputMaybe<Scalars['String']['input']>;
  _locale: InputMaybe<Scalars['String']['input']>;
};

export type SwellSubscriptionItemDiscount = {
  __typename?: 'SwellSubscriptionItemDiscount';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
};

export type SwellSubscriptionItemInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  options: InputMaybe<Array<InputMaybe<SwellSubscriptionItemOptionInput>>>;
  productId: InputMaybe<Scalars['ID']['input']>;
  quantity: InputMaybe<Scalars['Int']['input']>;
  variantId: InputMaybe<Scalars['ID']['input']>;
};

export type SwellSubscriptionItemOption = {
  __typename?: 'SwellSubscriptionItemOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueId: Maybe<Scalars['ID']['output']>;
  variant: Maybe<Scalars['Boolean']['output']>;
};

export type SwellSubscriptionItemOptionInput = {
  id: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  shipmentWeight: InputMaybe<Scalars['SafeNumber']['input']>;
  value: InputMaybe<Scalars['String']['input']>;
  valueId: InputMaybe<Scalars['ID']['input']>;
  variant: InputMaybe<Scalars['Boolean']['input']>;
};

export type SwellSubscriptionItemTax = {
  __typename?: 'SwellSubscriptionItemTax';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
};

/** Plan options matching one or more of `product.options`. When setting this value, specify either option `id` or `name` (case-insensitive) to identify the option. */
export type SwellSubscriptionOption = {
  __typename?: 'SwellSubscriptionOption';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  shipmentWeight: Maybe<Scalars['SafeNumber']['output']>;
  value: Maybe<Scalars['String']['output']>;
  valueId: Maybe<Scalars['ID']['output']>;
  variant: Maybe<Scalars['Boolean']['output']>;
};

export type SwellSubscriptionOptionInput = {
  id: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  shipmentWeight: InputMaybe<Scalars['SafeNumber']['input']>;
  value: InputMaybe<Scalars['String']['input']>;
  valueId: InputMaybe<Scalars['ID']['input']>;
  variant: InputMaybe<Scalars['Boolean']['input']>;
};

/** Order schedule for the subscription plan. */
export type SwellSubscriptionOrderSchedule = {
  __typename?: 'SwellSubscriptionOrderSchedule';
  dateLimitEnd: Maybe<Scalars['DateTime']['output']>;
  interval: Maybe<Scalars['String']['output']>;
  intervalCount: Maybe<Scalars['Int']['output']>;
  limit: Maybe<Scalars['Int']['output']>;
  limitCurrent: Maybe<Scalars['Int']['output']>;
};

/** Subscription shipping details. */
export type SwellSubscriptionShipping = {
  __typename?: 'SwellSubscriptionShipping';
  accountAddressId: Maybe<Scalars['ID']['output']>;
  address1: Maybe<Scalars['String']['output']>;
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  default: Maybe<Scalars['Boolean']['output']>;
  firstName: Maybe<Scalars['String']['output']>;
  lastName: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  pickup: Maybe<Scalars['Boolean']['output']>;
  price: Maybe<Scalars['SafeNumber']['output']>;
  service: Maybe<Scalars['String']['output']>;
  serviceName: Maybe<Scalars['String']['output']>;
  state: Maybe<Scalars['String']['output']>;
  useAccount: Maybe<Scalars['Boolean']['output']>;
  zip: Maybe<Scalars['String']['output']>;
};

export type SwellSubscriptionShippingInput = {
  accountAddressId: InputMaybe<Scalars['ID']['input']>;
  address1: InputMaybe<Scalars['String']['input']>;
  address2: InputMaybe<Scalars['String']['input']>;
  city: InputMaybe<Scalars['String']['input']>;
  country: InputMaybe<Scalars['String']['input']>;
  default: InputMaybe<Scalars['Boolean']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  pickup: InputMaybe<Scalars['Boolean']['input']>;
  price: InputMaybe<Scalars['SafeNumber']['input']>;
  service: InputMaybe<Scalars['String']['input']>;
  serviceName: InputMaybe<Scalars['String']['input']>;
  state: InputMaybe<Scalars['String']['input']>;
  useAccount: InputMaybe<Scalars['Boolean']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

/** List of taxes applied to the subscription. */
export type SwellSubscriptionTax = {
  __typename?: 'SwellSubscriptionTax';
  amount: Maybe<Scalars['SafeNumber']['output']>;
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  priority: Maybe<Scalars['Int']['output']>;
  rate: Maybe<Scalars['SafeNumber']['output']>;
};

export type SwellSubscriptions = {
  __typename?: 'SwellSubscriptions';
  count: Maybe<Scalars['Int']['output']>;
  page: Maybe<Scalars['Int']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pages: Maybe<Array<Maybe<Page>>>;
  results: Maybe<Array<Maybe<SwellSubscription>>>;
};

export type CartFragment = (
  { __typename?: 'SwellCart' }
  & Pick<SwellCart, 'checkoutUrl' | 'subTotal' | 'grandTotal' | 'currency'>
  & { taxes: Maybe<Array<Maybe<(
    { __typename?: 'SwellCartTax' }
    & Pick<SwellCartTax, 'amount'>
  )>>>, items: Maybe<Array<Maybe<(
    { __typename?: 'SwellCartItem' }
    & Pick<SwellCartItem, 'id' | 'quantity' | 'price' | 'discountTotal' | 'taxTotal' | 'variantId'>
    & { options: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartItemOption' }
      & Pick<SwellCartItemOption, 'name' | 'value'>
    )>>>, variant: Maybe<(
      { __typename?: 'SwellProductVariant' }
      & Pick<SwellProductVariant, 'name'>
    )>, product: Maybe<(
      { __typename?: 'SwellProduct' }
      & Pick<SwellProduct, 'id' | 'name' | 'currency' | 'slug'>
      & { images: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductImage' }
        & Pick<SwellProductImage, 'caption'>
        & { file: Maybe<(
          { __typename?: 'SwellProductImageFile' }
          & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
        )> }
      )>>> }
    )> }
  )>>> }
);

export type CartItemFragment = (
  { __typename?: 'SwellCartItem' }
  & Pick<SwellCartItem, 'id' | 'quantity' | 'price' | 'discountTotal' | 'taxTotal' | 'variantId'>
  & { options: Maybe<Array<Maybe<(
    { __typename?: 'SwellCartItemOption' }
    & Pick<SwellCartItemOption, 'name' | 'value'>
  )>>>, variant: Maybe<(
    { __typename?: 'SwellProductVariant' }
    & Pick<SwellProductVariant, 'name'>
  )>, product: Maybe<(
    { __typename?: 'SwellProduct' }
    & Pick<SwellProduct, 'id' | 'name' | 'currency' | 'slug'>
    & { images: Maybe<Array<Maybe<(
      { __typename?: 'SwellProductImage' }
      & Pick<SwellProductImage, 'caption'>
      & { file: Maybe<(
        { __typename?: 'SwellProductImageFile' }
        & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
      )> }
    )>>> }
  )> }
);

export type CategoryFragment = (
  { __typename?: 'SwellCategory' }
  & Pick<SwellCategory, 'name' | 'slug' | 'metaDescription' | 'metaKeywords' | 'description'>
);

export type MenuFragment = (
  { __typename?: 'SwellSettingsMenusSection' }
  & Pick<SwellSettingsMenusSection, 'id' | 'name' | 'items'>
);

export type ProductFragment = (
  { __typename?: 'SwellProduct' }
  & Pick<SwellProduct, 'id' | 'currency' | 'slug' | 'stockTracking' | 'stockPurchasable' | 'stockLevel' | 'name' | 'description' | 'price' | 'metaTitle' | 'metaDescription' | 'tags'>
  & { options: Maybe<Array<Maybe<(
    { __typename?: 'SwellProductOption' }
    & Pick<SwellProductOption, 'name' | 'id' | 'description' | 'variant'>
    & { values: Maybe<Array<Maybe<(
      { __typename?: 'SwellProductOptionValue' }
      & Pick<SwellProductOptionValue, 'id' | 'name' | 'price'>
    )>>> }
  )>>>, variants: Maybe<(
    { __typename?: 'SwellProductsVariants' }
    & { results: Maybe<Array<Maybe<(
      { __typename?: 'SwellProductVariant' }
      & Pick<SwellProductVariant, 'id' | 'name' | 'sku' | 'optionValueIds' | 'stockLevel' | 'currency'>
      & { prices: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductVariantPrice' }
        & Pick<SwellProductVariantPrice, 'price' | 'discountPercent'>
      )>>> }
    )>>> }
  )>, images: Maybe<Array<Maybe<(
    { __typename?: 'SwellProductImage' }
    & Pick<SwellProductImage, 'caption'>
    & { file: Maybe<(
      { __typename?: 'SwellProductImageFile' }
      & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
    )> }
  )>>> }
);

export type ProductVariantFragment = (
  { __typename?: 'SwellProductVariant' }
  & Pick<SwellProductVariant, 'id' | 'name' | 'sku' | 'optionValueIds' | 'stockLevel' | 'currency'>
  & { prices: Maybe<Array<Maybe<(
    { __typename?: 'SwellProductVariantPrice' }
    & Pick<SwellProductVariantPrice, 'price' | 'discountPercent'>
  )>>> }
);

export type AddToCartMutationVariables = Exact<{
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  options: InputMaybe<Array<InputMaybe<SwellCartItemOptionInput>> | InputMaybe<SwellCartItemOptionInput>>;
}>;


export type AddToCartMutation = (
  { __typename?: 'Mutation' }
  & { addCartItem: Maybe<(
    { __typename?: 'SwellCart' }
    & Pick<SwellCart, 'checkoutUrl' | 'subTotal' | 'grandTotal' | 'currency'>
    & { taxes: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartTax' }
      & Pick<SwellCartTax, 'amount'>
    )>>>, items: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartItem' }
      & Pick<SwellCartItem, 'id' | 'quantity' | 'price' | 'discountTotal' | 'taxTotal' | 'variantId'>
      & { options: Maybe<Array<Maybe<(
        { __typename?: 'SwellCartItemOption' }
        & Pick<SwellCartItemOption, 'name' | 'value'>
      )>>>, variant: Maybe<(
        { __typename?: 'SwellProductVariant' }
        & Pick<SwellProductVariant, 'name'>
      )>, product: Maybe<(
        { __typename?: 'SwellProduct' }
        & Pick<SwellProduct, 'id' | 'name' | 'currency' | 'slug'>
        & { images: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductImage' }
          & Pick<SwellProductImage, 'caption'>
          & { file: Maybe<(
            { __typename?: 'SwellProductImageFile' }
            & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
          )> }
        )>>> }
      )> }
    )>>> }
  )> }
);

export type EditCartItemMutationVariables = Exact<{
  itemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type EditCartItemMutation = (
  { __typename?: 'Mutation' }
  & { updateCartItem: Maybe<(
    { __typename?: 'SwellCart' }
    & Pick<SwellCart, 'checkoutUrl' | 'subTotal' | 'grandTotal' | 'currency'>
    & { taxes: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartTax' }
      & Pick<SwellCartTax, 'amount'>
    )>>>, items: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartItem' }
      & Pick<SwellCartItem, 'id' | 'quantity' | 'price' | 'discountTotal' | 'taxTotal' | 'variantId'>
      & { options: Maybe<Array<Maybe<(
        { __typename?: 'SwellCartItemOption' }
        & Pick<SwellCartItemOption, 'name' | 'value'>
      )>>>, variant: Maybe<(
        { __typename?: 'SwellProductVariant' }
        & Pick<SwellProductVariant, 'name'>
      )>, product: Maybe<(
        { __typename?: 'SwellProduct' }
        & Pick<SwellProduct, 'id' | 'name' | 'currency' | 'slug'>
        & { images: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductImage' }
          & Pick<SwellProductImage, 'caption'>
          & { file: Maybe<(
            { __typename?: 'SwellProductImageFile' }
            & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
          )> }
        )>>> }
      )> }
    )>>> }
  )> }
);

export type RemoveFromCartMutationVariables = Exact<{
  itemId: Scalars['String']['input'];
}>;


export type RemoveFromCartMutation = (
  { __typename?: 'Mutation' }
  & { deleteCartItem: Maybe<(
    { __typename?: 'SwellCart' }
    & Pick<SwellCart, 'checkoutUrl' | 'subTotal' | 'grandTotal' | 'currency'>
    & { taxes: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartTax' }
      & Pick<SwellCartTax, 'amount'>
    )>>>, items: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartItem' }
      & Pick<SwellCartItem, 'id' | 'quantity' | 'price' | 'discountTotal' | 'taxTotal' | 'variantId'>
      & { options: Maybe<Array<Maybe<(
        { __typename?: 'SwellCartItemOption' }
        & Pick<SwellCartItemOption, 'name' | 'value'>
      )>>>, variant: Maybe<(
        { __typename?: 'SwellProductVariant' }
        & Pick<SwellProductVariant, 'name'>
      )>, product: Maybe<(
        { __typename?: 'SwellProduct' }
        & Pick<SwellProduct, 'id' | 'name' | 'currency' | 'slug'>
        & { images: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductImage' }
          & Pick<SwellProductImage, 'caption'>
          & { file: Maybe<(
            { __typename?: 'SwellProductImageFile' }
            & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
          )> }
        )>>> }
      )> }
    )>>> }
  )> }
);

export type GetCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartQuery = (
  { __typename?: 'Query' }
  & { cart: Maybe<(
    { __typename?: 'SwellCart' }
    & Pick<SwellCart, 'checkoutUrl' | 'subTotal' | 'grandTotal' | 'currency'>
    & { taxes: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartTax' }
      & Pick<SwellCartTax, 'amount'>
    )>>>, items: Maybe<Array<Maybe<(
      { __typename?: 'SwellCartItem' }
      & Pick<SwellCartItem, 'id' | 'quantity' | 'price' | 'discountTotal' | 'taxTotal' | 'variantId'>
      & { options: Maybe<Array<Maybe<(
        { __typename?: 'SwellCartItemOption' }
        & Pick<SwellCartItemOption, 'name' | 'value'>
      )>>>, variant: Maybe<(
        { __typename?: 'SwellProductVariant' }
        & Pick<SwellProductVariant, 'name'>
      )>, product: Maybe<(
        { __typename?: 'SwellProduct' }
        & Pick<SwellProduct, 'id' | 'name' | 'currency' | 'slug'>
        & { images: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductImage' }
          & Pick<SwellProductImage, 'caption'>
          & { file: Maybe<(
            { __typename?: 'SwellProductImageFile' }
            & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
          )> }
        )>>> }
      )> }
    )>>> }
  )> }
);

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = (
  { __typename?: 'Query' }
  & { categories: Maybe<(
    { __typename?: 'SwellCategories' }
    & { results: Maybe<Array<Maybe<(
      { __typename?: 'SwellCategory' }
      & Pick<SwellCategory, 'name' | 'slug' | 'metaDescription' | 'metaKeywords' | 'description'>
    )>>> }
  )> }
);

export type GetGategoryQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetGategoryQuery = (
  { __typename?: 'Query' }
  & { categoryBySlug: Maybe<(
    { __typename?: 'SwellCategory' }
    & Pick<SwellCategory, 'name' | 'slug' | 'metaDescription' | 'metaKeywords' | 'description'>
  )> }
);

export type GetMenusQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMenusQuery = (
  { __typename?: 'Query' }
  & { menuSettings: Maybe<(
    { __typename?: 'SwellSettingsMenus' }
    & { sections: Maybe<Array<Maybe<(
      { __typename?: 'SwellSettingsMenusSection' }
      & Pick<SwellSettingsMenusSection, 'id' | 'name' | 'items'>
    )>>> }
  )> }
);

export type GetProductQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetProductQuery = (
  { __typename?: 'Query' }
  & { productBySlug: Maybe<(
    { __typename?: 'SwellProduct' }
    & Pick<SwellProduct, 'id' | 'currency' | 'slug' | 'stockTracking' | 'stockPurchasable' | 'stockLevel' | 'name' | 'description' | 'price' | 'metaTitle' | 'metaDescription' | 'tags'>
    & { options: Maybe<Array<Maybe<(
      { __typename?: 'SwellProductOption' }
      & Pick<SwellProductOption, 'name' | 'id' | 'description' | 'variant'>
      & { values: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductOptionValue' }
        & Pick<SwellProductOptionValue, 'id' | 'name' | 'price'>
      )>>> }
    )>>>, variants: Maybe<(
      { __typename?: 'SwellProductsVariants' }
      & { results: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductVariant' }
        & Pick<SwellProductVariant, 'id' | 'name' | 'sku' | 'optionValueIds' | 'stockLevel' | 'currency'>
        & { prices: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductVariantPrice' }
          & Pick<SwellProductVariantPrice, 'price' | 'discountPercent'>
        )>>> }
      )>>> }
    )>, images: Maybe<Array<Maybe<(
      { __typename?: 'SwellProductImage' }
      & Pick<SwellProductImage, 'caption'>
      & { file: Maybe<(
        { __typename?: 'SwellProductImageFile' }
        & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
      )> }
    )>>> }
  )> }
);

export type GetProductsQueryVariables = Exact<{
  sort: InputMaybe<Scalars['String']['input']>;
  query: InputMaybe<Scalars['String']['input']>;
}>;


export type GetProductsQuery = (
  { __typename?: 'Query' }
  & { products: Maybe<(
    { __typename?: 'SwellProducts' }
    & { results: Maybe<Array<Maybe<(
      { __typename?: 'SwellProduct' }
      & Pick<SwellProduct, 'id' | 'currency' | 'slug' | 'stockTracking' | 'stockPurchasable' | 'stockLevel' | 'name' | 'description' | 'price' | 'metaTitle' | 'metaDescription' | 'tags'>
      & { options: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductOption' }
        & Pick<SwellProductOption, 'name' | 'id' | 'description' | 'variant'>
        & { values: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductOptionValue' }
          & Pick<SwellProductOptionValue, 'id' | 'name' | 'price'>
        )>>> }
      )>>>, variants: Maybe<(
        { __typename?: 'SwellProductsVariants' }
        & { results: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductVariant' }
          & Pick<SwellProductVariant, 'id' | 'name' | 'sku' | 'optionValueIds' | 'stockLevel' | 'currency'>
          & { prices: Maybe<Array<Maybe<(
            { __typename?: 'SwellProductVariantPrice' }
            & Pick<SwellProductVariantPrice, 'price' | 'discountPercent'>
          )>>> }
        )>>> }
      )>, images: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductImage' }
        & Pick<SwellProductImage, 'caption'>
        & { file: Maybe<(
          { __typename?: 'SwellProductImageFile' }
          & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
        )> }
      )>>> }
    )>>> }
  )> }
);

export type GetProductsByCategoryQueryVariables = Exact<{
  sort: InputMaybe<Scalars['String']['input']>;
  query: InputMaybe<Scalars['String']['input']>;
  category: InputMaybe<Scalars['String']['input']>;
}>;


export type GetProductsByCategoryQuery = (
  { __typename?: 'Query' }
  & { products: Maybe<(
    { __typename?: 'SwellProducts' }
    & { results: Maybe<Array<Maybe<(
      { __typename?: 'SwellProduct' }
      & Pick<SwellProduct, 'id' | 'currency' | 'slug' | 'stockTracking' | 'stockPurchasable' | 'stockLevel' | 'name' | 'description' | 'price' | 'metaTitle' | 'metaDescription' | 'tags'>
      & { options: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductOption' }
        & Pick<SwellProductOption, 'name' | 'id' | 'description' | 'variant'>
        & { values: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductOptionValue' }
          & Pick<SwellProductOptionValue, 'id' | 'name' | 'price'>
        )>>> }
      )>>>, variants: Maybe<(
        { __typename?: 'SwellProductsVariants' }
        & { results: Maybe<Array<Maybe<(
          { __typename?: 'SwellProductVariant' }
          & Pick<SwellProductVariant, 'id' | 'name' | 'sku' | 'optionValueIds' | 'stockLevel' | 'currency'>
          & { prices: Maybe<Array<Maybe<(
            { __typename?: 'SwellProductVariantPrice' }
            & Pick<SwellProductVariantPrice, 'price' | 'discountPercent'>
          )>>> }
        )>>> }
      )>, images: Maybe<Array<Maybe<(
        { __typename?: 'SwellProductImage' }
        & Pick<SwellProductImage, 'caption'>
        & { file: Maybe<(
          { __typename?: 'SwellProductImageFile' }
          & Pick<SwellProductImageFile, 'url' | 'width' | 'height'>
        )> }
      )>>> }
    )>>> }
  )> }
);

export const CartItemFragmentDoc = gql`
    fragment CartItem on SwellCartItem {
  id
  quantity
  price
  discountTotal
  taxTotal
  variantId
  options {
    name
    value
  }
  variant {
    name
  }
  product {
    id
    name
    currency
    slug
    images {
      file {
        url
        width
        height
      }
      caption
    }
  }
}
    `;
export const CartFragmentDoc = gql`
    fragment Cart on SwellCart {
  checkoutUrl
  subTotal
  grandTotal
  currency
  taxes {
    amount
  }
  items {
    ...CartItem
  }
}
    ${CartItemFragmentDoc}`;
export const CategoryFragmentDoc = gql`
    fragment Category on SwellCategory {
  name
  slug
  metaDescription
  metaKeywords
  description
}
    `;
export const MenuFragmentDoc = gql`
    fragment Menu on SwellSettingsMenusSection {
  id
  name
  items
}
    `;
export const ProductVariantFragmentDoc = gql`
    fragment ProductVariant on SwellProductVariant {
  id
  name
  sku
  prices {
    price
    discountPercent
  }
  optionValueIds
  stockLevel
  currency
}
    `;
export const ProductFragmentDoc = gql`
    fragment Product on SwellProduct {
  id
  currency
  slug
  stockTracking
  stockPurchasable
  stockLevel
  name
  description
  options {
    name
    id
    description
    variant
    values {
      id
      name
      price
    }
  }
  price
  variants {
    results {
      ...ProductVariant
    }
  }
  images {
    file {
      url
      width
      height
    }
    caption
  }
  metaTitle
  metaDescription
  tags
}
    ${ProductVariantFragmentDoc}`;
export const AddToCartDocument = gql`
    mutation addToCart($productId: ID!, $quantity: Int!, $options: [SwellCartItemOptionInput]) {
  addCartItem(
    input: {productId: $productId, quantity: $quantity, options: $options}
  ) {
    ...Cart
  }
}
    ${CartFragmentDoc}`;
export const EditCartItemDocument = gql`
    mutation editCartItem($itemId: String!, $quantity: Int!) {
  updateCartItem(itemId: $itemId, input: {quantity: $quantity}) {
    ...Cart
  }
}
    ${CartFragmentDoc}`;
export const RemoveFromCartDocument = gql`
    mutation removeFromCart($itemId: String!) {
  deleteCartItem(itemId: $itemId) {
    ...Cart
  }
}
    ${CartFragmentDoc}`;
export const GetCartDocument = gql`
    query getCart {
  cart {
    ...Cart
  }
}
    ${CartFragmentDoc}`;
export const GetCategoriesDocument = gql`
    query getCategories {
  categories {
    results {
      ...Category
    }
  }
}
    ${CategoryFragmentDoc}`;
export const GetGategoryDocument = gql`
    query getGategory($slug: String!) {
  categoryBySlug(slug: $slug) {
    ...Category
  }
}
    ${CategoryFragmentDoc}`;
export const GetMenusDocument = gql`
    query getMenus {
  menuSettings {
    sections {
      ...Menu
    }
  }
}
    ${MenuFragmentDoc}`;
export const GetProductDocument = gql`
    query getProduct($slug: String!) {
  productBySlug(slug: $slug) {
    ...Product
  }
}
    ${ProductFragmentDoc}`;
export const GetProductsDocument = gql`
    query getProducts($sort: String, $query: String) {
  products(sort: $sort, search: $query) {
    results {
      ...Product
    }
  }
}
    ${ProductFragmentDoc}`;
export const GetProductsByCategoryDocument = gql`
    query getProductsByCategory($sort: String, $query: String, $category: String) {
  products(sort: $sort, search: $query, categories: [$category]) {
    results {
      ...Product
    }
  }
}
    ${ProductFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();
const AddToCartDocumentString = print(AddToCartDocument);
const EditCartItemDocumentString = print(EditCartItemDocument);
const RemoveFromCartDocumentString = print(RemoveFromCartDocument);
const GetCartDocumentString = print(GetCartDocument);
const GetCategoriesDocumentString = print(GetCategoriesDocument);
const GetGategoryDocumentString = print(GetGategoryDocument);
const GetMenusDocumentString = print(GetMenusDocument);
const GetProductDocumentString = print(GetProductDocument);
const GetProductsDocumentString = print(GetProductsDocument);
const GetProductsByCategoryDocumentString = print(GetProductsByCategoryDocument);
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    addToCart(variables: AddToCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: AddToCartMutation; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<AddToCartMutation>(AddToCartDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addToCart', 'mutation');
    },
    editCartItem(variables: EditCartItemMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: EditCartItemMutation; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<EditCartItemMutation>(EditCartItemDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'editCartItem', 'mutation');
    },
    removeFromCart(variables: RemoveFromCartMutationVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: RemoveFromCartMutation; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<RemoveFromCartMutation>(RemoveFromCartDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'removeFromCart', 'mutation');
    },
    getCart(variables?: GetCartQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetCartQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetCartQuery>(GetCartDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCart', 'query');
    },
    getCategories(variables?: GetCategoriesQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetCategoriesQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetCategoriesQuery>(GetCategoriesDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getCategories', 'query');
    },
    getGategory(variables: GetGategoryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetGategoryQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetGategoryQuery>(GetGategoryDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getGategory', 'query');
    },
    getMenus(variables?: GetMenusQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetMenusQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetMenusQuery>(GetMenusDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getMenus', 'query');
    },
    getProduct(variables: GetProductQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetProductQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetProductQuery>(GetProductDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProduct', 'query');
    },
    getProducts(variables?: GetProductsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetProductsQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetProductsQuery>(GetProductsDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProducts', 'query');
    },
    getProductsByCategory(variables?: GetProductsByCategoryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders): Promise<{ data: GetProductsByCategoryQuery; extensions?: any; headers: Dom.Headers; status: number; }> {
        return withWrapper((wrappedRequestHeaders) => client.rawRequest<GetProductsByCategoryQuery>(GetProductsByCategoryDocumentString, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getProductsByCategory', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;