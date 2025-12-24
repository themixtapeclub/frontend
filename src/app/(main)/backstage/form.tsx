// src/app/(main)/backstage/form.tsx
"use client"

import { useState } from "react"
import { useAdmin } from "@lib/context/admin-context"
import { useRouter } from "next/navigation"

export function BackstageForm({ initialIsAdmin }: { initialIsAdmin: boolean }) {
  const { isAdmin, login, logout } = useAdmin()
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const authenticated = isAdmin || initialIsAdmin

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    const result = await login(password, code)
    setLoading(false)
    
    if (result.success) {
      setPassword("")
      setCode("")
      router.refresh()
    } else {
      setError(result.error || "Invalid credentials")
    }
  }

  async function handleLogout() {
    await logout()
    router.refresh()
  }

  if (authenticated) {
    return (
      <div className="text-center">
        <p className="mb-4 text-green-600">✓ Success</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
        autoFocus
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="Authenticator code"
        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 tracking-widest text-center"
        autoComplete="one-time-code"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password || code.length !== 6}
        className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Enter"}
      </button>
    </form>
  )
}