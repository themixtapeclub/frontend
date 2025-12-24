// frontend/src/modules/account/components/account-info/index.tsx
import { Disclosure } from "@headlessui/react"
import { Badge, Button, clx } from "@medusajs/ui"
import { useEffect } from "react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { useFormStatus } from "react-dom"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  'data-testid'?: string
}

const AccountInfo = ({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "An error occurred, please try again",
  children,
  'data-testid': dataTestid
}: AccountInfoProps) => {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()

  const handleToggle = () => {
    clearState()
    setTimeout(() => toggle(), 100)
  }

  useEffect(() => {
    if (isSuccess) {
      close()
    }
  }, [isSuccess, close])

  return (
    <div data-testid={dataTestid}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-small text-ui-fg-subtle">{label}</span>
          <div className="flex items-center flex-1 basis-0 justify-end gap-x-4">
            {typeof currentInfo === "string" ? (
              <span className="mono" data-testid="current-info">{currentInfo}</span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <div>
          <button
            className="text-small text-ui-fg-base hover:text-black"
            onClick={handleToggle}
            type={state ? "reset" : "button"}
            data-testid="edit-button"
            data-active={state}
          >
            {state ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isSuccess,
              "max-h-0 opacity-0": !isSuccess,
            }
          )}
          data-testid="success-message"
        >
          <Badge className="p-2 my-4" color="green">
            <span>{label} updated succesfully</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden",
            {
              "max-h-[1000px] opacity-100": isError,
              "max-h-0 opacity-0": !isError,
            }
          )}
          data-testid="error-message"
        >
          <Badge className="p-2 my-4" color="red">
            <span>{errorMessage}</span>
          </Badge>
        </Disclosure.Panel>
      </Disclosure>

      <Disclosure>
        <Disclosure.Panel
          static
          className={clx(
            "transition-[max-height,opacity] duration-300 ease-in-out overflow-visible",
            {
              "max-h-[1000px] opacity-100": state,
              "max-h-0 opacity-0": !state,
            }
          )}
        >
          <div className="flex flex-col gap-y-2 py-4">
            <div>{children}</div>
            <div className="flex items-center justify-end mt-2">
              <Button
                isLoading={pending}
                className="w-full small:max-w-[140px]"
                type="submit"
                data-testid="save-button"
              >
                Save changes
              </Button>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}

export default AccountInfo
