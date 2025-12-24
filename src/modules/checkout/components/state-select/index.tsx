// src/modules/checkout/components/state-select/index.tsx
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"
import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"

const US_STATES = [
  { value: "al", label: "Alabama" },
  { value: "ak", label: "Alaska" },
  { value: "az", label: "Arizona" },
  { value: "ar", label: "Arkansas" },
  { value: "ca", label: "California" },
  { value: "co", label: "Colorado" },
  { value: "ct", label: "Connecticut" },
  { value: "de", label: "Delaware" },
  { value: "fl", label: "Florida" },
  { value: "ga", label: "Georgia" },
  { value: "hi", label: "Hawaii" },
  { value: "id", label: "Idaho" },
  { value: "il", label: "Illinois" },
  { value: "in", label: "Indiana" },
  { value: "ia", label: "Iowa" },
  { value: "ks", label: "Kansas" },
  { value: "ky", label: "Kentucky" },
  { value: "la", label: "Louisiana" },
  { value: "me", label: "Maine" },
  { value: "md", label: "Maryland" },
  { value: "ma", label: "Massachusetts" },
  { value: "mi", label: "Michigan" },
  { value: "mn", label: "Minnesota" },
  { value: "ms", label: "Mississippi" },
  { value: "mo", label: "Missouri" },
  { value: "mt", label: "Montana" },
  { value: "ne", label: "Nebraska" },
  { value: "nv", label: "Nevada" },
  { value: "nh", label: "New Hampshire" },
  { value: "nj", label: "New Jersey" },
  { value: "nm", label: "New Mexico" },
  { value: "ny", label: "New York" },
  { value: "nc", label: "North Carolina" },
  { value: "nd", label: "North Dakota" },
  { value: "oh", label: "Ohio" },
  { value: "ok", label: "Oklahoma" },
  { value: "or", label: "Oregon" },
  { value: "pa", label: "Pennsylvania" },
  { value: "ri", label: "Rhode Island" },
  { value: "sc", label: "South Carolina" },
  { value: "sd", label: "South Dakota" },
  { value: "tn", label: "Tennessee" },
  { value: "tx", label: "Texas" },
  { value: "ut", label: "Utah" },
  { value: "vt", label: "Vermont" },
  { value: "va", label: "Virginia" },
  { value: "wa", label: "Washington" },
  { value: "wv", label: "West Virginia" },
  { value: "wi", label: "Wisconsin" },
  { value: "wy", label: "Wyoming" },
  { value: "dc", label: "District of Columbia" },
]

type StateSelectProps = Omit<NativeSelectProps, 'defaultValue'> & {
  countryCode?: string
  value?: string
}

const StateSelect = forwardRef<HTMLSelectElement, StateSelectProps>(
  ({ placeholder = "State / Province", countryCode, value, ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    const stateOptions = useMemo(() => {
      if (countryCode?.toLowerCase() === "us") {
        return US_STATES
      }
      return []
    }, [countryCode])

    const normalizedValue = useMemo(() => {
      if (!value) return ""
      const lower = value.toLowerCase()
      const byCode = stateOptions.find(s => s.value === lower)
      if (byCode) return byCode.value
      const byLabel = stateOptions.find(s => s.label.toLowerCase() === lower)
      if (byLabel) return byLabel.value
      const withoutPrefix = lower.replace(/^us-/, "")
      const byPrefixedCode = stateOptions.find(s => s.value === withoutPrefix)
      if (byPrefixedCode) return byPrefixedCode.value
      return ""
    }, [value, stateOptions])

    if (stateOptions.length === 0) {
      return null
    }

    return (
      <NativeSelect
        ref={innerRef}
        placeholder={placeholder}
        value={normalizedValue}
        {...props}
      >
        {stateOptions.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    )
  }
)

StateSelect.displayName = "StateSelect"

export default StateSelect