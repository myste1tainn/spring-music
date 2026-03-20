import { useQuery } from '@tanstack/react-query'
import { getAppInfo } from '@/api/info'

export function useAppInfo() {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: getAppInfo,
  })
}
