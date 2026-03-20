import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/uiStore'
import { killApp, throwException, fillHeap } from '@/api/errors'

export function ErrorsPage() {
  const addToast = useUIStore((s) => s.addToast)
  const [loadingKill, setLoadingKill] = useState(false)
  const [loadingThrow, setLoadingThrow] = useState(false)
  const [loadingHeap, setLoadingHeap] = useState(false)

  async function handleKill() {
    setLoadingKill(true)
    try {
      await killApp()
      addToast('Kill signal sent', 'success')
    } catch {
      addToast('Application may have been killed', 'error')
    } finally {
      setLoadingKill(false)
    }
  }

  async function handleThrow() {
    setLoadingThrow(true)
    try {
      await throwException()
      addToast('Exception thrown', 'success')
    } catch {
      addToast('Exception was thrown on the server', 'error')
    } finally {
      setLoadingThrow(false)
    }
  }

  async function handleFillHeap() {
    setLoadingHeap(true)
    try {
      await fillHeap()
      addToast('Heap fill initiated', 'success')
    } catch {
      addToast('Heap fill may have crashed the app', 'error')
    } finally {
      setLoadingHeap(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Force Errors
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        These actions will intentionally cause errors on the server. Use with
        caution.
      </p>
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Kill Application
            </h3>
            <p className="text-xs text-gray-500">
              Forces the application to exit immediately
            </p>
          </div>
          <Button variant="danger" onClick={handleKill} disabled={loadingKill}>
            {loadingKill ? 'Killing...' : 'Kill'}
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Throw Exception
            </h3>
            <p className="text-xs text-gray-500">
              Throws a NullPointerException on the server
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleThrow}
            disabled={loadingThrow}
          >
            {loadingThrow ? 'Throwing...' : 'Throw'}
          </Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Fill Heap</h3>
            <p className="text-xs text-gray-500">
              Fills the heap memory to initiate a crash
            </p>
          </div>
          <Button
            variant="danger"
            onClick={handleFillHeap}
            disabled={loadingHeap}
          >
            {loadingHeap ? 'Filling...' : 'Fill Heap'}
          </Button>
        </div>
      </div>
    </div>
  )
}
