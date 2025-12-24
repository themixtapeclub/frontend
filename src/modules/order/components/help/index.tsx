// @modules/order/components/help/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="border-t border-black py-4 px-4">
      <p className="mb-4 font-sans text-neutral-500">Need Help?</p>
      <div className="flex flex-col gap-y-2">
        <LocalizedClientLink href="/info">Contact</LocalizedClientLink>
        <LocalizedClientLink href="/refunds-returns">
          Refunds & Returns
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Help