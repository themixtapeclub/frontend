// components/ArchivePagination.tsx - Reusable pagination component
import Link from 'next/link';

// Generate pagination array with ellipsis
export function generatePaginationArray(currentPage: number, totalPages: number, maxVisible = 5) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  if (currentPage > halfVisible + 1) {
    pages.push(1);
    if (currentPage > halfVisible + 2) {
      pages.push('...');
    }
  }

  // Show pages around current page
  const start = Math.max(1, currentPage - halfVisible);
  const end = Math.min(totalPages, currentPage + halfVisible);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Always show last page
  if (currentPage < totalPages - halfVisible) {
    if (currentPage < totalPages - halfVisible - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
}

interface ArchivePaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g., '/shop/artist/artist-name'
}

export function ArchivePagination({ currentPage, totalPages, basePath }: ArchivePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = generatePaginationArray(currentPage, totalPages);

  return (
    <nav aria-label="Archive pagination" className="mt-5">
      <ul className="pagination justify-content-center">
        {/* Previous button */}
        {currentPage > 1 && (
          <li className="page-item">
            <Link className="page-link" href={`${basePath}?page=${currentPage - 1}`}>
              Previous
            </Link>
          </li>
        )}

        {/* Page numbers */}
        {pages.map((page, index) => (
          <li
            key={index}
            className={`page-item ${page === currentPage ? 'active' : ''} ${
              page === '...' ? 'disabled' : ''
            }`}
          >
            {page === '...' ? (
              <span className="page-link">...</span>
            ) : (
              <Link className="page-link" href={`${basePath}?page=${page}`}>
                {page}
              </Link>
            )}
          </li>
        ))}

        {/* Next button */}
        {currentPage < totalPages && (
          <li className="page-item">
            <Link className="page-link" href={`${basePath}?page=${currentPage + 1}`}>
              Next
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
