// src/modules/common/components/button/index.tsx
"use client"
import { clx } from "@medusajs/ui"
import React, { forwardRef, ButtonHTMLAttributes } from "react"

export type ButtonVariant = "primary" | "secondary" | "danger" | "transparent"
export type ButtonSize = "mini" | "small" | "base" | "large" | "xlarge"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "base",
      isLoading = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clx(
          "btn",
          `btn-${variant}`,
          `btn-${size}`,
          isLoading && "btn-loading",
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="btn-spinner">
            <svg
              className="animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        <span className={clx(isLoading && "opacity-0")}>{children}</span>
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
export default Button
