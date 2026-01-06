import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { 
  LayoutDashboard, 
  Building2, 
  FolderKanban, 
  Users, 
  Shield,
  FileText, 
  FolderOpen, 
  Bell, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

const menuItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Firmalar', 
    path: '/companies', 
    icon: Building2,
    children: [
      { name: 'Firma Listesi', path: '/companies' },
      { name: 'Yeni Firma', path: '/companies/new' },
    ]
  },
  { 
    name: 'Projeler', 
    path: '/projects', 
    icon: FolderKanban,
    children: [
      { name: 'Proje Listesi', path: '/projects' },
      { name: 'Proje Durumları', path: '/projects/statuses' },
      { name: 'Kategoriler', path: '/projects/categories' },
    ]
  },
  { 
    name: 'Personeller', 
    path: '/personnel', 
    icon: Users,
    children: [
      { name: 'Personel Listesi', path: '/personnel' },
      { name: 'Rol Yönetimi', path: '/personnel/roles' },
    ]
  },
  { 
    name: 'Devriye', 
    path: '/patrol', 
    icon: Shield,
    children: [
      { name: 'Devriye Listesi', path: '/patrol' },
      { name: 'Yeni Devriye', path: '/patrol/new' },
    ]
  },
  { 
    name: 'Raporlar', 
    path: '/reports', 
    icon: FileText 
  },
  { 
    name: 'Belgeler', 
    path: '/documents', 
    icon: FolderOpen 
  },
  { 
    name: 'Bildirimler', 
    path: '/notifications', 
    icon: Bell 
  },
  { 
    name: 'Ayarlar', 
    path: '/settings', 
    icon: Settings 
  },
  { 
    name: 'Destek', 
    path: '/support', 
    icon: HelpCircle 
  },
]

function MenuItem({ item, isOpen, onToggle }) {
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="mb-1">
      <div
        onClick={() => hasChildren && onToggle(item.name)}
        className={`
          flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer
          transition-all duration-200 group
          ${isActive 
            ? 'bg-accent/20 text-accent-light border-l-4 border-accent' 
            : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-100 border-l-4 border-transparent'
          }
        `}
      >
        <NavLink 
          to={hasChildren ? '#' : item.path}
          className="flex items-center gap-3 flex-1"
          onClick={(e) => hasChildren && e.preventDefault()}
        >
          <Icon size={20} className={`transition-colors ${isActive ? 'text-accent' : 'text-dark-500 group-hover:text-dark-300'}`} />
          <span className="font-medium text-sm">{item.name}</span>
        </NavLink>
        {hasChildren && (
          <span className="transition-transform duration-200">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </div>
      
      {/* Submenu */}
      {hasChildren && isOpen && (
        <div className="ml-9 mt-1 space-y-1 animate-fadeIn">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) => `
                block px-4 py-2 rounded-md text-sm transition-all duration-200
                ${isActive 
                  ? 'text-accent-light bg-accent/10' 
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/30'
                }
              `}
            >
              {child.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp()
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-dark-800 text-dark-100 hover:bg-dark-700"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-dark-700
        z-40 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-50">Marmara</h1>
              <p className="text-xs text-dark-400">PMS Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.name}
                item={item}
                isOpen={openMenus[item.name]}
                onToggle={toggleMenu}
              />
            ))}
          </div>

          {/* User Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-700 bg-dark-800">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AY</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-100 truncate">Admin User</p>
                <p className="text-xs text-dark-400 truncate">admin@marmara.com</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
