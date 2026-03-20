import { Album } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { AlbumActionMenu } from './AlbumActionMenu'

interface AlbumCardProps {
  album: Album
  onEdit: (album: Album) => void
}

export function AlbumCard({ album, onEdit }: AlbumCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-32 items-center justify-center rounded-t-xl bg-gradient-to-br from-indigo-50 to-purple-50">
        <svg
          className="h-12 w-12 text-indigo-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {album.title}
            </h3>
            <p className="truncate text-sm text-gray-500">{album.artist}</p>
          </div>
          <AlbumActionMenu album={album} onEdit={onEdit} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge>{album.genre}</Badge>
          <Badge className="bg-gray-100 text-gray-600">{album.releaseYear}</Badge>
        </div>
      </div>
    </div>
  )
}
