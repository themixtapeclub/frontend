// components/layout/header/submenu-wrapper.tsx (OPTIONAL - ADD TO FRONTEND)
import { getSubmenuConfiguration, type SubmenuConfig } from '../../../lib/queries/sanity/layout/submenu';
import Submenu from './submenu';

interface SubmenuWrapperProps {
  className?: string;
}

export default async function SubmenuWrapper({ className }: SubmenuWrapperProps) {
  let initialConfig: SubmenuConfig | undefined;

  try {
    initialConfig = await getSubmenuConfiguration();
  } catch (error) {
    console.error('Failed to fetch submenu configuration:', error);
    // Component will use fallback data
  }

  return <Submenu className={className} initialConfig={initialConfig} />;
}

// For use in pages that need the submenu data
export async function getSubmenuProps() {
  try {
    const config = await getSubmenuConfiguration();
    return {
      submenuConfig: config
    };
  } catch (error) {
    console.error('Failed to fetch submenu configuration:', error);
    return {
      submenuConfig: null
    };
  }
}
