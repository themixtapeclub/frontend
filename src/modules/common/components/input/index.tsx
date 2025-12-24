// src/modules/common/components/input/index.tsx
import { Label } from "@medusajs/ui"
import React, { useEffect, useImperativeHandle, useState } from "react"
import Eye from "@modules/common/icons/eye"
import EyeOff from "@modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, touched, required, topLabel, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }
      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <Label className="mb-2 txt-compact-medium-plus">{topLabel}</Label>
        )}
        <div className="floating-input relative z-0 w-full h-11">
          <input
            type={inputType}
            name={name}
            id={name}
            placeholder=" "
            required={required}
            className="peer block w-full h-full px-4 pt-3 pb-1 bg-transparent border-0 appearance-none focus:outline-none focus:ring-0"
            {...props}
            ref={inputRef}
          />
          <label
            htmlFor={name}
            className="floating-label absolute left-4 top-1/2 -translate-y-1/2 text-ui-fg-subtle pointer-events-none transition-all duration-200 origin-left peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-75"
          >
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-ui-fg-subtle px-4 focus:outline-none transition-all duration-150 outline-none focus:text-ui-fg-base absolute right-0 top-3"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input