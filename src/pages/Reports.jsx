import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Building2,
  FolderKanban,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowUpRight
} from 'lucide-react'

// Icon mapping helper
const getIcon = (iconName) => {
  const icons = {
    Building2,
    FolderKanban,
    Users,
    DollarSign,
    FileText // default
  }
  return icons[iconName] || FileText
}

export default function Reports() {
  const [selectedType, setSelectedType] = useState('all')
  const [reportTypes, setReportTypes] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch report types from data-view (or similar) and reports
        const [viewRes, reportsRes] = await Promise.all([
          fetch('http://localhost:3001/api/data-view'),
          fetch('http://localhost:3001/api/reports')
        ])
        
        const viewData = await viewRes.json()
        const reportsData = await reportsRes.json()

        // Process Report Types
        // Calculate counts
        const typesWithCounts = viewData.reportTypes.map(type => {
          const count = reportsData.filter(r => r.type_id === type.id).length
          return {
            ...type,
            icon: getIcon(type.icon), // Map string to component
            count
          }
        })
        setReportTypes(typesWithCounts)

        // Process Reports
        setReports(reportsData.map(r => ({
          id: r.id,
          name: r.name,
          type: r.reportType ? r.reportType.name : 'Genel',
          date: r.date,
          status: r.status,
          file_url: r.file_url
        })))

        setLoading(false)
      } catch (error) {
        console.error('Error loading reports:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-theme-text-tertiary">Yükleniyor...</div>
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Raporlar</h1>
          <p className="text-theme-text-muted mt-1">Tüm raporları görüntüleyin ve oluşturun</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <FileText size={18} />
          Yeni Rapor Oluştur
        </button>
      </div>

      {/* Report Types */}
      {reportTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map(type => {
            const Icon = type.icon || FileText
            const colorClasses = {
              blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
              green: 'from-green-500/20 to-green-500/5 border-green-500/20',
              purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
              amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
            }
            const iconColors = {
              blue: 'text-blue-400',
              green: 'text-green-400',
              purple: 'text-purple-400',
              amber: 'text-amber-400',
            }
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`bg-gradient-to-br ${colorClasses[type.color] || colorClasses.blue} border rounded-2xl p-6 text-left card-hover ${
                  selectedType === type.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <Icon size={32} className={iconColors[type.color] || iconColors.blue} />
                <h3 className="text-lg font-semibold text-theme-text-primary mt-4">{type.name}</h3>
                <p className="text-sm text-theme-text-muted mt-1">{type.count} rapor</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Quick Stats - Dynamic from reports length */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-theme-text-muted text-sm">Toplam Rapor</p>
              <p className="text-3xl font-bold text-theme-text-primary mt-2">{reports.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 size={24} className="text-accent" />
            </div>
          </div>
        </div>
        {/* Placeholder stats or derived */}
        <div className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-theme-text-muted text-sm">Hazır Raporlar</p>
              <p className="text-3xl font-bold text-theme-text-primary mt-2">
                {reports.filter(r => r.status === 'ready').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={24} className="text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-theme-text-muted text-sm">İşleniyor</p>
              <p className="text-3xl font-bold text-theme-text-primary mt-2">
                {reports.filter(r => r.status === 'processing').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Calendar size={24} className="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-theme-bg-secondary rounded-2xl border border-theme-border-primary overflow-hidden">
        <div className="p-6 border-b border-theme-border-primary">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-theme-text-primary">Son Raporlar</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-elevated rounded-lg text-theme-text-tertiary text-sm transition-colors">
              <Filter size={16} />
              Filtrele
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme-border-primary bg-theme-bg-hover">
              <th className="text-left py-4 px-6 text-sm font-medium text-theme-text-tertiary">Rapor Adı</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-theme-text-tertiary">Tür</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-theme-text-tertiary">Tarih</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-theme-text-tertiary">Durum</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-theme-text-tertiary">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-theme-text-muted">
                  Henüz hiç rapor bulunmuyor.
                </td>
              </tr>
            ) : (
              reports.map(report => (
                <tr key={report.id} className="border-b border-theme-border-primary/50 hover:bg-theme-bg-tertiary/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText size={18} className="text-accent" />
                      </div>
                      <span className="font-medium text-theme-text-primary">{report.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-theme-text-tertiary">{report.type}</td>
                  <td className="py-4 px-6 text-theme-text-tertiary">{report.date}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'ready' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {report.status === 'ready' ? 'Hazır' : 
                       report.status === 'processing' ? 'İşleniyor' : 'Başarısız'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 hover:bg-theme-bg-elevated rounded-lg transition-colors" disabled={report.status !== 'ready'}>
                      <Download size={18} className={report.status === 'ready' ? 'text-accent' : 'text-theme-text-placeholder'} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
