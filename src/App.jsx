import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import CompanyList from './pages/companies/CompanyList'
import CompanyDetail from './pages/companies/CompanyDetail'
import ProjectList from './pages/projects/ProjectList'
import ProjectDetail from './pages/projects/ProjectDetail'
import PersonnelList from './pages/personnel/PersonnelList'
import PersonnelDetail from './pages/personnel/PersonnelDetail'
import PatrolList from './pages/patrol/PatrolList'
import PatrolDetail from './pages/patrol/PatrolDetail'
import Reports from './pages/Reports'
import Documents from './pages/Documents'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Support from './pages/Support'

function App() {
  return (
    <AppProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Firmalar */}
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            
            {/* Projeler */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            
            {/* Personeller */}
            <Route path="/personnel" element={<PersonnelList />} />
            <Route path="/personnel/:id" element={<PersonnelDetail />} />
            
            {/* Devriye */}
            <Route path="/patrol" element={<PatrolList />} />
            <Route path="/patrol/:id" element={<PatrolDetail />} />
            
            {/* Diğer */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </MainLayout>
      </Router>
    </AppProvider>
  )
}

export default App
