import { z } from 'zod'

export const albumSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  releaseYear: z.string().min(1, 'Release year is required'),
  genre: z.string().min(1, 'Genre is required'),
  trackCount: z.coerce.number().int().min(1, 'Track count must be at least 1'),
  albumId: z.string().optional().default(''),
})

export type AlbumFormData = z.infer<typeof albumSchema>
