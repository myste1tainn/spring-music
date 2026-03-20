import { Toast as ToastType } from '@/store/uiStore'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const stripeColor =
    toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className="flex items-stretch overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
      <div className={`w-1 shrink-0 ${stripeColor}`} />
      <div className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-gray-700">{toast.message}</p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
