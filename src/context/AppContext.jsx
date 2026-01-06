import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

// Mock Data
const mockCompanies = [
  { id: 1, name: 'Marmara Güvenlik A.Ş.', code: 'MRG-001', personnel: 45, projects: 8, status: 'active' },
  { id: 2, name: 'Boğaziçi Koruma Ltd.', code: 'BGK-002', personnel: 32, projects: 5, status: 'active' },
  { id: 3, name: 'Anadolu Güvenlik Hiz.', code: 'AGH-003', personnel: 28, projects: 4, status: 'passive' },
  { id: 4, name: 'İstanbul Security Inc.', code: 'ISI-004', personnel: 56, projects: 12, status: 'active' },
  { id: 5, name: 'Ege Koruma Sistemleri', code: 'EKS-005', personnel: 18, projects: 3, status: 'active' },
]

const mockProjects = [
  { id: 1, name: 'Plaza Güvenlik Projesi', company: 'Marmara Güvenlik A.Ş.', status: 'active', progress: 75, category: 'Bina Güvenliği' },
  { id: 2, name: 'AVM Devriye Sistemi', company: 'Boğaziçi Koruma Ltd.', status: 'active', progress: 45, category: 'Devriye' },
  { id: 3, name: 'Fabrika Koruma', company: 'Anadolu Güvenlik Hiz.', status: 'completed', progress: 100, category: 'Endüstriyel' },
  { id: 4, name: 'Otel Güvenlik Hizmeti', company: 'İstanbul Security Inc.', status: 'active', progress: 60, category: 'Konaklama' },
  { id: 5, name: 'Site Giriş Kontrolü', company: 'Ege Koruma Sistemleri', status: 'pending', progress: 20, category: 'Konut' },
]

const mockPersonnel = [
  { id: 1, name: 'Ahmet Yılmaz', role: 'Güvenlik Şefi', company: 'Marmara Güvenlik A.Ş.', status: 'active', email: 'ahmet@marmara.com' },
  { id: 2, name: 'Mehmet Demir', role: 'Devriye Sorumlusu', company: 'Boğaziçi Koruma Ltd.', status: 'active', email: 'mehmet@bogazici.com' },
  { id: 3, name: 'Ayşe Kaya', role: 'Operasyon Müdürü', company: 'Anadolu Güvenlik Hiz.', status: 'active', email: 'ayse@anadolu.com' },
  { id: 4, name: 'Fatma Özkan', role: 'Güvenlik Personeli', company: 'İstanbul Security Inc.', status: 'passive', email: 'fatma@istanbul.com' },
  { id: 5, name: 'Ali Çelik', role: 'Saha Amiri', company: 'Ege Koruma Sistemleri', status: 'active', email: 'ali@ege.com' },
]

const mockPatrols = [
  { id: 1, name: 'Gece Devriyesi A', assignee: 'Ahmet Yılmaz', company: 'Marmara Güvenlik A.Ş.', location: 'Plaza Katları', time: '22:00 - 06:00', status: 'active' },
  { id: 2, name: 'AVM Tur 1', assignee: 'Mehmet Demir', company: 'Boğaziçi Koruma Ltd.', location: 'Zemin Kat', time: '10:00 - 14:00', status: 'completed' },
  { id: 3, name: 'Fabrika Çevre Kontrolü', assignee: 'Ayşe Kaya', company: 'Anadolu Güvenlik Hiz.', location: 'Dış Alan', time: '08:00 - 16:00', status: 'pending' },
  { id: 4, name: 'Otel Giriş Kontrolü', assignee: 'Ali Çelik', company: 'İstanbul Security Inc.', location: 'Lobi', time: '00:00 - 08:00', status: 'active' },
]

const mockNotifications = [
  { id: 1, title: 'Yeni proje oluşturuldu', message: 'Plaza Güvenlik Projesi başarıyla oluşturuldu.', time: '5 dk önce', read: false, type: 'success' },
  { id: 2, title: 'Devriye tamamlandı', message: 'AVM Tur 1 devriyesi başarıyla tamamlandı.', time: '1 saat önce', read: false, type: 'info' },
  { id: 3, title: 'Personel güncellemesi', message: 'Fatma Özkan pasif duruma alındı.', time: '2 saat önce', read: true, type: 'warning' },
  { id: 4, title: 'Sistem bakımı', message: 'Yarın 02:00-04:00 arası bakım yapılacak.', time: '1 gün önce', read: true, type: 'info' },
]

export function AppProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [companies] = useState(mockCompanies)
  const [projects] = useState(mockProjects)
  const [personnel] = useState(mockPersonnel)
  const [patrols] = useState(mockPatrols)
  const [notifications] = useState(mockNotifications)

  const stats = {
    totalCompanies: companies.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    activePersonnel: personnel.filter(p => p.status === 'active').length,
    activePatrols: patrols.filter(p => p.status === 'active').length,
    completedPatrols: patrols.filter(p => p.status === 'completed').length,
    pendingPatrols: patrols.filter(p => p.status === 'pending').length,
  }

  const value = {
    selectedCompany,
    setSelectedCompany,
    sidebarOpen,
    setSidebarOpen,
    companies,
    projects,
    personnel,
    patrols,
    notifications,
    stats,
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
