// src/modules/store/components/pagination/index.tsx
"use client"
import { clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface PaginationProps {
  page: number
  totalPages: number
  "data-testid"?: string
  onPageChange?: (page: number) => void
  showPageInfo?: boolean
  scrollToTop?: boolean
}

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
  onPageChange,
  showPageInfo = false,
  scrollToTop = false,
}: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return

    if (onPageChange) {
      onPageChange(newPage)
    } else {
      const params = new URLSearchParams(searchParams)
      params.set("page", newPage.toString())
      router.push(`${pathname}?${params.toString()}`)
    }

    if (scrollToTop) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100)
    }
  }

  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx("txt-xlarge-plus text-ui-fg-muted", {
        "text-ui-fg-base hover:text-ui-fg-subtle": isCurrent,
      })}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="txt-xlarge-plus text-ui-fg-muted items-center cursor-default"
    >
      ...
    </span>
  )

  const renderNavButton = (
    direction: "prev" | "next",
    disabled: boolean
  ) => (
    <button
      key={direction}
      className={clx("txt-xlarge-plus text-ui-fg-muted", {
        "opacity-50 cursor-not-allowed": disabled,
        "hover:text-ui-fg-subtle": !disabled,
      })}
      disabled={disabled}
      onClick={() => handlePageChange(direction === "prev" ? page - 1 : page + 1)}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  )

  const renderPageButtons = () => {
    const buttons = []

    buttons.push(renderNavButton("prev", page <= 1))

    if (totalPages <= 7) {
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      if (page <= 4) {
        buttons.push(
          ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
        )
        buttons.push(renderEllipsis("ellipsis1"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      } else if (page >= totalPages - 3) {
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis2"))
        buttons.push(
          ...arrayRange(totalPages - 4, totalPages).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
      } else {
        buttons.push(renderPageButton(1, 1, 1 === page))
        buttons.push(renderEllipsis("ellipsis3"))
        buttons.push(
          ...arrayRange(page - 1, page + 1).map((p) =>
            renderPageButton(p, p, p === page)
          )
        )
        buttons.push(renderEllipsis("ellipsis4"))
        buttons.push(
          renderPageButton(totalPages, totalPages, totalPages === page)
        )
      }
    }

    buttons.push(renderNavButton("next", page >= totalPages))

    return buttons
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center w-full my-12">
      <nav aria-label="Pagination" data-testid={dataTestid}>
        <div className="flex gap-3 items-center">
          {renderPageButtons()}
        </div>
      </nav>
      {showPageInfo && (
        <span className="ml-3 text-ui-fg-muted">
          Page {page} of {totalPages}
        </span>
      )}
    </div>
  )
}