import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  X,
  LogOut
} from 'lucide-react'

function CompanyContextBanner() {
  const navigate = useNavigate()
  const { selectedCompany, exitCompanyContext } = useApp()
  
  if (!selectedCompany) return null
  
  return (
    <div className="mx-4 mb-4 p-3 rounded-xl bg-accent/20 border border-accent/30">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Building2 size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-accent-light truncate">{selectedCompany.name}</p>
          <p className="text-xs text-dark-400">{selectedCompany.company_code}</p>
        </div>
      </div>
      <button
        onClick={() => {
          exitCompanyContext()
          navigate('/companies')
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-dark-100 text-xs transition-colors"
      >
        <LogOut size={12} />
        Firmadan Çık
      </button>
    </div>
  )
}

function MenuItem({ item, isOpen, onToggle }) {
  const location = useLocation()
  const Icon = item.icon
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="mb-1">
      <div
        onClick={() => hasChildren && onToggle(item.key)}
        className={`
          flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer
          transition-all duration-200 group
          ${isActive && !hasChildren
            ? 'bg-accent/20 text-accent-light border-l-4 border-accent' 
            : isActive && hasChildren
              ? 'bg-accent/20 text-accent-light'
              : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-100'
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
              end
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
  const { t } = useTranslation()
  const { sidebarOpen, setSidebarOpen, selectedCompany } = useApp()
  const [openMenus, setOpenMenus] = useState({})

  const menuItems = [
    { 
      key: 'dashboard',
      name: t('sidebar.dashboard'), 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      key: 'companies',
      name: t('sidebar.companies'), 
      path: '/companies', 
      icon: Building2
    },
    { 
      key: 'projects',
      name: t('sidebar.projects'), 
      path: '/projects', 
      icon: FolderKanban,
      requiresCompany: true
    },
    { 
      key: 'employees',
      name: 'Çalışanlar', 
      path: '/employees', 
      icon: Users,
      requiresCompany: true
    },
    { 
      key: 'patrol',
      name: t('sidebar.patrol'), 
      path: '/patrol', 
      icon: Shield,
      requiresCompany: true
    },
    { 
      key: 'reports',
      name: t('sidebar.reports'), 
      path: '/reports', 
      icon: FileText 
    },
    { 
      key: 'documents',
      name: t('sidebar.documents'), 
      path: '/documents', 
      icon: FolderOpen 
    },
    { 
      key: 'notifications',
      name: t('sidebar.notifications'), 
      path: '/notifications', 
      icon: Bell 
    },
    { 
      key: 'settings',
      name: t('sidebar.settings'), 
      path: '/settings', 
      icon: Settings 
    },
    { 
      key: 'support',
      name: t('sidebar.support'), 
      path: '/support', 
      icon: HelpCircle 
    },
  ]

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }))
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
          {/* Company Context Banner */}
          <CompanyContextBanner />
          
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                isOpen={openMenus[item.key]}
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
