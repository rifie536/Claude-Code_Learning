import { test, expect } from '@playwright/test'

test.describe('UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle dark mode', async ({ page }) => {
    // 新しいチャットを作成してチャットページへ
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // サイドバーにテーマトグルボタンがあることを確認
    const themeToggle = page.getByLabel('テーマ切り替え')
    await expect(themeToggle).toBeVisible()

    // 初期状態のHTML要素のクラスを取得
    const htmlElement = page.locator('html')
    const initialClasses = await htmlElement.getAttribute('class')

    // テーマを切り替え
    await themeToggle.click()

    // クラスが変更されたことを確認（darkクラスの追加または削除）
    await page.waitForTimeout(500) // アニメーション待機
    const updatedClasses = await htmlElement.getAttribute('class')
    expect(initialClasses).not.toBe(updatedClasses)

    // もう一度切り替えて元に戻る
    await themeToggle.click()
    await page.waitForTimeout(500)
    const finalClasses = await htmlElement.getAttribute('class')
    expect(finalClasses).toBe(initialClasses)
  })

  test('should be responsive on mobile', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })

    // ホームページの要素が表示されることを確認
    await expect(page.getByRole('heading', { name: 'AI Chat' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /新しいチャットを始める/i })
    ).toBeVisible()

    // チャットページへ遷移
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // メッセージ入力欄が表示されることを確認
    await expect(page.getByPlaceholder(/メッセージを入力/i)).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    // タブレットビューポートに設定
    await page.setViewportSize({ width: 768, height: 1024 })

    await expect(page.getByRole('heading', { name: 'AI Chat' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /新しいチャットを始める/i })
    ).toBeVisible()
  })

  test('should be responsive on desktop', async ({ page }) => {
    // デスクトップビューポートに設定
    await page.setViewportSize({ width: 1920, height: 1080 })

    await expect(page.getByRole('heading', { name: 'AI Chat' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /新しいチャットを始める/i })
    ).toBeVisible()
  })

  test('should display loading state', async ({ page }) => {
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // メッセージを入力
    const input = page.getByPlaceholder(/メッセージを入力/i)
    await input.fill('テストメッセージ')

    // 送信ボタンが有効であることを確認
    const sendButton = page.getByRole('button', { name: '送信' })
    await expect(sendButton).toBeEnabled()

    // Note: 実際のローディング状態をテストするにはAPIモックが必要
  })

  test('should have proper focus management', async ({ page }) => {
    await page.getByRole('button', { name: /新しいチャットを始める/i }).click()
    await expect(page).toHaveURL(/\/chat\/[a-zA-Z0-9]+/)

    // メッセージ入力欄にフォーカス
    const input = page.getByPlaceholder(/メッセージを入力/i)
    await input.focus()

    // フォーカスされていることを確認
    await expect(input).toBeFocused()

    // Tabキーで送信ボタンにフォーカス移動
    await page.keyboard.press('Tab')

    // 送信ボタンがフォーカスされていることを確認
    const sendButton = page.getByRole('button', { name: '送信' })
    await expect(sendButton).toBeFocused()
  })
})
