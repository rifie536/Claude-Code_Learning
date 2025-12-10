import { Agent } from '@mastra/core/agent'
import { anthropic } from '@ai-sdk/anthropic'

export const createChatAgent = () => {
  return new Agent({
    id: 'chat-agent',
    name: 'Chat Agent',
    instructions: 'You are a helpful AI assistant. Respond in Japanese when user writes in Japanese.',
    model: anthropic('claude-3-5-sonnet-20241022'),
  })
}

export const chatAgent = createChatAgent()
