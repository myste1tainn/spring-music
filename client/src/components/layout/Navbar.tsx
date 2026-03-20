import { AppInfoDropdown } from './AppInfoDropdown'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900">
          Spring Music
        </span>
      </div>
      <AppInfoDropdown />
    </nav>
  )
}
