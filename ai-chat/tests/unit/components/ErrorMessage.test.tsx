import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Test error message" />)
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('has proper accessibility role', () => {
    render(<ErrorMessage message="Test error" />)
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Error" onRetry={onRetry} />)

    const retryButton = screen.getByText('再試行')
    expect(retryButton).toBeInTheDocument()
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Error" />)

    expect(screen.queryByText('再試行')).not.toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorMessage message="Error" onRetry={onRetry} />)

    const retryButton = screen.getByText('再試行')
    await user.click(retryButton)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    const { container } = render(<ErrorMessage message="Error" className="custom-class" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('custom-class')
  })
})
