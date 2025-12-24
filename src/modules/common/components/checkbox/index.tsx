// src/modules/common/components/checkbox/index.tsx
import { Checkbox } from "@medusajs/ui"
import React from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  'data-testid': dataTestId
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        className="text-base-regular flex items-center gap-x-2"
        id={name || "checkbox"}
        role="checkbox"
        type="button"
        checked={checked}
        aria-checked={checked}
        onClick={onChange}
        name={name}
        data-testid={dataTestId}
      />
      <label
        htmlFor={name || "checkbox"}
        className="cursor-pointer select-none"
        style={{ fontFamily: 'var(--font-system85-pro), system-ui, sans-serif' }}
      >
        {label}
      </label>
    </div>
  )
}

export default CheckboxWithLabel
