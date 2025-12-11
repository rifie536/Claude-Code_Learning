import { test, expect } from '@playwright/test'

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display home page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Chat' })).toBeVisible()
    await expect(page.getByText('Powered by Claude API & Mastra')).toBeVisible()
  })

  test('should create new chat and navigate to chat page', async ({ page }) => {
    // 新しいチャットボタンをクリック
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()

    // チャットページに遷移することを確認
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // チャットコンテナが表示されることを確認
    await expect(page.getByText('新しい会話を始めましょう')).toBeVisible()
  })

  test('should send message and receive response', async ({ page }) => {
    // Note: このテストは実際のAI APIをモックする必要があります
    // 現在はUI要素の存在確認のみ行います

    // 新しいチャットを作成
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // メッセージ入力欄が表示されることを確認
    const input = page.getByPlaceholder(/メッセージを入力/i)
    await expect(input).toBeVisible()

    // 送信ボタンが表示されることを確認
    const sendButton = page.getByRole('button', { name: '送信' })
    await expect(sendButton).toBeVisible()

    // 最初は無効化されていることを確認
    await expect(sendButton).toBeDisabled()

    // メッセージを入力
    await input.fill('こんにちは')

    // 送信ボタンが有効化されることを確認
    await expect(sendButton).toBeEnabled()
  })

  test('should handle Enter key for sending message', async ({ page }) => {
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    const input = page.getByPlaceholder(/メッセージを入力/i)
    await input.fill('テストメッセージ')

    // Enterキーで送信（実際のAPIコールはモックが必要）
    await input.press('Enter')

    // 入力欄がクリアされることを確認
    await expect(input).toHaveValue('')
  })

  test('should handle Shift+Enter for line break', async ({ page }) => {
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    const input = page.getByPlaceholder(/メッセージを入力/i)
    await input.fill('1行目')

    // Shift+Enterで改行
    await input.press('Shift+Enter')
    await input.press('2')
    await input.press('行')
    await input.press('目')

    // 改行が含まれていることを確認
    const value = await input.inputValue()
    expect(value).toContain('\n')
  })
})
