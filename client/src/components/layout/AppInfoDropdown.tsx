import { useState, useRef, useEffect } from 'react'
import { useAppInfo } from '@/hooks/useAppInfo'
import { Button } from '@/components/ui/Button'

export function AppInfoDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data } = useAppInfo()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" onClick={() => setOpen(!open)}>
        Info
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg z-30">
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Profiles
            </h3>
            {data?.profiles.length ? (
              <div className="flex flex-wrap gap-1">
                {data.profiles.map((p) => (
                  <span
                    key={p}
                    className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">None</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Services
            </h3>
            {data?.services.length ? (
              <div className="flex flex-wrap gap-1">
                {data.services.map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">None</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
