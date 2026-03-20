import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from './Modal'
import { Button } from '@/components/ui/Button'
import { useAddAlbum, useUpdateAlbum } from '@/hooks/useAlbums'
import { albumSchema, AlbumFormData } from '@/utils/validation'
import { Album } from '@/types'

interface AlbumFormModalProps {
  open: boolean
  onClose: () => void
  album?: Album | null
}

export function AlbumFormModal({ open, onClose, album }: AlbumFormModalProps) {
  const isEdit = !!album
  const addAlbum = useAddAlbum()
  const updateAlbum = useUpdateAlbum()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlbumFormData>({
    resolver: zodResolver(albumSchema),
  })

  useEffect(() => {
    if (open) {
      reset(
        album
          ? {
              title: album.title,
              artist: album.artist,
              releaseYear: album.releaseYear,
              genre: album.genre,
              trackCount: album.trackCount,
              albumId: album.albumId,
            }
          : {
              title: '',
              artist: '',
              releaseYear: '',
              genre: '',
              trackCount: 1,
              albumId: '',
            },
      )
    }
  }, [open, album, reset])

  const isPending = addAlbum.isPending || updateAlbum.isPending

  function onSubmit(data: AlbumFormData) {
    if (isEdit && album) {
      updateAlbum.mutate(
        { ...data, id: album.id },
        { onSuccess: onClose },
      )
    } else {
      addAlbum.mutate(data, { onSuccess: onClose })
    }
  }

  const fieldClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
  const errorClass = 'mt-1 text-xs text-red-600'

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Album' : 'Add Album'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input {...register('title')} className={fieldClass} />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Artist
          </label>
          <input {...register('artist')} className={fieldClass} />
          {errors.artist && (
            <p className={errorClass}>{errors.artist.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Year
            </label>
            <input {...register('releaseYear')} className={fieldClass} />
            {errors.releaseYear && (
              <p className={errorClass}>{errors.releaseYear.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Track Count
            </label>
            <input
              type="number"
              {...register('trackCount')}
              className={fieldClass}
            />
            {errors.trackCount && (
              <p className={errorClass}>{errors.trackCount.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Genre
          </label>
          <input {...register('genre')} className={fieldClass} />
          {errors.genre && (
            <p className={errorClass}>{errors.genre.message}</p>
          )}
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Album ID
            </label>
            <input
              {...register('albumId')}
              className={`${fieldClass} bg-gray-50 text-gray-500`}
              readOnly
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
