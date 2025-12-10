import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // サンプル会話の作成
  const conversation1 = await prisma.conversation.create({
    data: {
      title: 'はじめての会話',
      messages: {
        create: [
          {
            role: 'user',
            content: 'こんにちは！',
          },
          {
            role: 'assistant',
            content: 'こんにちは！私はAIアシスタントです。何かお手伝いできることはありますか？',
          },
        ],
      },
    },
  })

  const conversation2 = await prisma.conversation.create({
    data: {
      title: 'プログラミングの質問',
      messages: {
        create: [
          {
            role: 'user',
            content: 'TypeScriptとJavaScriptの違いを教えてください。',
          },
          {
            role: 'assistant',
            content:
              'TypeScriptはJavaScriptのスーパーセットで、静的型付けを提供します。これにより、開発時にエラーを検出しやすくなり、コードの保守性が向上します。',
          },
        ],
      },
    },
  })

  console.log('Seeding finished.')
  console.log({ conversation1, conversation2 })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
