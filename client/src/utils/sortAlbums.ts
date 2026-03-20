import { Album } from '@/types'
import { SortDirection, SortField } from '@/store/uiStore'

export function sortAlbums(
  albums: Album[],
  field: SortField,
  direction: SortDirection,
): Album[] {
  return [...albums].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    let comparison: number
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal
    } else {
      comparison = String(aVal).localeCompare(String(bVal))
    }

    return direction === 'asc' ? comparison : -comparison
  })
}
