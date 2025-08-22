// components/layout/header/submenuProvider.tsx

import { getSubmenuConfiguration } from 'lib/queries/sanity/layout/submenu';
import Submenu from './submenu';

interface SubmenuProviderProps {
  className?: string;
}

export default async function SubmenuProvider({ className }: SubmenuProviderProps) {
  let submenuConfig = undefined;
  try {
    submenuConfig = await getSubmenuConfiguration();
  } catch (error) {}

  return <Submenu initialConfig={submenuConfig} className={className} />;
}

export function StaticSubmenu({ className }: SubmenuProviderProps) {
  return <Submenu className={className} />;
}
