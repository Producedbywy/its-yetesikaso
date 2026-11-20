"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
} from "lucide-react"

import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"

import {
  startBuyerRegistration,
  verifyBuyerPhone,
  resendBuyerCode,
  sendBuyerConfirmationEmail,
} from "@/lib/api/buyer-registration"

type Step = "details" | "phone" | "email"

const steps: { key: Step; label: string }[] = [
  { key: "details", label: "Your details" },
  { key: "phone", label: "Phone verification" },
  { key: "email", label: "Email confirmation" },
]

export default function BuyerRegistrationPreviewPage() {
  const [step, setStep] = useState<Step>("details")
  const [showPassword, setShowPassword] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [verificationBusy, setVerificationBusy] = useState(false)

  const [verificationError, setVerificationError] =
    useState<string | null>(null)

  const [verificationNotice, setVerificationNotice] =
    useState<string | null>(null)

  const liveRegistrationEnabled =
    process.env.NEXT_PUBLIC_BUYER_REGISTRATION_ENABLED === "true"

  const currentStep = steps.findIndex(
    (item) => item.key === step
  )

  async function handleDetailsSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    if (!acceptedTerms || submitting) return

    setError(null)

    // Keep the client preview functional
    // without making live API requests.
    if (!liveRegistrationEnabled) {
      setStep("phone")
      return
    }

    try {
      setSubmitting(true)

      const response = await startBuyerRegistration({
        first_name: firstName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        terms_accepted: acceptedTerms,
      })

      setPhone(response.phone)

      // Clear the password once registration starts.
      setPassword("")

      setStep("phone")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start registration."
      )
    } finally {
      setSubmitting(false)
    }
  }

    async function handlePhoneVerification() {
    setVerificationError(null)
    setVerificationNotice(null)

    if (!liveRegistrationEnabled) {
      setStep("email")
      return
    }

    if (code.length !== 6) {
      setVerificationError(
        "Please enter the six-digit verification code."
      )
      return
    }

    setVerificationBusy(true)

    try {
      await verifyBuyerPhone(
        email.trim().toLowerCase(),
        code
      )

      // Phone verification succeeded.
      setStep("email")

      try {
        await sendBuyerConfirmationEmail(
          email.trim().toLowerCase()
        )

        setVerificationNotice(
          "A confirmation link has been requested for your email address."
        )
      } catch (err: unknown) {
        setVerificationError(
          err instanceof Error
            ? `Phone verified. ${err.message}`
            : "Your phone was verified, but we couldn't send the confirmation email."
        )
      }
    } catch (err: unknown) {
      setVerificationError(
        err instanceof Error
          ? err.message
          : "Unable to verify your phone number."
      )
    } finally {
      setVerificationBusy(false)
    }
  }

  async function handleResendCode() {
    if (!liveRegistrationEnabled || verificationBusy) {
      return
    }

    setVerificationError(null)
    setVerificationNotice(null)
    setVerificationBusy(true)

    try {
      const response = await resendBuyerCode(
        email.trim().toLowerCase()
      )

      setCode("")
      setVerificationNotice(response.message)
    } catch (err: unknown) {
      setVerificationError(
        err instanceof Error
          ? err.message
          : "Unable to resend the verification code."
      )
    } finally {
      setVerificationBusy(false)
    }
  }

    async function handleResendEmail() {
    if (!liveRegistrationEnabled || verificationBusy) {
      return
    }

    setVerificationError(null)
    setVerificationNotice(null)
    setVerificationBusy(true)

    try {
      const response = await sendBuyerConfirmationEmail(
        email.trim().toLowerCase()
      )

      setVerificationNotice(response.message)
    } catch (err: unknown) {
      setVerificationError(
        err instanceof Error
          ? err.message
          : "Unable to resend the confirmation email."
      )
    } finally {
      setVerificationBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="px-4 py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="mb-9 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-lime-700">
                Welcome to Yetesikaso
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Create your buyer account
              </h1>

              <p className="mx-auto mt-4 max-w-lg leading-7 text-[var(--muted)]">
                Join Yetesikaso to discover great finds,
                save your favourites and connect with
                sellers across Ghana.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="border-b border-[var(--border)] px-6 py-6 sm:px-10">
                <div className="flex items-start justify-between gap-2">
                  {steps.map((item, index) => {
                    const completed = index < currentStep
                    const active = index === currentStep

                    return (
                      <div
                        key={item.key}
                        className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                            completed || active
                              ? "bg-[var(--primary)] text-gray-950"
                              : "bg-[var(--background)] text-[var(--muted)]"
                          }`}
                          aria-current={active ? "step" : undefined}
                        >
                          {completed ? <Check size={19} /> : index + 1}
                        </span>

                        <span
                          className={`text-xs sm:text-sm ${
                            active
                              ? "font-semibold"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-6 sm:p-10">
                {step === "details" && (
                  <>
                    <h2 className="text-2xl font-bold">
                      Let&apos;s get started
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Enter your details to create your
                      Yetesikaso account.
                    </p>

                    <form
                      onSubmit={handleDetailsSubmit}
                      className="mt-8 space-y-5"
                    >
                      <div>
                        <label
                          htmlFor="buyer-first-name"
                          className="mb-2 block text-sm font-semibold"
                        >
                          First name
                        </label>

                        <input
                          id="buyer-first-name"
                          type="text"
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) =>
                            setFirstName(e.target.value)
                          }
                          maxLength={150}
                          placeholder="Enter your first name"
                          required
                          className="w-full rounded-xl border border-[var(--border)] px-4 py-3.5 outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="buyer-email"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Email address
                        </label>

                        <input
                          id="buyer-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          placeholder="you@example.com"
                          required
                          className="w-full rounded-xl border border-[var(--border)] px-4 py-3.5 outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="buyer-password"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Password
                        </label>

                        <div className="relative">
                          <input
                            id="buyer-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) =>
                              setPassword(e.target.value)
                            }
                            minLength={8}
                            placeholder="Create a secure password"
                            required
                            className="w-full rounded-xl border border-[var(--border)] px-4 py-3.5 pr-12 outline-none focus:border-lime-500"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(!showPassword)
                            }
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                          >
                            {showPassword ? (
                              <EyeOff size={19} />
                            ) : (
                              <Eye size={19} />
                            )}
                          </button>
                        </div>

                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Use at least 8 characters.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="buyer-phone"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Mobile phone number
                        </label>

                        <div className="flex overflow-hidden rounded-xl border border-[var(--border)] focus-within:border-lime-500">
                          <span className="flex items-center border-r border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold">
                            +233
                          </span>

                          <input
                            id="buyer-phone"
                            type="tel"
                            autoComplete="tel-national"
                            value={phone}
                            onChange={(e) =>
                              setPhone(e.target.value)
                            }
                            placeholder="24 123 4567"
                            required
                            className="min-w-0 flex-1 px-4 py-3.5 outline-none"
                          />
                        </div>

                        <p className="mt-2 text-xs text-[var(--muted)]">
                          We&apos;ll use this number to verify
                          your account. It won&apos;t appear
                          automatically on your listings.
                        </p>
                      </div>

                      <label className="flex items-start gap-3 rounded-xl bg-[var(--background)] p-4">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) =>
                            setAcceptedTerms(e.target.checked)
                          }
                          required
                          className="mt-1 h-4 w-4 accent-lime-500"
                        />

                        <span className="text-sm leading-6 text-[var(--muted)]">
                          I agree to the Yetesikaso{" "}
                          <Link
                            href="/terms"
                            className="font-semibold text-[var(--foreground)] underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and acknowledge the{" "}
                          <Link
                            href="/privacy"
                            className="font-semibold text-[var(--foreground)] underline"
                          >
                            Privacy Policy
                          </Link>.
                        </span>
                      </label>

                      {error && (
                        <p
                          role="alert"
                          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                        >
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-gray-950 transition hover:brightness-95 disabled:opacity-50"
                      >
                        {submitting
                          ? "Requesting verification code..."
                          : liveRegistrationEnabled
                            ? "Send Verification Code"
                            : "Preview phone verification"}
                      </button>

                      {!liveRegistrationEnabled && (
                        <p className="text-center text-xs text-[var(--muted)]">
                          Preview only — no account will be
                          created or SMS sent.
                        </p>
                      )}
                    </form>
                  </>
                )}

                {step === "phone" && (
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-lime-800">
                      <ShieldCheck size={32} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
                      Verify your phone number
                    </h2>

                    <p className="mt-3 leading-7 text-[var(--muted)]">
                      When SMS is enabled, we&apos;ll send
                      a six-digit verification code to
                      your mobile phone.
                    </p>

                    <p className="mt-3 text-sm font-semibold">
                      {phone}
                    </p>

                    <div className="mx-auto mt-8 max-w-xs text-left">
                      <label
                        htmlFor="buyer-code"
                        className="mb-2 block text-sm font-semibold"
                      >
                        Verification code
                      </label>

                      <input
                        id="buyer-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) =>
                          setCode(
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="000000"
                        className="w-full rounded-xl border border-[var(--border)] px-4 py-4 text-center text-2xl tracking-[0.4em] outline-none focus:border-lime-500"
                      />
                    </div>

                    {!liveRegistrationEnabled && (
                      <p className="mt-4 text-xs text-[var(--muted)]">
                        Preview only — no SMS has been sent,
                        and no code will be verified.
                      </p>
                    )}

                    {verificationError && (
                      <p
                        role="alert"
                        className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                      >
                        {verificationError}
                      </p>
                    )}

                    {verificationNotice && (
                      <p
                        role="status"
                        className="mt-5 rounded-xl bg-lime-50 p-4 text-sm text-lime-900"
                      >
                        {verificationNotice}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handlePhoneVerification}
                      disabled={verificationBusy}
                      className="mt-7 w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-gray-950 disabled:opacity-50"
                    >
                      {verificationBusy
                        ? "Processing..."
                        : liveRegistrationEnabled
                          ? "Verify Phone Number"
                          : "Preview email confirmation"}
                    </button>

                    {liveRegistrationEnabled && (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={verificationBusy}
                        className="mt-5 text-sm font-semibold underline underline-offset-4 disabled:opacity-50"
                      >
                        Didn&apos;t receive a code? Resend SMS
                      </button>
                    )}

                    {!liveRegistrationEnabled && (
                      <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)]"
                      >
                        <ArrowLeft size={16} />
                        Back to details
                      </button>
                    )}
                  </div>
                )}

                {step === "email" && (
                  <div className="py-5 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-lime-800">
                      <Mail size={32} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
                      {liveRegistrationEnabled
                        ? "Check your email"
                        : "One final step"}
                    </h2>

                    <p className="mt-4 leading-7 text-[var(--muted)]">
                      {liveRegistrationEnabled
                        ? "Your phone has been verified. Please check your email for a confirmation link to activate your Yetesikaso account."
                        : "Once your phone is verified, Yetesikaso will send a confirmation link to your email address."}
                    </p>

                    <p className="mt-3 font-semibold">
                      {email}
                    </p>

                    {verificationError && (
                      <p
                        role="alert"
                        className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
                      >
                        {verificationError}
                      </p>
                    )}

                    {verificationNotice && (
                      <p
                        role="status"
                        className="mt-6 rounded-xl bg-lime-50 p-4 text-sm text-lime-900"
                      >
                        {verificationNotice}
                      </p>
                    )}

                    {liveRegistrationEnabled ? (
                      <>
                        <div className="mt-6 rounded-xl bg-[var(--background)] p-5 text-sm leading-7 text-[var(--muted)]">
                          <p>
                            Your confirmation link is
                            valid for 72 hours.
                          </p>

                          <p className="mt-2">
                            If you cannot find the email,
                            check your spam or junk folder.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleResendEmail}
                          disabled={verificationBusy}
                          className="mt-7 w-full rounded-xl bg-[var(--primary)] px-6 py-4 font-bold text-gray-950 disabled:opacity-50"
                        >
                          {verificationBusy
                            ? "Sending..."
                            : "Resend Confirmation Email"}
                        </button>

                        <p className="mt-4 text-xs text-[var(--muted)]">
                          You can request another email
                          after 60 seconds.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-6 rounded-xl bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
                          This is a preview. No email has
                          been sent and no account has
                          been created.
                        </p>

                        <button
                          type="button"
                          onClick={() => setStep("details")}
                          className="mt-7 inline-flex items-center gap-2 font-semibold"
                        >
                          <ArrowLeft size={17} />
                          Return to registration
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link
                href="/login/buyer"
                className="font-bold text-[var(--foreground)] underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </main>
  )
}