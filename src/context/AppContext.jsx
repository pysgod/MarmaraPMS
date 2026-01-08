import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AppContext = createContext()

// Company context persistence key
const COMPANY_CONTEXT_KEY = 'selectedCompanyContext'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Company context - persisted in localStorage
  const [selectedCompany, setSelectedCompanyState] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Data stores
  const [companies, setCompanies] = useState([])
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const [patrols, setPatrols] = useState([])
  const [notifications, setNotifications] = useState([])
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeProjects: 0,
    activeEmployees: 0,
    activePatrols: 0,
    completedPatrols: 0,
    pendingPatrols: 0,
  })

  // Restore company context from localStorage on mount
  useEffect(() => {
    const savedContext = localStorage.getItem(COMPANY_CONTEXT_KEY)
    if (savedContext) {
      try {
        const parsed = JSON.parse(savedContext)
        setSelectedCompanyState(parsed)
      } catch (e) {
        localStorage.removeItem(COMPANY_CONTEXT_KEY)
      }
    }
  }, [])

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const { user } = await api.getCurrentUser()
          setUser(user)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Auth check failed:', error)
          api.logout()
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
    }
  }, [isAuthenticated])

  // Refetch filtered data when company context changes
  useEffect(() => {
    if (isAuthenticated && selectedCompany) {
      fetchCompanyData(selectedCompany.id)
    }
  }, [isAuthenticated, selectedCompany?.id])

  const fetchAllData = async () => {
    try {
      const [companiesData, notificationsData, statsData] = await Promise.all([
        api.getCompanies(),
        api.getNotifications().catch(() => []),
        api.getStats(),
      ])
      
      setCompanies(companiesData)
      setNotifications(notificationsData)
      setStats(statsData)
    } catch (error) {
      console.error('Fetch data error:', error)
    }
  }

  const fetchCompanyData = async (companyId) => {
    try {
      const [employeesData, projectsData, patrolsData] = await Promise.all([
        api.getEmployees(companyId),
        api.getProjects(companyId),
        api.getPatrols(companyId),
      ])
      
      setEmployees(employeesData)
      setProjects(projectsData)
      setPatrols(patrolsData)
    } catch (error) {
      console.error('Fetch company data error:', error)
    }
  }

  // Company context functions
  const setCompanyContext = (company) => {
    setSelectedCompanyState(company)
    localStorage.setItem(COMPANY_CONTEXT_KEY, JSON.stringify(company))
  }

  const exitCompanyContext = () => {
    setSelectedCompanyState(null)
    localStorage.removeItem(COMPANY_CONTEXT_KEY)
    setEmployees([])
    setProjects([])
    setPatrols([])
  }

  const login = async (email, password) => {
    const { user, token } = await api.login(email, password)
    setUser(user)
    setIsAuthenticated(true)
    return { user, token }
  }

  const logout = () => {
    api.logout()
    setUser(null)
    setIsAuthenticated(false)
    setCompanies([])
    setEmployees([])
    setProjects([])
    setPatrols([])
    setNotifications([])
    exitCompanyContext()
  }

  // Company operations
  const addCompany = async (companyData) => {
    const newCompany = await api.createCompany(companyData)
    setCompanies(prev => [newCompany, ...prev])
    return newCompany
  }

  const updateCompany = async (id, companyData) => {
    const updated = await api.updateCompany(id, companyData)
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c))
    if (selectedCompany?.id === id) {
      setCompanyContext({ ...selectedCompany, ...updated })
    }
    return updated
  }

  const deleteCompany = async (id) => {
    await api.deleteCompany(id)
    setCompanies(prev => prev.filter(c => c.id !== id))
    if (selectedCompany?.id === id) {
      exitCompanyContext()
    }
  }

  // Employee operations
  const addEmployee = async (employeeData) => {
    const newEmployee = await api.createEmployee(employeeData)
    setEmployees(prev => [newEmployee, ...prev])
    return newEmployee
  }

  const updateEmployee = async (id, employeeData) => {
    const updated = await api.updateEmployee(id, employeeData)
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e))
    return updated
  }

  const deleteEmployee = async (id) => {
    await api.deleteEmployee(id)
    setEmployees(prev => prev.filter(e => e.id !== id))
  }

  // Project operations
  const addProject = async (projectData) => {
    const newProject = await api.createProject(projectData)
    setProjects(prev => [newProject, ...prev])
    return newProject
  }

  const updateProject = async (id, projectData) => {
    const updated = await api.updateProject(id, projectData)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    return updated
  }

  const deleteProject = async (id) => {
    await api.deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  // Patrol operations
  const addPatrol = async (patrolData) => {
    const newPatrol = await api.createPatrol(patrolData)
    setPatrols(prev => [newPatrol, ...prev])
    return newPatrol
  }

  const updatePatrol = async (id, patrolData) => {
    const updated = await api.updatePatrol(id, patrolData)
    setPatrols(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
    return updated
  }

  const deletePatrol = async (id) => {
    await api.deletePatrol(id)
    setPatrols(prev => prev.filter(p => p.id !== id))
  }

  // Notification operations
  const markNotificationRead = async (id) => {
    await api.markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllNotificationsRead = async () => {
    await api.markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const value = {
    // Auth
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    
    // Company Context
    selectedCompany,
    setCompanyContext,
    exitCompanyContext,
    hasCompanyContext: !!selectedCompany,
    
    // UI State
    sidebarOpen,
    setSidebarOpen,
    
    // Data
    companies,
    employees,
    projects,
    patrols,
    notifications,
    stats,
    
    // Data refresh
    fetchAllData,
    fetchCompanyData,
    
    // Operations
    addCompany,
    updateCompany,
    deleteCompany,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addProject,
    updateProject,
    deleteProject,
    addPatrol,
    updatePatrol,
    deletePatrol,
    markNotificationRead,
    markAllNotificationsRead,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
