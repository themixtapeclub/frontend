// src/app/(main)/search/layout.tsx
import type { ReactNode } from "react"

interface SearchLayoutProps {
  children: ReactNode
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="container-fluid m-0 p-0">
      <div className="page-nav submenu sortby row m-0 p-0" id="sort-options-container">
        <div className="search relative">
          <div className="flex justify-center items-center m-0 my-1 p-0 px-4">
            <ul className="flex flex-wrap justify-content-center items-center list-none mono text-sm m-0 p-0">
              <li
                className="menu-item whitespace-nowrap"
                id="search-loading-indicator"
                style={{ display: "none" }}
              >
                <span className="mx-1 px-2" style={{ color: "#666" }}>
                  Loading...
                </span>
              </li>

              <li
                className="menu-item type-filter-item whitespace-nowrap"
                style={{ display: "none" }}
              >
                <button
                  className="type-filter mx-1 border-0 bg-transparent px-2"
                  data-type="all"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  All
                </button>
              </li>

              <li
                className="menu-item type-filter-item type-filter-products whitespace-nowrap"
                style={{ display: "none" }}
              >
                <button
                  className="type-filter mx-1 border-0 bg-transparent px-2"
                  data-type="products"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Products
                </button>
              </li>

              <li className="menu-item sort-option-item whitespace-nowrap" style={{ display: "none" }}>
                <button
                  className="sort-option flex items-center mx-1 border-0 bg-transparent px-2"
                  data-sort="price-asc"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Price
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 w-3 h-3">
                    <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>

              <li className="menu-item sort-option-item whitespace-nowrap" style={{ display: "none" }}>
                <button
                  className="sort-option flex items-center mx-1 border-0 bg-transparent px-2"
                  data-sort="price-desc"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Price
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 w-3 h-3">
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>

              <li className="menu-item sort-option-item whitespace-nowrap" style={{ display: "none" }}>
                <button
                  className="sort-option flex items-center mx-1 border-0 bg-transparent px-2"
                  data-sort="title-asc"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Title
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 w-3 h-3">
                    <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>

              <li className="menu-item sort-option-item whitespace-nowrap" style={{ display: "none" }}>
                <button
                  className="sort-option flex items-center mx-1 border-0 bg-transparent px-2"
                  data-sort="title-desc"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Title
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 w-3 h-3">
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>

              <li className="menu-item sort-option-item whitespace-nowrap" style={{ display: "none" }}>
                <button
                  className="sort-option flex items-center mx-1 border-0 bg-transparent px-2"
                  data-sort="artist-asc"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Artist
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 w-3 h-3">
                    <path fillRule="evenodd" d="M11.47 7.72a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>

              <li className="menu-item sort-option-item whitespace-nowrap" style={{ display: "none" }}>
                <button
                  className="sort-option flex items-center mx-1 border-0 bg-transparent px-2"
                  data-sort="artist-desc"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Artist
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 w-3 h-3">
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>

              <li
                className="menu-item type-filter-item type-filter-mixtapes whitespace-nowrap"
                style={{ display: "none" }}
              >
                <button
                  className="type-filter mx-1 border-0 bg-transparent px-2"
                  data-type="mixtapes"
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit"
                  }}
                >
                  Mixes
                </button>
              </li>

              <li className="menu-item whitespace-nowrap" style={{ display: "none" }}>
                <span
                  className="results-count mx-1 px-2"
                  id="search-results-count"
                  style={{
                    color: "#666",
                    cursor: "default"
                  }}
                ></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {children}
    </div>
  )
}
