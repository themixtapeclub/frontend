// app/search/layout.tsx - Updated with consistent icons

import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import Submenu from 'components/layout/header/submenu';
import { sorting } from 'lib/shared/constants/global';
import type { ReactNode } from 'react';

function FooterSkeleton() {
  return (
    <div className="py-8">
      <div className="h-32 w-full"></div>
    </div>
  );
}

interface SearchLayoutProps {
  children: ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  const visibleSortOptions = sorting.filter(
    (item) => item.slug !== null && item.slug !== 'latest-desc'
  );

  return (
    <>
      <div className="container-fluid m-0 p-0">
        <Submenu />

        <div className="sortby row m-0 p-0" id="sort-options-container">
          <div className="d-flex justify-content-center align-items-center format m-0 my-1 p-0 px-4">
            <ul className="d-sm-flex justify-content-center submenu mono fs-6 m-0 flex-wrap p-0">
              <li
                className="menu-item small type-filter-item text-nowrap"
                style={{ display: 'none' }}
              >
                <button
                  className="type-filter mx-1 border-0 bg-transparent px-2"
                  data-type="all"
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  All
                </button>
              </li>

              <li
                className="menu-item small type-filter-products text-nowrap"
                style={{ display: 'none' }}
              >
                <button
                  className="type-filter mx-1 border-0 bg-transparent px-2"
                  data-type="products"
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  Products
                </button>
              </li>

              {visibleSortOptions.map((item) => {
                // Price with icons
                if (item.slug === 'price-asc') {
                  return (
                    <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                      <button
                        className="sort-option d-flex align-items-center mx-1 border-0 bg-transparent px-2"
                        data-sort={item.slug}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        Price{' '}
                        <ChevronUpIcon className="ms-1" style={{ width: '12px', height: '12px' }} />
                      </button>
                    </li>
                  );
                }

                if (item.slug === 'price-desc') {
                  return (
                    <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                      <button
                        className="sort-option d-flex align-items-center mx-1 border-0 bg-transparent px-2"
                        data-sort={item.slug}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        Price{' '}
                        <ChevronDownIcon
                          className="ms-1"
                          style={{ width: '12px', height: '12px' }}
                        />
                      </button>
                    </li>
                  );
                }

                // Title with icons
                if (item.slug === 'title-asc') {
                  return (
                    <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                      <button
                        className="sort-option d-flex align-items-center mx-1 border-0 bg-transparent px-2"
                        data-sort={item.slug}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        Title{' '}
                        <ChevronUpIcon className="ms-1" style={{ width: '12px', height: '12px' }} />
                      </button>
                    </li>
                  );
                }

                if (item.slug === 'title-desc') {
                  return (
                    <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                      <button
                        className="sort-option d-flex align-items-center mx-1 border-0 bg-transparent px-2"
                        data-sort={item.slug}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        Title{' '}
                        <ChevronDownIcon
                          className="ms-1"
                          style={{ width: '12px', height: '12px' }}
                        />
                      </button>
                    </li>
                  );
                }

                // Artist with icons
                if (item.slug === 'artist-asc') {
                  return (
                    <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                      <button
                        className="sort-option d-flex align-items-center mx-1 border-0 bg-transparent px-2"
                        data-sort={item.slug}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        Artist{' '}
                        <ChevronUpIcon className="ms-1" style={{ width: '12px', height: '12px' }} />
                      </button>
                    </li>
                  );
                }

                if (item.slug === 'artist-desc') {
                  return (
                    <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                      <button
                        className="sort-option d-flex align-items-center mx-1 border-0 bg-transparent px-2"
                        data-sort={item.slug}
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        Artist{' '}
                        <ChevronDownIcon
                          className="ms-1"
                          style={{ width: '12px', height: '12px' }}
                        />
                      </button>
                    </li>
                  );
                }

                // Default fallback
                return (
                  <li key={item.slug} className="menu-item small sort-option-item text-nowrap">
                    <button
                      className="sort-option mx-1 border-0 bg-transparent px-2"
                      data-sort={item.slug}
                      style={{
                        cursor: 'pointer',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      {item.title}
                    </button>
                  </li>
                );
              })}

              <li
                className="menu-item small type-filter-mixtapes text-nowrap"
                style={{ display: 'none' }}
              >
                <button
                  className="type-filter mx-1 border-0 bg-transparent px-2"
                  data-type="mixtapes"
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  Mixtapes
                </button>
              </li>

              <li className="menu-item small text-nowrap">
                <span
                  className="results-count mx-1 px-2"
                  style={{
                    color: '#666',
                    cursor: 'default'
                  }}
                  id="search-results-count"
                ></span>
              </li>
            </ul>
          </div>
        </div>

        {children}
      </div>
    </>
  );
}
