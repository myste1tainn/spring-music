import { apiFetch } from './client'

export function killApp(): Promise<void> {
  return apiFetch<void>('/errors/kill')
}

export function throwException(): Promise<void> {
  return apiFetch<void>('/errors/throw')
}

export function fillHeap(): Promise<void> {
  return apiFetch<void>('/errors/fill-heap')
}
