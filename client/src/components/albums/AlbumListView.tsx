import { Album } from '@/types'
import { AlbumRow } from './AlbumRow'

interface AlbumListViewProps {
  albums: Album[]
  onEdit: (album: Album) => void
}

export function AlbumListView({ albums, onEdit }: AlbumListViewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-4 border-b border-gray-200 px-4 py-2 text-xs font-semibold uppercase text-gray-500">
        <div className="w-1/4">Artist</div>
        <div className="w-1/4">Title</div>
        <div className="w-1/6">Genre</div>
        <div className="w-1/6">Year</div>
        <div className="ml-auto w-8" />
      </div>
      {albums.map((album) => (
        <AlbumRow key={album.id} album={album} onEdit={onEdit} />
      ))}
    </div>
  )
}
