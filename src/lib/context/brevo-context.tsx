// frontend/src/lib/context/brevo-context.tsx
"use client"

import { createContext, useContext, useEffect, ReactNode } from "react"

declare global {
  interface Window {
    Brevo: any[]
    sib: {
      equeue: any[]
      client_key: string
      email_id?: string
    }
    sendinblue: {
      track: (...args: any[]) => void
      identify: (...args: any[]) => void
      trackLink: (...args: any[]) => void
      page: (...args: any[]) => void
    }
  }
}

interface BrevoContextType {
  identify: (email: string, attributes?: Record<string, any>) => void
  track: (eventName: string, properties?: Record<string, any>, eventData?: Record<string, any>) => void
  trackCartUpdated: (cartId: string, items: CartItem[], total: number, email?: string) => void
  trackOrderCompleted: (orderId: string, items: CartItem[], total: number, email: string) => void
  trackProductViewed: (product: ProductData, email?: string) => void
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  url?: string
  image?: string
}

interface ProductData {
  id: string
  name: string
  price: number
  url: string
  image?: string
  categories?: string[]
  tags?: string[]
}

const BrevoContext = createContext<BrevoContextType | null>(null)

export function BrevoProvider({ 
  children,
  clientKey 
}: { 
  children: ReactNode
  clientKey: string 
}) {
  useEffect(() => {
    if (!clientKey || typeof window === "undefined") return
    
    // Initialize Brevo tracker
    window.sib = {
      equeue: [],
      client_key: clientKey,
    }
    
    window.sendinblue = {} as any
    
    const methods = ["track", "identify", "trackLink", "page"]
    for (const method of methods) {
      ;(window.sendinblue as any)[method] = function(...args: any[]) {
        const sib = window.sib as any
        if (sib[method]) {
          sib[method](...args)
        } else {
          const t: Record<string, any> = {}
          t[method] = args
          sib.equeue.push(t)
        }
      }
    }
    
    // Load tracker script
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.id = "sendinblue-js"
    script.async = true
    script.src = `https://sibautomation.com/sa.js?key=${clientKey}`
    
    const firstScript = document.getElementsByTagName("script")[0]
    firstScript?.parentNode?.insertBefore(script, firstScript)
    
    // Track initial page view
    window.sendinblue.page()
  }, [clientKey])

  const identify = (email: string, attributes?: Record<string, any>) => {
    if (typeof window === "undefined" || !window.sendinblue) return
    window.sendinblue.identify(email, attributes)
  }

  const track = (
    eventName: string, 
    properties?: Record<string, any>, 
    eventData?: Record<string, any>
  ) => {
    if (typeof window === "undefined" || !window.sendinblue) return
    window.sendinblue.track(eventName, properties, eventData)
  }

  const trackCartUpdated = (
    cartId: string, 
    items: CartItem[], 
    total: number,
    email?: string
  ) => {
    const properties = email ? { email } : {}
    const eventData = {
      id: `cart:${cartId}`,
      data: {
        total,
        currency: "USD",
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          url: item.url || "",
          image: item.image || "",
        })),
      },
    }
    track("cart_updated", properties, eventData)
  }

  const trackOrderCompleted = (
    orderId: string,
    items: CartItem[],
    total: number,
    email: string
  ) => {
    const properties = { email }
    const eventData = {
      id: `order:${orderId}`,
      data: {
        total,
        currency: "USD",
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          url: item.url || "",
          image: item.image || "",
        })),
      },
    }
    track("order_completed", properties, eventData)
  }

  const trackProductViewed = (product: ProductData, email?: string) => {
    const properties = email ? { email } : {}
    const eventData = {
      id: `product:${product.id}`,
      data: {
        name: product.name,
        price: product.price,
        url: product.url,
        image: product.image || "",
        categories: product.categories || [],
        tags: product.tags || [],
      },
    }
    track("product_viewed", properties, eventData)
  }

  return (
    <BrevoContext.Provider value={{
      identify,
      track,
      trackCartUpdated,
      trackOrderCompleted,
      trackProductViewed,
    }}>
      {children}
    </BrevoContext.Provider>
  )
}

export function useBrevo() {
  const context = useContext(BrevoContext)
  if (!context) {
    throw new Error("useBrevo must be used within a BrevoProvider")
  }
  return context
}