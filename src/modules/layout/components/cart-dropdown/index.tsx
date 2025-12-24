// src/modules/layout/components/cart-dropdown/index.tsx
"use client"

import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/solid"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useProductFormats } from "@lib/hooks/use-product-formats"
import { useProductDetails, ProductDetails } from "@lib/hooks/use-product-details"

function getConditionDisplay(
  cartQuantity: number,
  details: ProductDetails | undefined
): string | null {
  if (!details) return null

  const { condition_media, condition_sleeve, inventory_quantity } = details

  if (!condition_media) return null

  const isMint = ["M", "Mint", "MINT", "m", "mint"].includes(condition_media)
  const remaining = inventory_quantity - cartQuantity

  const formatSleeve = (sleeve: string | null): string => {
    if (!sleeve) return ""
    if (sleeve === "NM" || sleeve === "Near Mint") return "NM"
    return sleeve
  }

  if (isMint) {
    if (remaining > 0) {
      return "New"
    } else {
      const sleeveDisplay = condition_sleeve ? ` / Sleeve: ${formatSleeve(condition_sleeve)}` : ""
      if (cartQuantity === 1) {
        return `Media: NM${sleeveDisplay}`
      } else {
        return `${cartQuantity - 1}× New, 1× Media: NM${sleeveDisplay} (Shop Copy)`
      }
    }
  } else {
    const sleeveDisplay = condition_sleeve ? ` / Sleeve: ${condition_sleeve}` : ""
    return `Media: ${condition_media}${sleeveDisplay}`
  }
}

const CartDropdown = ({
  cart: cartState,
  forceOpen,
  onForceOpenHandled,
  isAddingToCart,
  keepOpen,
}: {
  cart?: HttpTypes.StoreCart | null
  forceOpen?: boolean
  onForceOpenHandled?: () => void
  isAddingToCart?: boolean
  keepOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [backdropState, setBackdropState] = useState<"hidden" | "entering" | "visible" | "exiting">("hidden")
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(undefined)
  const [mounted, setMounted] = useState(false)
  const scrollPositionRef = useRef(0)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const total = cartState?.total ?? 0
  const shippingTotal = (cartState as any)?.shipping_total ?? 0
  const shippingCalculated = shippingTotal > 0

  const itemRef = useRef<number | null>(null)

  const productIds = useMemo(
    () => cartState?.items?.map(item => item.product_id).filter(Boolean) as string[] || [],
    [cartState?.items]
  )
  const formats = useProductFormats(productIds)

  const productHandles = useMemo(
    () => cartState?.items?.map(item => item.product_handle).filter(Boolean) as string[] || [],
    [cartState?.items]
  )
  const productDetails = useProductDetails(productHandles)

  const timedOpen = (disableAutoClose?: boolean) => {
    if (activeTimer) clearTimeout(activeTimer)
    openCart()
    if (!disableAutoClose && !keepOpen) {
      const timer = setTimeout(closeCart, 5000)
      setActiveTimer(timer)
    }
  }

  useEffect(() => {
    setMounted(true)
    const dialogPanel = document.querySelector('[data-testid="nav-cart-dropdown"]')
    if (!dialogPanel && document.body.classList.contains("cart-modal-open")) {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.classList.remove("cart-modal-open")
    }
    const staleBackdrop = document.querySelector('.cart-modal-backdrop')
    if (!dialogPanel && staleBackdrop) {
      staleBackdrop.remove()
    }
    return () => {
      if (activeTimer) clearTimeout(activeTimer)
    }
  }, [activeTimer])

  const pathname = usePathname()

  useEffect(() => {
    if (forceOpen && !pathname.includes("/cart") && !pathname.includes("/checkout")) {
      timedOpen(isAddingToCart || keepOpen)
      onForceOpenHandled?.()
    }
  }, [forceOpen])

  useEffect(() => {
    if (!keepOpen && isOpen && !isAddingToCart) {
      const timer = setTimeout(closeCart, 5000)
      setActiveTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [keepOpen, isAddingToCart])

  useEffect(() => {
    const handleOpenCart = () => {
      if (!pathname.includes("/cart") && !pathname.includes("/checkout")) {
        timedOpen()
      }
    }
    window.addEventListener('open-cart', handleOpenCart)
    return () => window.removeEventListener('open-cart', handleOpenCart)
  }, [pathname])

  useEffect(() => {
    if (itemRef.current !== null && itemRef.current !== totalItems && !pathname.includes("/cart") && !pathname.includes("/checkout")) {
      const isFirstLoad = itemRef.current === 0 && totalItems > 0
      if (isFirstLoad) {
        setTimeout(timedOpen, 5000)
      }
    }
    itemRef.current = totalItems
  }, [totalItems])

  useEffect(() => {
    if (isOpen) {
      setBackdropState("entering")
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBackdropState("visible")
        })
      })
    } else if (backdropState === "visible") {
      setBackdropState("exiting")
      const timer = setTimeout(() => {
        setBackdropState("hidden")
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const dialogPanel = document.querySelector('[data-testid="nav-cart-dropdown"]')
        if (!dialogPanel) {
          document.body.style.overflow = ''
          document.body.style.paddingRight = ''
          document.body.classList.remove("cart-modal-open")
          const staleBackdrop = document.querySelector('.cart-modal-backdrop')
          if (staleBackdrop) staleBackdrop.remove()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.scrollY
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.classList.add("cart-modal-open")
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.classList.remove("cart-modal-open")
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      document.body.classList.remove("cart-modal-open")
    }
  }, [isOpen])

  const showBackdrop = mounted && backdropState !== "hidden"
  const backdropClass = backdropState === "entering" || backdropState === "exiting" 
    ? `cart-modal-backdrop ${backdropState}` 
    : "cart-modal-backdrop"

  const backdrop = showBackdrop ? createPortal(
    <div className={backdropClass} aria-hidden="true" onClick={closeCart} />,
    document.body
  ) : null

  return (
    <>
      <button
        aria-label="Open cart"
        onClick={openCart}
        className="cart-button outline mono"
        data-testid="nav-cart-link"
      >
        <span>Cart</span>
        {totalItems > 0 && <span>({totalItems})</span>}
      </button>

      {backdrop}

      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-[9999]">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="cart-modal-overlay" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="cart-modal-panel" data-testid="nav-cart-dropdown">
              <div className="cart-modal-header">
                <h3 className="section-title text-base">My Cart</h3>
                <button
                  aria-label="Close cart"
                  onClick={closeCart}
                  className="outline outline-menu-button"
                >
                  <XMarkIcon className="outline-icon h-4 w-4" />
                </button>
              </div>

              {isAddingToCart ? (
                <div 
                  className="cart-modal-empty"
                  style={{
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                  }}
                >
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      border: '3px solid rgba(255,255,255,0.2)', 
                      borderTopColor: '#14b8a6', 
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} 
                  />
                  <span className="cart-modal-empty-text" style={{ color: '#fff', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Adding to cart...</span>
                </div>
              ) : !cartState || !cartState.items?.length ? (
                <div 
                  className="cart-modal-empty"
                  style={{
                    minHeight: '300px',
                  }}
                >
                  <span className="cart-modal-empty-text" style={{ color: '#fff', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Cart empty</span>
                </div>
              ) : (
                <div className="cart-modal-content">
                  <ul className="cart-modal-items">
                    {cartState.items
                      .sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
                      .map((item) => {
                        const handle = item.product_handle
                        const details = handle ? productDetails[handle] : undefined
                        const artist = details?.artist?.[0] || null
                        const conditionDisplay = getConditionDisplay(item.quantity, details)

                        return (
                          <li key={item.id} className="cart-item" data-testid="cart-item">
                            <LocalizedClientLink
                              href={`/product/${item.product_handle}`}
                              onClick={closeCart}
                              className="cart-item-link"
                            >
                              <div className="cart-item-thumbnail">
                                <Thumbnail
                                  thumbnail={item.thumbnail}
                                  images={item.variant?.product?.images}
                                  format={item.product_id ? formats[item.product_id] : null}
                                  size="square"
                                />
                              </div>
                              <div className="cart-item-details">
                                <div className="artist-title">
                                  {artist && <span className="artist">{artist}</span>}
                                  <span className="title">{item.title}</span>
                                </div>
                                {conditionDisplay && (
                                  <span className="cart-item-condition">
                                    {conditionDisplay}
                                  </span>
                                )}
                                {item.quantity > 1 && (
                                  <span
                                    className="cart-item-quantity"
                                    data-testid="cart-item-quantity"
                                    data-value={item.quantity}
                                  >
                                    Qty: {item.quantity}
                                  </span>
                                )}
                              </div>
                            </LocalizedClientLink>
                            <div className="cart-item-right">
                              <span data-testid="cart-item-price">
                                {convertToLocale({
                                  amount: (item as any).subtotal ?? item.total ?? 0,
                                  currency_code: cartState.currency_code,
                                })}
                              </span>
                              <div className="cart-item-delete">
                                <DeleteButton
                                  id={item.id}
                                  data-testid="cart-item-remove-button"
                                />
                              </div>
                            </div>
                          </li>
                        )
                      })}
                  </ul>

                  <div className="cart-modal-summary">
                    <div className="cart-summary-row">
                      <span className="cart-summary-label">
                        {shippingCalculated ? "Total" : "Subtotal"}
                      </span>
                      <span data-testid="cart-total" data-value={shippingCalculated ? total : subtotal}>
                        {convertToLocale({
                          amount: shippingCalculated ? total : subtotal,
                          currency_code: cartState.currency_code,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="cart-modal-footer">
                    <LocalizedClientLink
                      href="/checkout"
                      onClick={closeCart}
                      className="btn btn-primary btn-base w-full"
                      data-testid="checkout-button"
                    >
                      Proceed to checkout
                    </LocalizedClientLink>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}

export default CartDropdown