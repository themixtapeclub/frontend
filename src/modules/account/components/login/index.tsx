// frontend/src/modules/account/components/login/index.tsx

"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setIsPending(false)
        return
      }

      console.log("Login successful, reloading...")
      window.location.reload()
    } catch (err) {
      setError("An error occurred")
      setIsPending(false)
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in
      </h1>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={error} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          {isPending ? "Signing in..." : "Sign in"}
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        <button
          type="button"
          className="underline"
          onClick={() => alert("Password reset coming soon")}
          data-testid="forgot-password-button"
        >
          Forgot password?
        </button>
      </span>
      <span className="text-center text-ui-fg-base text-small-regular mt-4">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login