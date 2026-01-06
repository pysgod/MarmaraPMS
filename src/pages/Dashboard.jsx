import { useApp } from '../context/AppContext'
import { 
  Building2, 
  FolderKanban, 
  Users, 
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react'

function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  return (
    <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-dark-50 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-3 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="text-sm font-medium">{trendValue}</span>
              <span className="text-dark-400 text-xs ml-1">geçen aya göre</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function ProjectProgressCard({ project }) {
  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-amber-500',
    completed: 'bg-blue-500',
  }

  return (
    <div className="bg-dark-700/50 rounded-xl p-4 hover:bg-dark-700 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-dark-100 text-sm">{project.name}</h4>
        <span className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
      </div>
      <p className="text-xs text-dark-400 mb-3">{project.company}</p>
      <div className="relative h-2 bg-dark-600 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-500"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <p className="text-xs text-dark-400 mt-2 text-right">{project.progress}%</p>
    </div>
  )
}

function PatrolCard({ patrol }) {
  const statusConfig = {
    active: { icon: Clock, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Aktif' },
    pending: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Bekliyor' },
    completed: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Tamamlandı' },
  }
  
  const status = statusConfig[patrol.status]
  const StatusIcon = status.icon

  return (
    <div className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer">
      <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center`}>
        <StatusIcon size={20} className={status.color} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-dark-100 text-sm truncate">{patrol.name}</h4>
        <p className="text-xs text-dark-400 truncate">{patrol.assignee} • {patrol.location}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-dark-300">{patrol.time}</p>
        <p className={`text-xs ${status.color} mt-1`}>{status.label}</p>
      </div>
    </div>
  )
}

function RecentActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-dark-700/30 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
        <span className="text-accent text-xs font-semibold">{activity.user[0]}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-dark-200">
          <span className="font-medium text-dark-100">{activity.user}</span>
          {' '}{activity.action}
        </p>
        <p className="text-xs text-dark-400 mt-1">{activity.time}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { stats, projects, patrols } = useApp()

  const recentActivities = [
    { id: 1, user: 'Ahmet Yılmaz', action: 'Plaza Güvenlik Projesi\'ni güncelledi', time: '5 dk önce' },
    { id: 2, user: 'Mehmet Demir', action: 'AVM Tur 1 devriyesini tamamladı', time: '1 saat önce' },
    { id: 3, user: 'Ayşe Kaya', action: 'yeni personel ekledi', time: '2 saat önce' },
    { id: 4, user: 'Fatma Özkan', action: 'rapor oluşturdu', time: '3 saat önce' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Dashboard</h1>
          <p className="text-dark-400 mt-1">Hoş geldiniz! İşte genel bakış.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white text-sm font-medium transition-colors">
          <ArrowUpRight size={18} />
          Rapor Oluştur
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Firma"
          value={stats.totalCompanies}
          icon={Building2}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <StatCard
          title="Aktif Projeler"
          value={stats.activeProjects}
          icon={FolderKanban}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Aktif Personel"
          value={stats.activePersonnel}
          icon={Users}
          trend="down"
          trendValue="-3%"
          color="purple"
        />
        <StatCard
          title="Aktif Devriyeler"
          value={stats.activePatrols}
          icon={Shield}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <div className="lg:col-span-2 bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-50">Proje İlerlemesi</h2>
            <button className="text-sm text-accent hover:text-accent-light transition-colors">
              Tümünü Gör
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map(project => (
              <ProjectProgressCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-50">Son Aktiviteler</h2>
          </div>
          <div className="space-y-1">
            {recentActivities.map(activity => (
              <RecentActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Patrols Section */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-dark-50">Devriye Durumu</h2>
            <p className="text-sm text-dark-400 mt-1">
              {stats.activePatrols} aktif, {stats.completedPatrols} tamamlanmış, {stats.pendingPatrols} bekliyor
            </p>
          </div>
          <button className="text-sm text-accent hover:text-accent-light transition-colors">
            Tümünü Gör
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patrols.map(patrol => (
            <PatrolCard key={patrol.id} patrol={patrol} />
          ))}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.completedPatrols}</p>
          <p className="text-xs text-dark-400 mt-1">Tamamlanan Devriye</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 text-center">
          <p className="text-2xl font-bold text-amber-400">{stats.pendingPatrols}</p>
          <p className="text-xs text-dark-400 mt-1">Bekleyen Devriye</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 text-center">
          <p className="text-2xl font-bold text-blue-400">24</p>
          <p className="text-xs text-dark-400 mt-1">Bu Hafta Rapor</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700 text-center">
          <p className="text-2xl font-bold text-purple-400">156</p>
          <p className="text-xs text-dark-400 mt-1">Toplam Belge</p>
        </div>
      </div>
    </div>
  )
}
