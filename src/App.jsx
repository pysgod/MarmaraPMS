import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider, useApp } from './context/AppContext'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CompanyList from './pages/companies/CompanyList'
import CompanyDetail from './pages/companies/CompanyDetail'
import ProjectList from './pages/projects/ProjectList'
import ProjectDetail from './pages/projects/ProjectDetail'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeDetail from './pages/employees/EmployeeDetail'
import PatrolList from './pages/patrol/PatrolList'
import PatrolDetail from './pages/patrol/PatrolDetail'
import Shifts from './pages/Shifts'
import Archive from './pages/Archive'
import Reports from './pages/Reports'
import Documents from './pages/Documents'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Support from './pages/Support'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <MainLayout>{children}</MainLayout>
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Firmalar */}
            <Route path="/companies" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
            <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
            
            {/* Projeler */}
            <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            
            {/* Çalışanlar (was Personeller) */}
            <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
            
            {/* Devriye */}
            <Route path="/patrol" element={<ProtectedRoute><PatrolList /></ProtectedRoute>} />
            <Route path="/patrol/:id" element={<ProtectedRoute><PatrolDetail /></ProtectedRoute>} />

            <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
            
            <Route path="/shifts" element={<ProtectedRoute><Shifts /></ProtectedRoute>} />

            {/* Diğer */}
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
