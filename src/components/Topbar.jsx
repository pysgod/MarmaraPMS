import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Building2,
  User,
  Settings,
  LogOut,
  Check
} from 'lucide-react'

export default function Topbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companies, selectedCompany, setCompanyContext, exitCompanyContext, notifications, logout } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const searchRef = useRef(null)
  const companyRef = useRef(null)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false)
      if (companyRef.current && !companyRef.current.contains(event.target)) setShowCompanyDropdown(false)
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false)
      if (userRef.current && !userRef.current.contains(event.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-dark-800/80 backdrop-blur-xl border-b border-dark-700 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1">
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder={t('topbar.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearch(e.target.value.length > 0)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-700/50 border border-dark-600 rounded-lg
                text-dark-100 placeholder-dark-400 text-sm
                focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                transition-all duration-200"
            />
          </div>
          
          {/* Search Results */}
          {showSearch && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-2">
                <p className="text-xs text-dark-400 px-3 py-2">{t('topbar.searchResults')}</p>
                <div className="space-y-1">
                  {companies
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 3)
                    .map(company => (
                      <button
                        key={company.id}
                        onClick={() => {
                          navigate(`/companies/${company.id}`)
                          setSearchQuery('')
                          setShowSearch(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700/50 text-left transition-colors"
                      >
                        <Building2 size={16} className="text-dark-400" />
                        <span className="text-sm text-dark-200">{company.name}</span>
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Company Selector */}
        <div ref={companyRef} className="relative">
          <button
            onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700/50 border border-dark-600
              hover:bg-dark-700 transition-colors text-sm"
          >
            <Building2 size={16} className="text-accent" />
            <span className="text-dark-200 max-w-[120px] truncate">
              {selectedCompany ? selectedCompany.name : t('topbar.selectCompany')}
            </span>
            <ChevronDown size={16} className={`text-dark-400 transition-transform ${showCompanyDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCompanyDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-2">
                <button
                  onClick={() => {
                    exitCompanyContext()
                    setShowCompanyDropdown(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-dark-700/50 transition-colors"
                >
                  <span className="text-sm text-dark-300">{t('topbar.allCompanies')}</span>
                  {!selectedCompany && <Check size={16} className="text-accent" />}
                </button>
                <div className="h-px bg-dark-700 my-2" />
                {companies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => {
                      setCompanyContext(company)
                      setShowCompanyDropdown(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-dark-700/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm text-dark-200 text-left">{company.name}</p>
                      <p className="text-xs text-dark-400">{company.company_code}</p>
                    </div>
                    {selectedCompany?.id === company.id && <Check size={16} className="text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-lg bg-dark-700/50 border border-dark-600 hover:bg-dark-700 transition-colors"
          >
            <Bell size={18} className="text-dark-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs text-white font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-dark-700">
                <h3 className="font-semibold text-dark-100">{t('topbar.notifications')}</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-dark-700/50 hover:bg-dark-700/30 cursor-pointer transition-colors
                      ${!notif.read ? 'bg-accent/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notif.type === 'success' ? 'bg-green-500' :
                        notif.type === 'warning' ? 'bg-amber-500' : 'bg-accent'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark-100">{notif.title}</p>
                        <p className="text-xs text-dark-400 mt-1">{notif.message}</p>
                        <p className="text-xs text-dark-500 mt-2">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  navigate('/notifications')
                  setShowNotifications(false)
                }}
                className="w-full p-3 text-sm text-accent hover:bg-dark-700/30 transition-colors"
              >
                {t('topbar.viewAllNotifications')}
              </button>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg bg-dark-700/50 border border-dark-600 hover:bg-dark-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <ChevronDown size={16} className={`text-dark-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-dark-700">
                <p className="font-medium text-dark-100">Admin User</p>
                <p className="text-sm text-dark-400">admin@marmara.com</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700/50 text-dark-300 hover:text-dark-100 transition-colors">
                  <User size={16} />
                  <span className="text-sm">{t('topbar.profile')}</span>
                </button>
                <button 
                  onClick={() => {
                    navigate('/settings')
                    setShowUserMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700/50 text-dark-300 hover:text-dark-100 transition-colors"
                >
                  <Settings size={16} />
                  <span className="text-sm">{t('sidebar.settings')}</span>
                </button>
                <div className="h-px bg-dark-700 my-2" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm">{t('topbar.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
