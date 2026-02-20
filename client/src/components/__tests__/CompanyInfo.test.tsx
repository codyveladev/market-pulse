import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompanyInfo } from '../CompanyInfo'
import type { CompanyProfile } from '../../../../shared/types'

const profile: CompanyProfile = {
  name: 'Apple Inc',
  logo: 'https://logo.clearbit.com/apple.com',
  industry: 'Technology',
  country: 'US',
  weburl: 'https://apple.com',
  marketCapitalization: 2870000,
}

describe('CompanyInfo', () => {
  it('renders company logo when provided', () => {
    render(<CompanyInfo profile={profile} />)
    const img = screen.getByAltText(/apple inc logo/i)
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://logo.clearbit.com/apple.com')
  })

  it('renders industry badge', () => {
    render(<CompanyInfo profile={profile} />)
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('renders country', () => {
    render(<CompanyInfo profile={profile} />)
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('renders clickable website link', () => {
    render(<CompanyInfo profile={profile} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://apple.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders placeholder when profile is null', () => {
    render(<CompanyInfo profile={null} />)
    expect(screen.getByText(/company information unavailable/i)).toBeInTheDocument()
  })
})
