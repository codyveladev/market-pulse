import { describe, it, expect, beforeEach } from 'vitest'
import { useSourceStore } from '../sourceStore'

describe('sourceStore', () => {
  beforeEach(() => {
    useSourceStore.setState({ selectedSources: [] })
  })

  it('starts with no sources selected', () => {
    expect(useSourceStore.getState().selectedSources).toEqual([])
  })

  it('toggleSource adds a source', () => {
    useSourceStore.getState().toggleSource('Reuters')
    expect(useSourceStore.getState().selectedSources).toContain('Reuters')
  })

  it('toggleSource removes an already-selected source', () => {
    useSourceStore.setState({ selectedSources: ['Reuters'] })
    useSourceStore.getState().toggleSource('Reuters')
    expect(useSourceStore.getState().selectedSources).not.toContain('Reuters')
  })

  it('selectAll sets all provided sources', () => {
    useSourceStore.getState().selectAll(['Reuters', 'Bloomberg', 'AP News'])
    expect(useSourceStore.getState().selectedSources).toEqual(['Reuters', 'Bloomberg', 'AP News'])
  })

  it('clearAll removes all selected sources', () => {
    useSourceStore.setState({ selectedSources: ['Reuters', 'Bloomberg'] })
    useSourceStore.getState().clearAll()
    expect(useSourceStore.getState().selectedSources).toEqual([])
  })

  it('isSourceSelected returns true for selected source', () => {
    useSourceStore.setState({ selectedSources: ['Reuters'] })
    expect(useSourceStore.getState().isSourceSelected('Reuters')).toBe(true)
  })

  it('isSourceSelected returns false for unselected source', () => {
    useSourceStore.setState({ selectedSources: ['Reuters'] })
    expect(useSourceStore.getState().isSourceSelected('Bloomberg')).toBe(false)
  })
})
