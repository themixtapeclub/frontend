import localFont from 'next/font/local';

export const system85Pro = localFont({
  src: [
    { path: '../../../public/fonts/System85Pro-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/System85Pro-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../../../public/fonts/System85Pro-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/System85Pro-MediumItalic.woff2', weight: '500', style: 'italic' },
    { path: '../../../public/fonts/System85Pro-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/System85Pro-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-system85-pro',
  display: 'swap',
});

export const system85MonoPro = localFont({
  src: [
    { path: '../../../public/fonts/System85MonoPro-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/System85MonoPro-Italic.woff2', weight: '400', style: 'italic' },
    { path: '../../../public/fonts/System85MonoPro-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/System85MonoPro-MediumItalic.woff2', weight: '500', style: 'italic' },
    { path: '../../../public/fonts/System85MonoPro-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/System85MonoPro-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-system85-mono-pro',
  display: 'swap',
});
