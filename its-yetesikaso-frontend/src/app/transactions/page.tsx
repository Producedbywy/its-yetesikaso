"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import {
  getMyTransactions,
  type Transaction,
} from "@/lib/api/transactions"
import { getMyProfile, type SellerProfile } from "@/lib/api/seller"

function formatAmount(amount: string) {
  return `GHS ${Number(amount).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getStatusLabel(status: Transaction["status"]) {
  switch (status) {
    case "pending":
      return "Pending"
    case "confirmed":
      return "Confirmed"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTransactions() {
      try {
        setLoading(true)
        setError(null)

        const [transactionsResponse, profileResponse] =
          await Promise.all([
            getMyTransactions(),
            getMyProfile(),
          ])

        if (!cancelled) {
          setTransactions(transactionsResponse.transactions)
          setProfile(profileResponse)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load transactions"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTransactions()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <main className="py-10 md:py-14">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Transactions
            </h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              View and manage your purchases and sales.
            </p>
          </div>

          {loading && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
              <p className="text-[var(--muted-foreground)]">
                Loading transactions...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <h2 className="text-xl font-semibold">
                No transactions yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-[var(--muted-foreground)]">
                Your purchases and sales will appear here once you
                start a transaction.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-flex rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const isBuyer =
                  profile &&
                  transaction.buyer_username.toLowerCase() ===
                    profile.username.toLowerCase()

                return (
                  <Link
                    key={transaction.id}
                    href={`/transactions/${transaction.id}`}
                    className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-lime-400 hover:shadow-sm md:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold dark:bg-gray-800">
                            {isBuyer ? "Purchase" : "Sale"}
                          </span>

                          <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-800 dark:bg-lime-950 dark:text-lime-300">
                            {getStatusLabel(transaction.status)}
                          </span>
                        </div>

                        <h2 className="truncate text-lg font-semibold">
                          {transaction.listing_title}
                        </h2>

                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {isBuyer
                            ? `Seller: ${transaction.seller_username}`
                            : `Buyer: ${transaction.buyer_username}`}
                        </p>
                      </div>

                      <div className="shrink-0 md:text-right">
                        <p className="text-lg font-bold">
                          {formatAmount(transaction.total_amount)}
                        </p>

                        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                          {transaction.quantity}{" "}
                          {transaction.quantity === 1
                            ? "unit"
                            : "units"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-1 border-t border-[var(--border)] pt-4 text-sm text-[var(--muted-foreground)] sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        {isBuyer ? "Purchased" : "Sale started"}{" "}
                        {formatDate(transaction.created_at)}
                      </span>

                      <span className="font-medium text-[var(--foreground)]">
                        View transaction →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </div>
  )
}