import { apiClient } from "@/lib/api/client"

export type Conversation = {
  id: number
  buyer: number
  buyer_username: string
  seller: number
  seller_username: string
  listing: number
  listing_title: string
  updated_at: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

export type ConversationsResponse = {
  results: Conversation[]
  total: number
  unread_count: number
}

export type Message = {
  id: number
  conversation: number
  sender: number
  sender_username: string
  body: string
  is_read: boolean
  created_at: string
}

export type ConversationMessagesResponse = {
  conversation: number
  listing: number
  listing_title: string
  buyer: number
  seller: number
  results: Message[]
}

export type CreateConversationResponse = {
  id: number
  buyer: number
  seller: number
  listing: number
  listing_title: string
  created: boolean
  created_at: string
  updated_at: string
}

export async function createConversation(
  listingId: number
): Promise<CreateConversationResponse> {
  return apiClient<CreateConversationResponse>(
    "/messages/conversations/create/",
    {
      method: "POST",
      body: JSON.stringify({
        listing_id: listingId,
      }),
    }
  )
}

export async function getConversations(): Promise<ConversationsResponse> {
  return apiClient<ConversationsResponse>(
    "/messages/conversations/"
  )
}

export async function getConversationMessages(
  conversationId: number
): Promise<ConversationMessagesResponse> {
  return apiClient<ConversationMessagesResponse>(
    `/messages/conversations/${conversationId}/messages/`
  )
}

export async function sendMessage(
  conversationId: number,
  body: string
): Promise<Message> {
  return apiClient<Message>(
    `/messages/conversations/${conversationId}/messages/`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    }
  )
}