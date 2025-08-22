// components/layout/header/index.tsx

import Cart from 'components/cart';
import OpenCart from 'components/cart/open-cart';
import { Suspense } from 'react';
import ActiveCart from './active-cart';
import HeaderHeightCalculator from './header-height-calculator';
import MainMenuComponent from './main-menu';
import MainMenuProvider from './main-menu-provider';
import MainMenu from './menu';
import NowPlaying from './now-playing';
import Search from './search';
import SearchProvider from './search-provider';
import StickyLogotype from './sticky-logotype';
import Tools from './tools';

export default function Header() {
  const cartComponent = (
    <ActiveCart>
      <Suspense fallback={<OpenCart />}>
        <Cart />
      </Suspense>
    </ActiveCart>
  );

  return (
    <MainMenuProvider>
      <SearchProvider>
        <HeaderHeightCalculator />
        <header className="sticky-top">
          <nav className="container-fluid position-relative z-3 m-0 px-3 py-2">
            <div className="row align-items-center">
              <StickyLogotype siteName="The Mixtape Club" />
              <MainMenu />
              <NowPlaying />
              <Search />
              <Tools cartComponent={cartComponent} />
            </div>
          </nav>
        </header>
        <MainMenuComponent />
      </SearchProvider>
    </MainMenuProvider>
  );
}

export { default as Monogram } from './monogram';
