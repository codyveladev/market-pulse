import { describe, it, expect, beforeEach } from 'vitest'
import { useNavigationStore } from './navigationStore'

const getState = () => useNavigationStore.getState()

describe('navigationStore', () => {
  beforeEach(() => {
    getState().setActiveTab('news')
  })

  it('defaults to news tab', () => {
    expect(getState().activeTab).toBe('news')
  })

  it('switches to markets tab', () => {
    getState().setActiveTab('markets')
    expect(getState().activeTab).toBe('markets')
  })

  it('switches back to news tab', () => {
    getState().setActiveTab('markets')
    getState().setActiveTab('news')
    expect(getState().activeTab).toBe('news')
  })
})
