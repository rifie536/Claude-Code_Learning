import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ThemeProvider } from 'next-themes'

// next-themesのuseTheme hookをモック
vi.mock('next-themes', async () => {
  const actual = await vi.importActual<typeof import('next-themes')>('next-themes')
  return {
    ...actual,
    useTheme: vi.fn(),
  }
})

describe('ThemeToggle', () => {
  const mockSetTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'light',
      resolvedTheme: 'light',
      forcedTheme: undefined,
    })
  })

  it('renders theme toggle button', async () => {
    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByLabelText('テーマ切り替え')
      expect(button).toBeInTheDocument()
    })
  })

  it('shows sun icon in light mode', async () => {
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'light',
      resolvedTheme: 'light',
      forcedTheme: undefined,
    })

    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByLabelText('テーマ切り替え')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('shows moon icon in dark mode', async () => {
    const { useTheme } = await import('next-themes')
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      themes: ['light', 'dark'],
      systemTheme: 'dark',
      resolvedTheme: 'dark',
      forcedTheme: undefined,
    })

    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      const button = screen.getByLabelText('テーマ切り替え')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('toggles theme when clicked', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('テーマ切り替え')).toBeInTheDocument()
    })

    const button = screen.getByLabelText('テーマ切り替え')
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
