import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ToastContainer } from '@/components/ui/ToastContainer'

export function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}
