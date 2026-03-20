import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAlbum, deleteAlbum, getAlbums, updateAlbum } from '@/api/albums'
import { Album, AlbumInput } from '@/types'
import { useUIStore } from '@/store/uiStore'

const ALBUMS_KEY = ['albums'] as const

export function useAlbumsList() {
  return useQuery({
    queryKey: ALBUMS_KEY,
    queryFn: getAlbums,
  })
}

export function useAddAlbum() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: (album: AlbumInput) => addAlbum(album),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_KEY })
      addToast('Album added successfully', 'success')
    },
    onError: () => {
      addToast('Failed to add album', 'error')
    },
  })
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: (album: Album) => updateAlbum(album),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_KEY })
      addToast('Album updated successfully', 'success')
    },
    onError: () => {
      addToast('Failed to update album', 'error')
    },
  })
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  return useMutation({
    mutationFn: (id: string) => deleteAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALBUMS_KEY })
      addToast('Album deleted successfully', 'success')
    },
    onError: () => {
      addToast('Failed to delete album', 'error')
    },
  })
}
