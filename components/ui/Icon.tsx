// components/ui/Icon.tsx

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BackwardIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  ForwardIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  PauseIcon,
  PlayIcon,
  ShareIcon,
  ShoppingCartIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import {
  BackwardIcon as BackwardSolid,
  ForwardIcon as ForwardSolid,
  HeartIcon as HeartSolid,
  MusicalNoteIcon as MusicalNoteSolid,
  PauseIcon as PauseSolid,
  PlayIcon as PlaySolid,
  ShoppingCartIcon as ShoppingCartSolid,
  SpeakerWaveIcon as SpeakerWaveSolid,
  UserCircleIcon as UserCircleSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid';

// Icon mapping for easy replacement
export const iconMap = {
  // Media controls (use solid for prominence)
  play: PlaySolid,
  pause: PauseSolid,
  forward: ForwardSolid,
  backward: BackwardSolid,
  'step-forward': ForwardSolid,
  'step-backward': BackwardSolid,

  // UI elements (use outline for subtlety)
  search: MagnifyingGlassIcon,
  menu: Bars3Icon,
  bars: Bars3Icon,
  close: XMarkIcon,
  x: XMarkIcon,
  times: XMarkIcon,
  user: UserIcon,
  'user-circle': UserCircleIcon,
  account: UserIcon,

  // Navigation
  home: HomeIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,

  // E-commerce
  cart: ShoppingCartIcon,
  'shopping-cart': ShoppingCartIcon,
  heart: HeartIcon,
  share: ShareIcon,

  // Audio/Music
  music: MusicalNoteIcon,
  'musical-note': MusicalNoteIcon,
  speaker: SpeakerWaveIcon,
  volume: SpeakerWaveIcon,
  mute: SpeakerXMarkIcon,

  // Other
  more: EllipsisHorizontalIcon,
  ellipsis: EllipsisHorizontalIcon,

  // Solid versions when needed
  'play-solid': PlaySolid,
  'pause-solid': PauseSolid,
  'user-solid': UserSolid,
  'heart-solid': HeartSolid,
  'cart-solid': ShoppingCartSolid,
  'music-solid': MusicalNoteSolid,
  'speaker-solid': SpeakerWaveSolid
};

// Size mapping (converts FA text sizes to Tailwind)
export const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
  '2xl': 'w-8 h-8'
};

// Icon component for easy use
interface IconProps {
  name: keyof typeof iconMap;
  size?: keyof typeof iconSizes;
  className?: string;
}

export function Icon({ name, size = 'md', className = '' }: IconProps) {
  const IconComponent = iconMap[name];
  const sizeClass = iconSizes[size];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap. Available icons:`, Object.keys(iconMap));
    return null;
  }

  return <IconComponent className={`${sizeClass} ${className}`} />;
}

// Export individual icons for direct use if needed
export {
  BackwardIcon,
  BackwardSolid,
  Bars3Icon,
  ForwardIcon,
  ForwardSolid,
  MagnifyingGlassIcon,
  PauseIcon,
  PauseSolid,
  PlayIcon,
  PlaySolid,
  UserCircleIcon,
  UserCircleSolid,
  UserIcon,
  UserSolid,
  XMarkIcon
};

// Default export
export default Icon;
