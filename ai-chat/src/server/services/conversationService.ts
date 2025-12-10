import { prisma } from '@/lib/prisma'
import type { Conversation, Message, MessageRole } from '@/types'

export class ConversationService {
  async createConversation(title?: string): Promise<Conversation> {
    const conversation = await prisma.conversation.create({
      data: {
        title,
      },
      include: {
        messages: true,
      },
    })

    return conversation as Conversation
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return conversation as Conversation | null
  }

  async listConversations(): Promise<Conversation[]> {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return conversations as Conversation[]
  }

  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string
  ): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    })

    return message as Message
  }

  async deleteConversation(id: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    })
  }

  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { title },
      include: {
        messages: true,
      },
    })

    return conversation as Conversation
  }
}

export const conversationService = new ConversationService()
