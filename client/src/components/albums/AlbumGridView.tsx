import { Album } from '@/types'
import { AlbumCard } from './AlbumCard'

interface AlbumGridViewProps {
  albums: Album[]
  onEdit: (album: Album) => void
}

export function AlbumGridView({ albums, onEdit }: AlbumGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} onEdit={onEdit} />
      ))}
    </div>
  )
}
