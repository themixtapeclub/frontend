// frontend/src/modules/account/components/account-auth-check.tsx

"use client"

import { useEffect, useRef } from "react"

interface Props {
  hasCustomer: boolean
}

export default function AccountAuthCheck({ hasCustomer }: Props) {
  const hasReloaded = useRef(false)

  useEffect(() => {
    if (hasCustomer) return
    if (hasReloaded.current) return
    
    const alreadyReloaded = sessionStorage.getItem('account-auth-reloaded')
    if (alreadyReloaded) {
      sessionStorage.removeItem('account-auth-reloaded')
      return
    }

    fetch('/api/customer')
      .then(res => res.json())
      .then(data => {
        if (data.customer) {
          hasReloaded.current = true
          sessionStorage.setItem('account-auth-reloaded', 'true')
          window.location.reload()
        }
      })
      .catch(() => {})
  }, [hasCustomer])

  return null
}