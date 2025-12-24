// src/modules/layout/components/header/search-input.tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState } from "react"
import { useSearch } from "./search-provider"

interface SearchInputProps {
  onSubmit?: () => void
}

function SearchInputContent({ onSubmit }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isSearchVisible } = useSearch()
  const [mounted, setMounted] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const pendingInputRef = useRef("")
  const inputRef = useRef<HTMLInputElement>(null)
  const justSubmittedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (isSearchVisible) {
      pendingInputRef.current = ""
      setInputValue("")
      setShouldRender(true)
      const timer = setTimeout(() => {
        setIsVisible(true)
        setTimeout(() => {
          if (pendingInputRef.current) {
            setInputValue(pendingInputRef.current)
          }
          inputRef.current?.focus()
        }, 50)
      }, 180)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      justSubmittedRef.current = false
      return () => clearTimeout(timer)
    }
  }, [isSearchVisible, mounted])

  useEffect(() => {
    if (!isSearchVisible || !mounted) return

    function handleKeyDown(e: KeyboardEvent) {
      if (document.activeElement === inputRef.current) return
      
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        pendingInputRef.current += e.key
        setInputValue(pendingInputRef.current)
      } else if (e.key === "Backspace" && pendingInputRef.current.length > 0) {
        pendingInputRef.current = pendingInputRef.current.slice(0, -1)
        setInputValue(pendingInputRef.current)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isSearchVisible, mounted])

  useEffect(() => {
    const handleClearSearchInputs = (e: CustomEvent) => {
      if (e.detail.clearValue) {
        setInputValue("")
        pendingInputRef.current = ""
        if (inputRef.current) {
          inputRef.current.value = ""
        }
      }
    }

    document.addEventListener("clearSearchInputs", handleClearSearchInputs as EventListener)
    return () => {
      document.removeEventListener("clearSearchInputs", handleClearSearchInputs as EventListener)
    }
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const value = inputValue.trim()

    if (value) {
      justSubmittedRef.current = true
      setInputValue("")
      pendingInputRef.current = ""
      onSubmit?.()
      router.push(`/search?q=${encodeURIComponent(value)}`)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    pendingInputRef.current = e.target.value
  }

  if (!mounted || !shouldRender) {
    return null
  }

  return (
    <div
      className="header-search flex items-center w-full pl-2"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      <form onSubmit={handleSubmit} className="search w-full">
        <input
          ref={inputRef}
          type="text"
          name="search"
          placeholder="Search..."
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full bg-white menu-link search-input"
        />
      </form>
    </div>
  )
}

export default function SearchInput(props: SearchInputProps) {
  return (
    <Suspense fallback={null}>
      <SearchInputContent {...props} />
    </Suspense>
  )
}