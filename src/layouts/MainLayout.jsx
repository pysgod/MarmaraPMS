import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
