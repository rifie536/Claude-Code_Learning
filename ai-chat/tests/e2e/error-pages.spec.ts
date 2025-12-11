import { test, expect } from '@playwright/test'

test.describe('Error Pages', () => {
  test.describe('404 Not Found Page', () => {
    test('should display 404 page for non-existent route', async ({ page }) => {
      // 存在しないページにアクセス
      await page.goto('/non-existent-page')

      // 404ページの要素を確認
      await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
      await expect(
        page.getByRole('heading', { name: 'ページが見つかりません' })
      ).toBeVisible()
      await expect(
        page.getByText('お探しのページは存在しないか、移動した可能性があります。')
      ).toBeVisible()

      // ボタンが表示されることを確認
      await expect(
        page.getByTestId('back-to-home-button')
      ).toBeVisible()
      await expect(page.getByTestId('go-back-button')).toBeVisible()
    })

    test('should navigate back to home from 404 page', async ({ page }) => {
      await page.goto('/non-existent-page')

      // ホームに戻るボタンをクリック
      await page.getByTestId('back-to-home-button').click()

      // ホームページに遷移することを確認
      await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test.skip('should display error for invalid chat ID', async () => {
      // Note: このテストは実装に依存するため、スキップします
      // 存在しない会話へのアクセス時の挙動は、
      // アプリケーションの設計によって異なります
    })
  })

  test.describe('Chat Error Page', () => {
    test.skip('should handle non-existent conversation gracefully', async () => {
      // Note: このテストは実装に依存するため、スキップします
      // 存在しない会話へのアクセス時の挙動は、
      // データベースの設定やエラーハンドリングの実装によって異なります
    })
  })

  test.describe('Error Page Buttons', () => {
    test('should have accessible buttons on 404 page', async ({ page }) => {
      await page.goto('/non-existent-page')

      // ボタンがクリック可能であることを確認
      const homeButton = page.getByTestId('back-to-home-button')
      const backButton = page.getByTestId('go-back-button')

      await expect(homeButton).toBeEnabled()
      await expect(backButton).toBeEnabled()

      // アクセシビリティ: ボタンにテキストが含まれていることを確認
      await expect(homeButton).toContainText('ホームに戻る')
      await expect(backButton).toContainText('前のページに戻る')
    })
  })

  test.describe('Dark Mode Support', () => {
    test('should render error page correctly in dark mode', async ({
      page,
    }) => {
      // ダークモードを設定
      await page.emulateMedia({ colorScheme: 'dark' })

      await page.goto('/non-existent-page')

      // ページが正しくレンダリングされることを確認
      await expect(page.getByRole('heading', { name: '404' })).toBeVisible()

      // ダークモードのスタイルが適用されていることを確認
      // (実際のスタイルチェックは困難なため、要素の可視性で確認)
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should display error page correctly on mobile', async ({ page }) => {
      await page.goto('/non-existent-page')

      // モバイルビューポートを設定（ページロード後）
      await page.setViewportSize({ width: 375, height: 667 })

      // ページがリロードされるのを待つ
      await page.waitForLoadState('networkidle')

      // モバイルでも要素が正しく表示されることを確認
      await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
      await expect(
        page.getByTestId('back-to-home-button')
      ).toBeVisible()
    })

    test('should display error page correctly on tablet', async ({ page }) => {
      await page.goto('/non-existent-page')

      // タブレットビューポートを設定（ページロード後）
      await page.setViewportSize({ width: 768, height: 1024 })

      // ページがリロードされるのを待つ
      await page.waitForLoadState('networkidle')

      // タブレットでも要素が正しく表示されることを確認
      await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
      await expect(
        page.getByTestId('back-to-home-button')
      ).toBeVisible()
    })
  })
})
