import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
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

function StatCard({ title, value, icon: Icon, trend, trendValue, color, comparedText }) {
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
              <span className="text-dark-400 text-xs ml-1">{comparedText}</span>
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

function ProjectCard({ project, onClick }) {
  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-amber-500',
    completed: 'bg-blue-500',
    cancelled: 'bg-red-500'
  }

  // Calculate random progress for demo purposes since we don't have it in DB yet
  const progress = project.status === 'completed' ? 100 : 
                  project.status === 'pending' ? 0 : 
                  Math.floor(Math.random() * 60) + 20

  return (
    <div 
      onClick={onClick}
      className="bg-dark-700/50 rounded-xl p-4 hover:bg-dark-700 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-dark-100 text-sm truncate pr-2">{project.name}</h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-dark-400">{project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : ''}</span>
          <span className={`w-2 h-2 rounded-full ${statusColors[project.status] || 'bg-gray-500'}`} />
        </div>
      </div>
      <p className="text-xs text-dark-400 mb-3">{project.company?.name || 'Firma Belirsiz'}</p>
      <div className="relative h-2 bg-dark-600 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent to-accent-dark rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-dark-400">{project.employeeCount || 0} çalışan</p>
        <p className="text-xs text-dark-400">{progress}%</p>
      </div>
    </div>
  )
}

function PatrolCard({ patrol, statusConfig, onClick }) {
  const status = statusConfig[patrol.status] || statusConfig.active
  const StatusIcon = status.icon
  
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center flex-shrink-0`}>
        <StatusIcon size={20} className={status.color} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-dark-100 text-sm truncate">{patrol.name}</h4>
        <p className="text-xs text-dark-400 truncate">
          {patrol.company?.name} • {patrol.assignments?.length || 0} personel
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-dark-300">
           {patrol.assignments?.[0] ? `${patrol.assignments[0].start_time}` : '-'}
        </p>
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
  const { t } = useTranslation()
  const { stats, projects, patrols } = useApp()
  const navigate = useNavigate()
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/activities')
      .then(res => res.json())
      .then(data => setRecentActivities(data))
      .catch(err => console.error('Error fetching activities:', err))
  }, [])

  const statusConfig = {
    active: { icon: Clock, color: 'text-green-400', bg: 'bg-green-500/10', label: t('common.active') || 'Aktif' },
    pending: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: t('common.pending') || 'Bekliyor' },
    completed: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: t('common.completed') || 'Tamamlandı' },
    inactive: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pasif' },
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">{t('dashboard.title') || 'Dashboard'}</h1>
          <p className="text-dark-400 mt-1">{t('dashboard.welcome') || 'Hoş geldiniz'}</p>
        </div>
        <button 
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark rounded-lg text-white text-sm font-medium transition-colors"
        >
          <ArrowUpRight size={18} />
          {t('dashboard.createReport') || 'Rapor Oluştur'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.totalCompanies') || 'Toplam Firma'}
          value={stats.totalCompanies || 0}
          icon={Building2}
          trend="up"
          trendValue="+12%"
          color="blue"
          comparedText={t('common.comparedToLastMonth') || 'Geçen aya göre'}
        />
        <StatCard
          title={t('dashboard.activeProjects') || 'Aktif Proje'}
          value={stats.activeProjects || 0}
          icon={FolderKanban}
          trend="up"
          trendValue="+8%"
          color="green"
          comparedText={t('common.comparedToLastMonth') || 'Geçen aya göre'}
        />
        <StatCard
          title={t('dashboard.activePersonnel') || 'Aktif Çalışan'}
          value={stats.activeEmployees || 0}
          icon={Users}
          trend="down"
          trendValue="-3%"
          color="purple"
          comparedText={t('common.comparedToLastMonth') || 'Geçen aya göre'}
        />
        <StatCard
          title={t('dashboard.activePatrols') || 'Aktif Devriye'}
          value={stats.activePatrols || 0}
          icon={Shield}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <div className="lg:col-span-2 bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-50">{t('dashboard.projectProgress') || 'Proje Durumları'}</h2>
            <button 
              onClick={() => navigate('/projects')}
              className="text-sm text-accent hover:text-accent-light transition-colors"
            >
              {t('common.viewAll') || 'Tümünü Gör'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
            {projects.length === 0 && (
              <p className="text-dark-400 col-span-2 text-center py-4">Henüz proje bulunmuyor.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-dark-50">{t('dashboard.recentActivities') || 'Son Aktiviteler'}</h2>
          </div>
          <div className="space-y-1">
            {recentActivities.length === 0 ? (
               <p className="text-dark-400 text-sm py-2">Henüz aktivite yok.</p>
            ) : (
              recentActivities.map(activity => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Patrols Section */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-dark-50">{t('dashboard.patrolStatus') || 'Devriye Durumu'}</h2>
            <p className="text-sm text-dark-400 mt-1">
              {stats.activePatrols} {t('common.active')?.toLowerCase() || 'aktif'}, {stats.completedPatrols} {t('common.completed')?.toLowerCase() || 'tamamlandı'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/patrol')}
            className="text-sm text-accent hover:text-accent-light transition-colors"
          >
            {t('common.viewAll') || 'Tümünü Gör'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patrols.slice(0, 6).map(patrol => (
            <PatrolCard 
              key={patrol.id} 
              patrol={patrol} 
              statusConfig={statusConfig} 
              onClick={() => navigate(`/patrol/${patrol.id}`)}
            />
          ))}
          {patrols.length === 0 && (
            <p className="text-dark-400 col-span-2 text-center py-4">Henüz devriye bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  )
}
