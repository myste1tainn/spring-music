import { Album, AlbumInput } from '@/types'
import { apiFetch } from './client'

export function getAlbums(): Promise<Album[]> {
  return apiFetch<Album[]>('/albums')
}

export function getAlbumById(id: string): Promise<Album> {
  return apiFetch<Album>(`/albums/${id}`)
}

export function addAlbum(album: AlbumInput): Promise<Album> {
  return apiFetch<Album>('/albums', {
    method: 'PUT',
    body: JSON.stringify(album),
  })
}

export function updateAlbum(album: Album): Promise<Album> {
  return apiFetch<Album>('/albums', {
    method: 'POST',
    body: JSON.stringify(album),
  })
}

export function deleteAlbum(id: string): Promise<void> {
  return apiFetch<void>(`/albums/${id}`, {
    method: 'DELETE',
  })
}
