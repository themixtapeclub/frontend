// src/modules/products/components/notify-me-form/index.tsx
"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import { addToWantlist, getWantlist } from "@lib/data/wantlist"

interface NotifyMeFormProps {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}

const WANTLIST_KEY = "wantlist"

function getLocalWantlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(WANTLIST_KEY) || "[]")
  } catch {
    return []
  }
}

function addToLocalWantlist(productId: string, variantId?: string) {
  const key = variantId ? `${productId}:${variantId}` : productId
  const list = getLocalWantlist()
  if (!list.includes(key)) {
    list.push(key)
    localStorage.setItem(WANTLIST_KEY, JSON.stringify(list))
  }
}

export default function NotifyMeForm({ product, variant }: NotifyMeFormProps) {
  const [email, setEmail] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [website, setWebsite] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "subscribePrompt" | "subscribing" | "success" | "successSubscribed" | "alreadyOnList" | "error">("idle")
  const [message, setMessage] = useState("")
  const [alreadyOnList, setAlreadyOnList] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formLoadTime = useRef<number>(Date.now())

  useEffect(() => {
    formLoadTime.current = Date.now()
    const key = variant?.id ? `${product.id}:${variant.id}` : product.id
    
    startTransition(async () => {
      try {
        const wantlist = await getWantlist()
        if (wantlist.length > 0 || document.cookie.includes("_medusa_jwt")) {
          setIsLoggedIn(true)
          const found = wantlist.some((item) => {
            const itemKey = item.variant_id
              ? `${item.product_id}:${item.variant_id}`
              : item.product_id
            return itemKey === key
          })
          setAlreadyOnList(found)
        } else {
          setAlreadyOnList(getLocalWantlist().includes(key))
        }
      } catch {
        setAlreadyOnList(getLocalWantlist().includes(key))
      }
      setChecking(false)
    })
  }, [product.id, variant?.id])

  const checkVinylSubscription = async (emailToCheck: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/subscribe/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          body: JSON.stringify({
            email: emailToCheck,
            list: "vinyl",
          }),
        }
      )
      if (!response.ok) return false
      const data = await response.json()
      return data.subscribed === true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (alreadyOnList) {
      setStatus("alreadyOnList")
      return
    }

    if (!isLoggedIn && !email) return
    
    const timeTaken = Date.now() - formLoadTime.current
    
    setStatus("loading")
    setSubmittedEmail(email)

    startTransition(async () => {
      try {
        if (isLoggedIn) {
          const productArtist = (product as any).artist
          const artistString = Array.isArray(productArtist) 
            ? productArtist.join(", ") 
            : productArtist || undefined

          const result = await addToWantlist({
            product_id: product.id,
            variant_id: variant?.id,
            product_title: product.title || "",
            variant_title: variant?.title || undefined,
            product_handle: product.handle || "",
            product_image: product.thumbnail || product.images?.[0]?.url,
            artist: artistString,
          })

          if (!result.success) {
            throw new Error(result.error)
          }
          
          setAlreadyOnList(true)
          setStatus("success")
        } else {
          const productArtist = (product as any).artist
          const artistString = Array.isArray(productArtist) 
            ? productArtist.join(", ") 
            : productArtist || undefined

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/wantlist`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
              },
              body: JSON.stringify({
                email,
                product_id: product.id,
                variant_id: variant?.id,
                product_title: product.title || "",
                variant_title: variant?.title || undefined,
                product_handle: product.handle || "",
                product_image: product.thumbnail || product.images?.[0]?.url,
                artist: artistString,
                website,
                _t: timeTaken,
              }),
            }
          )

          if (!response.ok) throw new Error()
          
          addToLocalWantlist(product.id, variant?.id)

          const isSubscribedToVinyl = await checkVinylSubscription(email)
          if (isSubscribedToVinyl) {
            setAlreadyOnList(true)
            setStatus("success")
          } else {
            setStatus("subscribePrompt")
          }
        }
      } catch {
        setStatus("error")
        setMessage("Something went wrong")
        setTimeout(() => {
          setStatus("idle")
          setMessage("")
        }, 4000)
      }
    })
  }

  const handleSubscribe = async () => {
    setStatus("subscribing")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          body: JSON.stringify({
            email: submittedEmail,
            lists: ["vinyl"],
          }),
        }
      )

      if (!response.ok) throw new Error()

      setStatus("successSubscribed")
      setAlreadyOnList(true)
    } catch {
      setStatus("success")
      setAlreadyOnList(true)
    }
  }

  if (checking) {
    return null
  }

  if (status === "alreadyOnList" || alreadyOnList) {
    return (
      <div className="flex items-center justify-center p-3 bg-green-50 rounded text-sm text-green-800">
        We will email you when this is back in stock.
      </div>
    )
  }

  if (status === "successSubscribed") {
    return (
      <div className="flex items-center justify-center p-3 bg-green-50 rounded text-center text-sm text-green-800">
        You're on the list! We'll email you when it's back.
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex items-center justify-center p-3 bg-green-50 rounded text-sm text-green-800">
        We will email you when this is back in stock.
      </div>
    )
  }

  if (status === "subscribePrompt" || status === "subscribing") {
    return (
      <div className="flex flex-col gap-2 p-3 bg-green-50 rounded text-sm">
        <p className="text-green-800">
          You're on the list! Also join our mailing list for new records?
        </p>
        <button
          onClick={handleSubscribe}
          disabled={status === "subscribing"}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-[#00f0ad] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black text-sm"
        >
          {status === "subscribing" ? "..." : "Yes, subscribe"}
        </button>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <button
        onClick={() => handleSubmit()}
        disabled={status === "loading" || isPending}
        className="w-full px-4 py-2 bg-black text-white rounded hover:bg-[#00f0ad] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black text-sm"
      >
        {status === "loading" || isPending ? "..." : "Email Me"}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email me when available"
          required
          className="w-full px-3 py-2 border border-black rounded focus:outline-none focus:border-black text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading" || isPending}
          className="w-full px-4 py-2 bg-black text-white rounded hover:bg-[#00f0ad] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black text-sm"
        >
          {status === "loading" || isPending ? "..." : "Submit"}
        </button>

        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="opacity-0 absolute top-0 left-0 h-0 w-0 -z-10"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </form>

      {message && status === "error" && (
        <p className="text-red-600 text-sm">{message}</p>
      )}
    </div>
  )
}
