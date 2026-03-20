import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
