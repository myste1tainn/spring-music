export interface Album {
  id: string
  title: string
  artist: string
  releaseYear: string
  genre: string
  trackCount: number
  albumId: string
}

export type AlbumInput = Omit<Album, 'id'>

export interface AppInfo {
  profiles: string[]
  services: string[]
}
