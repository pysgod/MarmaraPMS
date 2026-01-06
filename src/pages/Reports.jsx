import { useState } from 'react'
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

const reportTypes = [
  { id: 'company', name: 'Firma Raporları', icon: Building2, color: 'blue', count: 12 },
  { id: 'project', name: 'Proje Raporları', icon: FolderKanban, color: 'green', count: 8 },
  { id: 'personnel', name: 'Personel Raporları', icon: Users, color: 'purple', count: 15 },
  { id: 'financial', name: 'Finansal Raporlar', icon: DollarSign, color: 'amber', count: 6 },
]

const recentReports = [
  { id: 1, name: 'Aylık Firma Performansı', type: 'Firma', date: '01.01.2024', status: 'ready' },
  { id: 2, name: 'Proje İlerleme Özeti', type: 'Proje', date: '28.12.2023', status: 'ready' },
  { id: 3, name: 'Personel Çalışma Saatleri', type: 'Personel', date: '25.12.2023', status: 'processing' },
  { id: 4, name: 'Q4 Finansal Analiz', type: 'Finansal', date: '20.12.2023', status: 'ready' },
]

export default function Reports() {
  const [selectedType, setSelectedType] = useState('all')

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Raporlar</h1>
          <p className="text-dark-400 mt-1">Tüm raporları görüntüleyin ve oluşturun</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <FileText size={18} />
          Yeni Rapor Oluştur
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map(type => {
          const Icon = type.icon
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
              className={`bg-gradient-to-br ${colorClasses[type.color]} border rounded-2xl p-6 text-left card-hover ${
                selectedType === type.id ? 'ring-2 ring-accent' : ''
              }`}
            >
              <Icon size={32} className={iconColors[type.color]} />
              <h3 className="text-lg font-semibold text-dark-100 mt-4">{type.name}</h3>
              <p className="text-sm text-dark-400 mt-1">{type.count} rapor</p>
            </button>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Bu Ay Oluşturulan</p>
              <p className="text-3xl font-bold text-dark-50 mt-2">24</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 size={24} className="text-accent" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-green-400">
            <TrendingUp size={14} />
            <span className="text-sm">+12% geçen aya göre</span>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Kaydedilmiş Şablonlar</p>
              <p className="text-3xl font-bold text-dark-50 mt-2">8</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileText size={24} className="text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Zamanlanmış Raporlar</p>
              <p className="text-3xl font-bold text-dark-50 mt-2">5</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Calendar size={24} className="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark-100">Son Raporlar</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-dark-300 text-sm transition-colors">
              <Filter size={16} />
              Filtrele
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700 bg-dark-700/50">
              <th className="text-left py-4 px-6 text-sm font-medium text-dark-300">Rapor Adı</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark-300">Tür</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark-300">Tarih</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-dark-300">Durum</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-dark-300">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map(report => (
              <tr key={report.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <FileText size={18} className="text-accent" />
                    </div>
                    <span className="font-medium text-dark-100">{report.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-dark-300">{report.type}</td>
                <td className="py-4 px-6 text-dark-300">{report.date}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'ready' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {report.status === 'ready' ? 'Hazır' : 'İşleniyor'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-2 hover:bg-dark-600 rounded-lg transition-colors" disabled={report.status !== 'ready'}>
                    <Download size={18} className={report.status === 'ready' ? 'text-accent' : 'text-dark-500'} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
