"use client"

import { FormEvent, useEffect, useReducer, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import Container from "@/components/layout/container"
import {
getConversationMessages,
sendMessage,
type ConversationMessagesResponse,
} from "@/lib/api/messages"

type ConversationState = {
conversation: ConversationMessagesResponse | null
loading: boolean
error: string | null
}

type ConversationAction =
| { type: "LOAD_START" }
| {
type: "LOAD_SUCCESS"
payload: ConversationMessagesResponse
}
| {
type: "LOAD_ERROR"
payload: string
}

const initialConversationState: ConversationState = {
conversation: null,
loading: true,
error: null,
}

function conversationReducer(
state: ConversationState,
action: ConversationAction
): ConversationState {
switch (action.type) {
case "LOAD_START":
return {
...state,
loading: true,
error: null,
}

case "LOAD_SUCCESS":
  return {
    conversation: action.payload,
    loading: false,
    error: null,
  }

case "LOAD_ERROR":
  return {
    conversation: null,
    loading: false,
    error: action.payload,
  }

default:
  return state

}
}

export default function ConversationPage() {
const params = useParams()
const router = useRouter()

const conversationId = Number(params.id)

const isValidConversationId =
Number.isInteger(conversationId) && conversationId > 0

const [state, dispatch] = useReducer(
conversationReducer,
initialConversationState
)

const [message, setMessage] = useState("")
const [sending, setSending] = useState(false)

useEffect(() => {
if (!isValidConversationId) {
return
}

let cancelled = false

async function fetchConversation() {
  dispatch({ type: "LOAD_START" })

  try {
    const data =
      await getConversationMessages(conversationId)

    if (cancelled) {
      return
    }

    dispatch({
      type: "LOAD_SUCCESS",
      payload: data,
    })
  } catch (err: unknown) {
    if (cancelled) {
      return
    }

    dispatch({
      type: "LOAD_ERROR",
      payload:
        err instanceof Error
          ? err.message
          : "Unable to load conversation",
    })
  }
}

void fetchConversation()

return () => {
  cancelled = true
}

}, [conversationId, isValidConversationId])

async function handleSubmit(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault()

const trimmedMessage = message.trim()

if (
  !trimmedMessage ||
  sending ||
  !isValidConversationId
) {
  return
}

try {
  setSending(true)

  await sendMessage(
    conversationId,
    trimmedMessage
  )

  setMessage("")

  const data =
    await getConversationMessages(conversationId)

  dispatch({
    type: "LOAD_SUCCESS",
    payload: data,
  })
} catch (err: unknown) {
  dispatch({
    type: "LOAD_ERROR",
    payload:
      err instanceof Error
        ? err.message
        : "Unable to send message",
  })
} finally {
  setSending(false)
}

}

if (!isValidConversationId) {
return ( <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"> <Navbar />

    <Container>
      <div className="py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold">
          Invalid conversation
        </h1>

        <p className="text-[var(--muted)]">
          The conversation link is not valid.
        </p>
      </div>
    </Container>

    <Footer />
  </main>
)


}

if (state.loading) {
return ( <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"> <Navbar />

    <Container>
      <div className="py-20 text-center">
        <p className="text-[var(--muted)]">
          Loading conversation...
        </p>
      </div>
    </Container>

    <Footer />
  </main>
)


}

if (state.error && !state.conversation) {
return ( <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"> <Navbar />

    <Container>
      <div className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold">
          Unable to open conversation
        </h1>

        <p className="mb-6 text-[var(--muted)]">
          {state.error}
        </p>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-black transition hover:bg-lime-300"
        >
          Go Back
        </button>
      </div>
    </Container>

    <Footer />
  </main>
)

}

if (!state.conversation) {
return null
}

const conversation = state.conversation

return ( <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]"> <Navbar />

```
  <section className="py-6 sm:py-8">
    <Container>
      <div className="mx-auto flex max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="border-b border-[var(--border)] p-5 sm:p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold sm:text-2xl">
            {conversation.listing_title}
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Buyer: {conversation.buyer} · Seller:{" "}
            {conversation.seller}
          </p>
        </div>

        <div className="min-h-[420px] space-y-4 overflow-y-auto p-5 sm:p-6">
          {conversation.results.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center text-center">
              <p className="text-[var(--muted)]">
                No messages yet. Start the conversation below.
              </p>
            </div>
          ) : (
            conversation.results.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-4">
                  <p className="font-semibold">
                    {item.sender_username}
                  </p>

                  <p className="text-xs text-[var(--muted)]">
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <p className="whitespace-pre-wrap leading-6 text-[var(--muted)]">
                  {item.body}
                </p>
              </div>
            ))
          )}
        </div>

        {state.error && (
          <div className="border-t border-[var(--border)] px-5 py-3 sm:px-6">
            <p className="text-sm text-red-600">
              {state.error}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-[var(--border)] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Write a message..."
              rows={3}
              disabled={sending}
              className="min-h-[90px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-lime-400 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="rounded-xl bg-lime-400 px-6 py-3 font-medium text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </Container>
  </section>

  <Footer />
</main>


)
}
