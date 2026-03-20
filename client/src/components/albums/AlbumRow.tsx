import { Album } from '@/types'
import { InlineEditField } from '@/components/inline-edit/InlineEditField'
import { AlbumActionMenu } from './AlbumActionMenu'
import { useUpdateAlbum } from '@/hooks/useAlbums'

interface AlbumRowProps {
  album: Album
  onEdit: (album: Album) => void
}

export function AlbumRow({ album, onEdit }: AlbumRowProps) {
  const updateAlbum = useUpdateAlbum()

  function handleFieldSave(field: keyof Album, value: string) {
    updateAlbum.mutate({ ...album, [field]: field === 'trackCount' ? Number(value) : value })
  }

  return (
    <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition">
      <div className="w-1/4 min-w-0">
        <InlineEditField
          albumId={album.id}
          fieldName="artist"
          value={album.artist}
          onSave={(v) => handleFieldSave('artist', v)}
        />
      </div>
      <div className="w-1/4 min-w-0">
        <InlineEditField
          albumId={album.id}
          fieldName="title"
          value={album.title}
          onSave={(v) => handleFieldSave('title', v)}
        />
      </div>
      <div className="w-1/6 min-w-0">
        <InlineEditField
          albumId={album.id}
          fieldName="genre"
          value={album.genre}
          onSave={(v) => handleFieldSave('genre', v)}
        />
      </div>
      <div className="w-1/6 min-w-0">
        <InlineEditField
          albumId={album.id}
          fieldName="releaseYear"
          value={album.releaseYear}
          onSave={(v) => handleFieldSave('releaseYear', v)}
        />
      </div>
      <div className="ml-auto">
        <AlbumActionMenu album={album} onEdit={onEdit} />
      </div>
    </div>
  )
}
