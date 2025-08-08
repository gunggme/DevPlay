import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders DevPlay heading', () => {
    render(<App />)
    expect(screen.getByText('DevPlay')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText(/Welcome to DevPlay/i)).toBeInTheDocument()
  })
})