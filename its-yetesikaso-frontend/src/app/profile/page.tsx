"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"

import {
  getMyListings,
  getMyProfile,
  updateMyProfile,
  upgradeAccount,
  type SellerProfile,
} from "@/lib/api/seller"

import { getMyJobs, type Job } from "@/lib/api/employer"

import type { Listing } from "@/types/listing"

export default function ProfilePage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [jobs, setJobs] = useState<Job[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [upgrading, setUpgrading] = useState<
    "seller" | "employer" | null
  >(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    location: "",
    bio: "",
  })

  const [applicationRole, setApplicationRole] = useState<
    "seller" | "employer" | null
  >(null)

  const [ghanaCardForm, setGhanaCardForm] = useState({
    ghana_card_name: "",
    ghana_card_number: "",
  })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        setLoading(true)
        setError(null)

        const profileData = await getMyProfile()

        if (cancelled) return

        setProfile(profileData)

        setForm({
          display_name: profileData.display_name || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || "",
        })

        if (profileData.role === "seller") {
  const listingsData = await getMyListings()

  if (cancelled) return

  setListings(listingsData.results || [])
  setJobs([])
} else if (profileData.role === "employer") {
          const jobsData = await getMyJobs()

          if (cancelled) return

          setJobs(jobsData.results || [])
          setListings([])
        } else {
          setListings([])
          setJobs([])
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your profile"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updated = await updateMyProfile({
        display_name: form.display_name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        onboarding_completed: true,
      })

      setProfile(updated)

      setForm({
        display_name: updated.display_name || "",
        phone: updated.phone || "",
        location: updated.location || "",
        bio: updated.bio || "",
      })

      setSuccess("Profile updated successfully.")
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update your profile"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleUpgrade(
    role: "seller" | "employer"
  ) {
    try {
      setUpgrading(role)
      setError(null)
      setSuccess(null)

      const updated = await upgradeAccount(role, {
        ...form,
        display_name: form.display_name.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        ghana_card_name: ghanaCardForm.ghana_card_name.trim(),
        ghana_card_number: ghanaCardForm.ghana_card_number.trim(),
      })

      setProfile(updated)
      setListings([])
      setJobs([])
      setApplicationRole(null)

      setGhanaCardForm({
        ghana_card_name: "",
        ghana_card_number: "",
      })

      setSuccess(
        "Your application has been submitted and is awaiting verification. You will be able to use your account tools after approval."
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your application"
      )
    } finally {
      setUpgrading(null)
    }
  }

  const isSeller = profile?.role === "seller"
  const isEmployer = profile?.role === "employer"
  const isUser = profile?.role === "user"
  const isVerified =
    profile?.verification_status === "verified"

  const accountType = isSeller
    ? "Seller"
    : isEmployer
      ? "Employer"
      : "User"

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="mx-auto max-w-5xl py-10">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              {isSeller
                ? "Seller Profile"
                : isEmployer
                  ? "Employer Profile"
                  : "Your Profile"}
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              {isSeller
                ? "Complete your seller profile so buyers know who they are dealing with."
                : isEmployer
                  ? "Complete your employer profile so job seekers know who they are dealing with."
                  : "Complete your profile before you start using Yetesikaso."}
            </p>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[320px] items-center justify-center">
              <p className="text-sm text-[var(--muted)]">
                Loading your profile...
              </p>
            </div>
          )}

          {!loading && (
            <>
              {/* ERROR */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="mb-6 rounded-xl border border-lime-200 bg-lime-50 p-4 text-sm text-lime-700">
                  {success}
                </div>
              )}

              {/* PROFILE */}
              <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">

                {/* PROFILE HEADER */}
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-lime-100 text-3xl font-bold text-lime-700">
                    {(
                      profile?.display_name ||
                      profile?.username ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold">
                        {profile?.display_name ||
                          profile?.username}
                      </h2>

                      {isEmployer && (
                        <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
                          Employer
                        </span>
                      )}

                      {isSeller && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          Seller
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      @{profile?.username}
                    </p>

                    {profile?.email && (
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* ACCOUNT TYPE */}
                <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-sm text-[var(--muted)]">
                    Account type
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {accountType}
                  </p>

                  {isEmployer && (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Use your employer account to post jobs and manage candidates.
                    </p>
                  )}

                  {isSeller && (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Use your seller account to create and manage marketplace listings.
                    </p>
                  )}

                  {isUser && (
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      You can upgrade your account to become a seller or employer.
                    </p>
                  )}
                </div>

                {/* VERIFICATION STATUS */}
                {profile?.verification_status &&
                  profile.verification_status !== "not_submitted" && (
                    <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                      <h2 className="text-lg font-semibold">
                        Account Verification
                      </h2>

                      <div className="mt-3">
                        {profile.verification_status === "pending" && (
                          <>
                            <span className="inline-block rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
                              Awaiting Verification
                            </span>

                            <p className="mt-3 text-sm text-[var(--muted)]">
                              Your application has been received and is being
                              reviewed. Your seller or employer tools will
                              become available once your account is approved.
                            </p>
                          </>
                        )}

                        {profile.verification_status === "verified" && (
                          <>
                            <span className="inline-block rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-lime-700">
                              Verified
                            </span>

                            <p className="mt-3 text-sm text-[var(--muted)]">
                              Your account has been verified. You can now
                              access your account tools.
                            </p>
                          </>
                        )}

                        {profile.verification_status === "rejected" && (
                          <>
                            <span className="inline-block rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
                              Verification Rejected
                            </span>

                            <p className="mt-3 text-sm text-[var(--muted)]">
                              Your application was not approved. Please review
                              the reason below and correct your details before
                              resubmitting.
                            </p>

                            {profile.verification_rejection_reason && (
                              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-semibold text-red-700">
                                  Reason for rejection
                                </p>

                                <p className="mt-1 text-sm text-red-700">
                                  {profile.verification_rejection_reason}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}


                {/* ACCOUNT UPGRADES */}
                {(
                  isUser ||
                  (profile?.verification_status === "rejected" &&
                    (isSeller || isEmployer))
                ) && (
                  <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
                    <div className="mb-5">
                      <h2 className="text-xl font-bold">
                        Choose how you want to use Yetesikaso
                      </h2>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Your account can become a seller or employer whenever you are ready.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
  {(isUser || isSeller) && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">
        {isSeller ? "Resubmit Seller Application" : "Become a Seller"}
      </h3>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Sell products and services on the marketplace and manage your listings.
      </p>

      <button
        type="button"
        onClick={() => setApplicationRole("seller")}
        disabled={upgrading !== null}
        className="mt-5 w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSeller ? "Resubmit Application" : "Become a Seller"}
      </button>
    </div>
  )}

  {(isUser || isEmployer) && (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">
        {isEmployer ? "Resubmit Employer Application" : "Become an Employer"}
      </h3>

      <p className="mt-2 text-sm text-[var(--muted)]">
        Post jobs and connect with people looking for opportunities.
      </p>

      <button
        type="button"
        onClick={() => setApplicationRole("employer")}
        disabled={upgrading !== null}
        className="mt-5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 py-3 font-medium transition hover:bg-[var(--card)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isEmployer ? "Resubmit Application" : "Become an Employer"}
      </button>
    </div>
  )}
</div>

                    {/* GHANA CARD APPLICATION FORM */}
                    {applicationRole && (
                      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
                        <h3 className="text-lg font-semibold">
                          Ghana Card Verification
                        </h3>

                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Applying for a {applicationRole} account. Enter
                          your details exactly as they appear on your Ghana
                          Card. Your information will only be used for
                          verification.
                        </p>

                        <div className="mt-5 space-y-5">
                          <div>
                            <label
                              htmlFor="ghana_card_name"
                              className="mb-2 block text-sm font-medium"
                            >
                              Full Name on Ghana Card
                            </label>

                            <input
                              id="ghana_card_name"
                              value={ghanaCardForm.ghana_card_name}
                              onChange={(event) =>
                                setGhanaCardForm((previous) => ({
                                  ...previous,
                                  ghana_card_name: event.target.value,
                                }))
                              }
                              maxLength={150}
                              required
                              disabled={upgrading !== null}
                              autoComplete="off"
                              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none focus:border-lime-400 disabled:opacity-50"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="ghana_card_number"
                              className="mb-2 block text-sm font-medium"
                            >
                              Ghana Card Number
                            </label>

                            <input
                              id="ghana_card_number"
                              value={ghanaCardForm.ghana_card_number}
                              onChange={(event) =>
                                setGhanaCardForm((previous) => ({
                                  ...previous,
                                  ghana_card_number: event.target.value,
                                }))
                              }
                              maxLength={30}
                              required
                              disabled={upgrading !== null}
                              autoComplete="off"
                              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none focus:border-lime-400 disabled:opacity-50"
                            />
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpgrade(applicationRole)}
                              disabled={
                                upgrading !== null ||
                                !ghanaCardForm.ghana_card_name.trim() ||
                                !ghanaCardForm.ghana_card_number.trim() ||
                                !form.display_name.trim()
                              }
                              className="rounded-xl bg-lime-400 px-6 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {upgrading === applicationRole
                                ? "Submitting Application..."
                                : "Submit Application"}
                            </button>

                            <button
                              type="button"
                              onClick={() => setApplicationRole(null)}
                              disabled={upgrading !== null}
                              className="rounded-xl border border-[var(--border)] px-6 py-3 font-medium transition hover:bg-[var(--background)] disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* PROFILE STATUS */}
                <div className="mb-8 flex flex-wrap gap-3">
                  <span
                    className={
                      profile?.onboarding_completed
                        ? "rounded-full bg-lime-100 px-4 py-2 text-sm font-medium text-lime-700"
                        : "rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700"
                    }
                  >
                    {profile?.onboarding_completed
                      ? "Profile Complete"
                      : "Profile Incomplete"}
                  </span>

                  {isSeller && (
                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                      {profile?.listing_count ?? 0} Listings
                    </span>
                  )}

                  {isEmployer && (
                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                      {jobs.length} Job Posts
                    </span>
                  )}
                </div>

                {/* PROFILE FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* NAME / COMPANY */}
                  <div>
                    <label
                      htmlFor="display_name"
                      className="mb-2 block text-sm font-medium"
                    >
                      {isEmployer
                        ? "Employer / Company Name"
                        : "Display Name"}
                    </label>

                    <input
                      id="display_name"
                      value={form.display_name}
                      onChange={(event) =>
                        updateField(
                          "display_name",
                          event.target.value
                        )
                      }
                      maxLength={150}
                      required
                      disabled={saving}
                      placeholder={
                        isEmployer
                          ? "e.g. ABC Company Ltd"
                          : isSeller
                            ? "Your seller name"
                            : "Your display name"
                      }
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                    />

                    {isEmployer && (
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Use your registered business, company, organisation, or employer name.
                      </p>
                    )}
                  </div>

                  {/* PHONE / LOCATION */}
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* PHONE */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-medium"
                      >
                        {isEmployer
                          ? "Business Phone"
                          : "Phone"}
                      </label>

                      <input
                        id="phone"
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value
                          )
                        }
                        maxLength={30}
                        disabled={saving}
                        placeholder={
                          isEmployer
                            ? "e.g. +233 24 123 4567"
                            : "e.g. +233..."
                        }
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                      />

                      {isEmployer && (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          A phone number candidates can use to contact your organisation.
                        </p>
                      )}
                    </div>

                    {/* LOCATION */}
                    <div>
                      <label
                        htmlFor="location"
                        className="mb-2 block text-sm font-medium"
                      >
                        {isEmployer
                          ? "Business / Company Location"
                          : "Location"}
                      </label>

                      <input
                        id="location"
                        value={form.location}
                        onChange={(event) =>
                          updateField(
                            "location",
                            event.target.value
                          )
                        }
                        maxLength={150}
                        disabled={saving}
                        placeholder="e.g. Accra, Ghana"
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                      />

                      {isEmployer && (
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          Where your company or organisation is based.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ABOUT */}
                  <div>
                    <label
                      htmlFor="bio"
                      className="mb-2 block text-sm font-medium"
                    >
                      {isEmployer
                        ? "About the Employer"
                        : "About You"}
                    </label>

                    <textarea
                      id="bio"
                      value={form.bio}
                      onChange={(event) =>
                        updateField(
                          "bio",
                          event.target.value
                        )
                      }
                      maxLength={1000}
                      rows={6}
                      disabled={saving}
                      placeholder={
                        isEmployer
                          ? "Tell job seekers about your company, organisation, industry, culture, and the type of people you are looking to hire..."
                          : isSeller
                            ? "Tell buyers a little about yourself..."
                            : "Tell the Yetesikaso community a little about yourself..."
                      }
                      className="min-h-[140px] w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 outline-none transition focus:border-lime-400 disabled:opacity-50"
                    />

                    {isEmployer && (
                      <div className="mt-2 flex items-start justify-between gap-4">
                        <p className="text-sm text-[var(--muted)]">
                          Give job seekers useful context about your organisation before they apply for your jobs.
                        </p>

                        <span className="shrink-0 text-xs text-[var(--muted)]">
                          {form.bio.length}/1000
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SAVE */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !form.display_name.trim()
                      }
                      className="rounded-xl bg-lime-400 px-6 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : profile?.onboarding_completed
                          ? "Save Profile"
                          : "Complete Profile"}
                    </button>
                  </div>
                </form>
              </section>

              {/* EMPLOYER TOOLS */}
              {isEmployer && isVerified && (
                <section className="mt-10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                      Employer Tools
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Manage your employer account and job postings.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Link
                      href="/employer/dashboard"
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="text-lg font-semibold">
                        Employer Dashboard
                      </h3>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        View your employer overview and job statistics.
                      </p>

                      <p className="mt-4 text-sm font-medium text-lime-600">
                        Open Dashboard →
                      </p>
                    </Link>

                    <Link
                      href="/employer/jobs/manage"
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="text-lg font-semibold">
                        Manage Jobs
                      </h3>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        View, edit and manage your existing job posts.
                      </p>

                      <p className="mt-4 text-sm font-medium text-lime-600">
                        Manage Jobs →
                      </p>
                    </Link>

                    <Link
                      href="/employer/jobs/create"
                      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="text-lg font-semibold">
                        Post a Job
                      </h3>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Create a new job posting and start finding candidates.
                      </p>

                      <p className="mt-4 text-sm font-medium text-lime-600">
                        Post Job →
                      </p>
                    </Link>
                  </div>
                </section>
              )}

              {/* EMPLOYER JOBS */}
              {isEmployer && isVerified && (
                <section className="mt-10">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        Your Job Posts
                      </h2>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Jobs currently associated with your employer account.
                      </p>
                    </div>

                    {jobs.length > 0 && (
                      <Link
                        href="/employer/jobs/manage"
                        className="text-sm font-medium text-lime-600 hover:underline"
                      >
                        View all
                      </Link>
                    )}
                  </div>

                  {jobs.length === 0 ? (
                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                      <h3 className="text-lg font-semibold">
                        No jobs posted yet
                      </h3>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Post your first job to start finding candidates.
                      </p>

                      <Link
                        href="/employer/jobs/create"
                        className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black hover:bg-lime-300"
                      >
                        Post Your First Job
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm text-lime-600">
                                {job.category_display}
                              </p>

                              <h3 className="mt-1 text-lg font-semibold">
                                {job.title}
                              </h3>
                            </div>

                            <span className="shrink-0 rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium">
                              {job.status_display}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                            <p>
                              {job.location} •{" "}
                              {job.workplace_type_display}
                            </p>

                            <p>
                              {job.employment_type_display}
                            </p>

                            <p className="font-medium text-[var(--foreground)]">
                              {job.salary_display}
                            </p>
                          </div>

                          <div className="mt-5 flex items-center justify-between">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                            >
                              View job →
                            </Link>

                            <Link
                              href={`/employer/jobs/${job.id}/edit`}
                              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium transition hover:bg-[var(--background)]"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SELLER LISTINGS */}
              {isSeller && isVerified && (
                <section className="mt-10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">
                      Your Listings
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Listings currently associated with your seller account.
                    </p>
                  </div>

                  {listings.length === 0 ? (
                    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                      <h3 className="text-lg font-semibold">
                        No listings yet
                      </h3>

                      <p className="mt-2 text-sm text-[var(--muted)]">
                        Create your first listing to start selling.
                      </p>

                      <Link
                        href="/dashboard/create"
                        className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black hover:bg-lime-300"
                      >
                        Create Listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {listing.title}
                              </h3>

                              <p className="mt-1 text-sm text-[var(--muted)]">
                                {listing.category} •{" "}
                                {listing.location}
                              </p>
                            </div>

                            {listing.status === "draft" ? (
  <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
    Draft — awaiting verification
  </span>
) : (
  <span className="shrink-0 rounded-full bg-lime-100 px-3 py-1 text-xs font-medium text-lime-700">
    Active
  </span>
)}
                          </div>

                          <p className="mt-4 text-xl font-bold text-lime-500">
                            GH₵{" "}
                            {listing.price.toLocaleString()}
                          </p>

                          {listing.description && (
                            <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                              {listing.description}
                            </p>
                          )}

                          {listing.status === "published" ? (
  <Link
    href={`/marketplace/${listing.slug}`}
    className="mt-4 inline-block text-sm font-medium hover:underline"
  >
    View listing →
  </Link>
) : (
  <p className="mt-4 text-sm text-amber-700">
    Not yet visible to buyers
  </p>
)}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </Container>

      <Footer />
    </main>
  )
}