"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/navbar"
import Container from "@/components/layout/container"
import {
  getConversations,
  type Conversation,
} from "@/lib/api/messages"

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadConversations() {
      try {
        setLoading(true)
        setError(null)

        const response = await getConversations()

        if (!cancelled) {
          setConversations(response.results || [])
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load messages"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadConversations()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <Container>
        <div className="py-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Messages
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Your conversations with buyers and sellers
            </p>
          </div>

          {loading && (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
              <div className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <h2 className="text-xl font-semibold">
                No messages yet
              </h2>

              <p className="mt-2 text-sm text-[var(--muted)]">
                When you contact a seller or someone contacts you
                about a listing, your conversation will appear here.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="truncate text-lg font-semibold">
                          {conversation.listing_title}
                        </h2>

                        {conversation.unread_count > 0 && (
                          <span className="shrink-0 rounded-full bg-lime-400 px-2.5 py-1 text-xs font-bold text-black">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[var(--muted)]">
                        Buyer: {conversation.buyer_username}
                        {" · "}
                        Seller: {conversation.seller_username}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm text-[var(--muted)]">
                      →
                    </span>
                  </div>

                  {conversation.last_message && (
                    <p
                      className={`mt-4 truncate text-sm ${
                        conversation.unread_count > 0
                          ? "font-semibold text-[var(--foreground)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {conversation.last_message}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}