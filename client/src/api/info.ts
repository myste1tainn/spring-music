import { AppInfo } from '@/types'
import { apiFetch } from './client'

export function getAppInfo(): Promise<AppInfo> {
  return apiFetch<AppInfo>('/appinfo')
}
