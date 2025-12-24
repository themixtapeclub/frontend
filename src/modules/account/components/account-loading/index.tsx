// frontend/src/modules/account/components/account-loading/index.tsx
import Spinner from "@modules/common/icons/spinner"

export default function AccountLoading() {
  return (
    <div className="flex items-center justify-center py-12 border-t border-black">
      <Spinner />
    </div>
  )
}
