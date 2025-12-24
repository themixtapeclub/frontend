// src/modules/layout/components/newsletter-form/index.tsx
"use client"

import { useState, useEffect, useRef } from "react"

const LISTS = [
  { id: "vinyl", label: "Vinyl" },
  { id: "mixes", label: "Mixes" },
  { id: "events", label: "Events" },
]

const SUBSCRIBED_KEY = "newsletter_subscribed"
const MIN_SUBMIT_TIME = 2000

function getLocalSubscribed(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(SUBSCRIBED_KEY) || "[]")
  } catch {
    return []
  }
}

function setLocalSubscribed(lists: string[]) {
  if (typeof window === "undefined") return
  const current = getLocalSubscribed()
  const merged = Array.from(new Set([...current, ...lists]))
  localStorage.setItem(SUBSCRIBED_KEY, JSON.stringify(merged))
}

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [selectedLists, setSelectedLists] = useState<string[]>(["vinyl", "mixes", "events"])
  const [website, setWebsite] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [subscribedLists, setSubscribedLists] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const formLoadTime = useRef<number>(Date.now())

  useEffect(() => {
    setMounted(true)
    formLoadTime.current = Date.now()
    const local = getLocalSubscribed()
    setSubscribedLists(local)
    
    const unsubscribedLists = LISTS.filter(l => !local.includes(l.id)).map(l => l.id)
    if (unsubscribedLists.length > 0) {
      setSelectedLists(unsubscribedLists)
    }
  }, [])

  const toggleList = (listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || selectedLists.length === 0) return

    const timeTaken = Date.now() - formLoadTime.current
    
    setStatus("loading")

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
            email,
            lists: selectedLists,
            website,
            _t: timeTaken,
          }),
        }
      )

      if (!response.ok) throw new Error()

      setLocalSubscribed(selectedLists)
      setSubscribedLists(prev => Array.from(new Set([...prev, ...selectedLists])))
      setStatus("success")
      setMessage("Subscribed!")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Failed to subscribe")
    }

    setTimeout(() => {
      setStatus("idle")
      setMessage("")
    }, 3000)
  }

  const availableLists = LISTS.filter(l => !subscribedLists.includes(l.id))
  const allSubscribed = mounted && availableLists.length === 0

  if (allSubscribed) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="py-12 border-b border-neutral-800 flex flex-col gap-3 w-full">
      <span className="txt-small-plus text-white">Newsletter</span>

      <div className="flex gap-2 w-full">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 border border-neutral-700 bg-transparent text-white placeholder-neutral-500 rounded focus:outline-none focus:border-white"
        />
        <button
          type="submit"
          disabled={status === "loading" || selectedLists.length === 0}
          className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </div>

      <div className="flex gap-4">
        {availableLists.map((list) => (
          <label key={list.id} className="flex items-center gap-1.5 cursor-pointer text-white txt-small">
            <input
              type="checkbox"
              checked={selectedLists.includes(list.id)}
              onChange={() => toggleList(list.id)}
              className="accent-white"
            />
            {list.label}
          </label>
        ))}
      </div>

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

      {message && (
        <span className={`txt-small ${status === "success" ? "text-green-400" : "text-red-400"}`}>
          {message}
        </span>
      )}
    </form>
  )
}