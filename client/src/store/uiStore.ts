import { create } from 'zustand'

export type ViewMode = 'list' | 'grid'
export type SortField = 'title' | 'artist' | 'releaseYear' | 'genre' | 'trackCount'
export type SortDirection = 'asc' | 'desc'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

interface UIState {
  viewMode: ViewMode
  sortField: SortField
  sortDirection: SortDirection
  toasts: Toast[]
  setViewMode: (mode: ViewMode) => void
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  toggleSortDirection: () => void
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'list',
  sortField: 'title',
  sortDirection: 'asc',
  toasts: [],
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortField: (field) => set({ sortField: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
    })),
  addToast: (message, type) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
