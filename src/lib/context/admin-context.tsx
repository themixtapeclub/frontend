// src/lib/context/admin-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

type LoginResult = { success: boolean; error?: string }

type AdminContextType = {
  isAdmin: boolean
  isLoading: boolean
  login: (password: string, code: string) => Promise<LoginResult>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children, initialIsAdmin = false }: { children: ReactNode; initialIsAdmin?: boolean }) {
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin)
  const [isLoading, setIsLoading] = useState(!initialIsAdmin)

  useEffect(() => {
    if (!initialIsAdmin) {
      fetch("/api/admin")
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .finally(() => setIsLoading(false))
    }
  }, [initialIsAdmin])

  const login = useCallback(async (password: string, code: string): Promise<LoginResult> => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, code }),
    })
    
    const data = await res.json()
    
    if (res.ok) {
      setIsAdmin(true)
      return { success: true }
    }
    
    return { success: false, error: data.error }
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/admin", { method: "DELETE" })
    setIsAdmin(false)
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider")
  }
  return context
}