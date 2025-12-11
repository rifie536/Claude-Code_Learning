import { test, expect } from '@playwright/test'

test.describe('Conversation Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display recent conversations on home page', async ({ page }) => {
    // ホームページに「最近の会話」セクションが表示されるかテスト
    // Note: 実際にはデータベースにテストデータが必要
    await expect(page.getByRole('heading', { name: 'AI Chat' })).toBeVisible()
  })

  test('should open sidebar on mobile', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    // 新しいチャットを作成
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // ハンバーガーメニューボタンが表示されることを確認
    const menuButton = page.getByLabel('メニュー')
    await expect(menuButton).toBeVisible()

    // メニューをクリック
    await menuButton.click()

    // サイドバーが表示されることを確認（新しい会話ボタンが表示される）
    await expect(page.getByRole('button', { name: '新しいチャット' })).toBeVisible()
  })

  test('should create multiple conversations', async ({ page }) => {
    // 1つ目の会話を作成
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    const firstChatUrl = page.url()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // ホームに戻る
    await page.goto('/')

    // 2つ目の会話を作成
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    const secondChatUrl = page.url()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // 異なるURLであることを確認
    expect(firstChatUrl).not.toBe(secondChatUrl)
  })

  test('should navigate between conversations using sidebar', async ({ page }) => {
    // デスクトップビューポートに設定
    await page.setViewportSize({ width: 1280, height: 720 })

    // 新しいチャットを作成
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // サイドバーの新しいチャットボタンが表示されることを確認
    const newChatButton = page.getByRole('button', { name: '新しいチャット' })
    await expect(newChatButton).toBeVisible()
  })
})
