import { useState, useRef, useEffect } from 'react'
import { Album } from '@/types'
import { useDeleteAlbum } from '@/hooks/useAlbums'

interface AlbumActionMenuProps {
  album: Album
  onEdit: (album: Album) => void
}

export function AlbumActionMenu({ album, onEdit }: AlbumActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const deleteAlbum = useDeleteAlbum()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-30">
          <button
            className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              onEdit(album)
              setOpen(false)
            }}
          >
            Edit
          </button>
          {confirming ? (
            <button
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                deleteAlbum.mutate(album.id)
                setOpen(false)
                setConfirming(false)
              }}
            >
              Confirm Delete
            </button>
          ) : (
            <button
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => setConfirming(true)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
