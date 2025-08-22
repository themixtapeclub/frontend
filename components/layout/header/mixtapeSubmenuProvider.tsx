// components/layout/header/mixtapeSubmenuProvider.tsx - Server-side mixtape submenu provider
import MixtapeSubmenu from './mixtapeSubmenu';

interface MixtapeSubmenuProviderProps {
  className?: string;
}

export default async function MixtapeSubmenuProvider({ className }: MixtapeSubmenuProviderProps) {
  // Since we're using hardcoded data, no server-side fetching needed
  // This component exists for consistency with the archive submenu pattern
  return <MixtapeSubmenu className={className} />;
}

// Alternative: Static version (same as above since we're using hardcoded data)
export function StaticMixtapeSubmenu({ className }: MixtapeSubmenuProviderProps) {
  return <MixtapeSubmenu className={className} />;
}
