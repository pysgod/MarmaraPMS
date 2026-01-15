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
  LogOut,
  Clock,
  History
} from 'lucide-react'

function CompanyContextBanner() {
  const navigate = useNavigate()
  const { selectedCompany, exitCompanyContext } = useApp()
  
  if (!selectedCompany) return null
  
  return (
    <div className="mx-4 mb-4 p-3 rounded-xl bg-accent/20 border border-accent/30 ">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Building2 size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-accent-light truncate">{selectedCompany.name}</p>
          <p className="text-xs text-theme-text-muted">{selectedCompany.company_code}</p>
        </div>
      </div>
      <button
        onClick={() => {
          exitCompanyContext()
          navigate('/companies')
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-theme-bg-tertiary hover:bg-red-900 text-theme-text-muted hover:text-theme-text-primary text-xs transition-colors"
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
              : 'text-theme-text-muted hover:bg-theme-bg-hover hover:text-theme-text-primary'
          }
        `}
      >
        <NavLink 
          to={hasChildren ? '#' : item.path}
          className="flex items-center gap-3 flex-1"
          onClick={(e) => hasChildren && e.preventDefault()}
        >
          <Icon size={20} className={`transition-colors ${isActive ? 'text-accent' : 'text-theme-text-placeholder group-hover:text-theme-text-tertiary'}`} />
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
                  : 'text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg-hover'
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
      key: 'shifts',
      name: 'Vardiyalar', 
      path: '/shifts', 
      icon: Clock 
    },
    { 
      key: 'patrol',
      name: t('sidebar.patrol'), 
      path: '/patrol', 
      icon: Shield,
      requiresCompany: true
    },
    { 
      key: 'documents',
      name: t('sidebar.documents'), 
      path: '/documents', 
      icon: FolderOpen 
    },
    { 
      key: 'reports',
      name: t('sidebar.reports'), 
      path: '/reports', 
      icon: FileText 
    },
    { 
      key: 'archive',
      name: 'Arşiv', 
      path: '/archive', 
      icon: History
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
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary"
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
        fixed left-0 top-0 h-full w-64 bg-theme-bg-secondary border-r border-theme-border-primary
        z-40 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-theme-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-theme-text-primary">Marmara</h1>
              <p className="text-xs text-theme-text-muted">PMS Admin</p>
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
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-theme-border-primary bg-theme-bg-secondary">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-theme-bg-tertiary/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AY</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-theme-text-primary truncate">Admin User</p>
                <p className="text-xs text-theme-text-muted truncate">admin@marmara.com</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}
