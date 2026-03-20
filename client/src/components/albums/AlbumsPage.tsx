import { useMemo, useState } from 'react'
import { Album } from '@/types'
import { useAlbumsList } from '@/hooks/useAlbums'
import { useUIStore } from '@/store/uiStore'
import { sortAlbums } from '@/utils/sortAlbums'
import { Spinner } from '@/components/ui/Spinner'
import { AlbumToolbar } from './AlbumToolbar'
import { AlbumGridView } from './AlbumGridView'
import { AlbumListView } from './AlbumListView'
import { AlbumFormModal } from '@/components/modals/AlbumFormModal'

export function AlbumsPage() {
  const { data: albums, isLoading, isError } = useAlbumsList()
  const viewMode = useUIStore((s) => s.viewMode)
  const sortField = useUIStore((s) => s.sortField)
  const sortDirection = useUIStore((s) => s.sortDirection)

  const [showModal, setShowModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)

  const sortedAlbums = useMemo(() => {
    if (!albums) return []
    return sortAlbums(albums, sortField, sortDirection)
  }, [albums, sortField, sortDirection])

  function handleAdd() {
    setEditingAlbum(null)
    setShowModal(true)
  }

  function handleEdit(album: Album) {
    setEditingAlbum(album)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditingAlbum(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-gray-500">
        Failed to load albums. Please try again.
      </div>
    )
  }

  return (
    <div>
      <AlbumToolbar onAddAlbum={handleAdd} />

      {sortedAlbums.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          No albums yet. Add one to get started.
        </div>
      ) : viewMode === 'grid' ? (
        <AlbumGridView albums={sortedAlbums} onEdit={handleEdit} />
      ) : (
        <AlbumListView albums={sortedAlbums} onEdit={handleEdit} />
      )}

      <AlbumFormModal
        open={showModal}
        onClose={handleCloseModal}
        album={editingAlbum}
      />
    </div>
  )
}
