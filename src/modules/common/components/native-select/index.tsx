// src/modules/common/components/native-select/index.tsx
import { ChevronUpDown } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

export type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & SelectHTMLAttributes<HTMLSelectElement>

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    { placeholder = "Select...", defaultValue, value, className, children, ...props },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    const currentValue = value !== undefined ? value : defaultValue

    useEffect(() => {
      if (currentValue === "" || currentValue === undefined) {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [currentValue])

    return (
      <div className="h-11">
        <div
          onFocus={() => innerRef.current?.focus()}
          onBlur={() => innerRef.current?.blur()}
          className={clx(
            "relative flex items-center h-full text-base-regular bg-transparent",
            className,
            {
              "text-ui-fg-muted": isPlaceholder,
            }
          )}
        >
          <select
            ref={innerRef}
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            {...props}
            className="appearance-none flex-1 h-full bg-transparent border-none px-4 transition-colors duration-150 outline-none"
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </select>
          <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
            <ChevronUpDown />
          </span>
        </div>
      </div>
    )
  }
)

NativeSelect.displayName = "NativeSelect"

export default NativeSelect