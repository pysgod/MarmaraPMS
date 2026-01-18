import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { PieChart as PieIcon, BarChart3, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function CompanyShifts({ companyId }) {
  const [stats, setStats] = useState({
    projectStats: [],
    shiftTypeStats: [],
    totalHours: { gozetim: 0, mesai: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    loadData()
  }, [companyId, selectedYear, selectedMonth])

  const loadData = async () => {
    setLoading(true)
    try {
      const statsData = await api.getCompanyWorkScheduleStats(companyId, selectedYear, selectedMonth)
      setStats(statsData)
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  if (loading) return (
    <div className="flex items-center justify-center p-8 text-theme-text-muted">
      <Loader2 size={24} className="animate-spin mr-2" /> Yükleniyor...
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       {/* Filters */}
       <div className="flex items-center gap-4 bg-theme-bg-secondary p-4 rounded-lg border border-theme-border-primary">
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="bg-theme-bg-tertiary border border-theme-border-secondary rounded px-3 py-1.5 text-sm outline-none focus:border-accent text-white"
          >
            {[...Array(5)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - 2 + i}>{new Date().getFullYear() - 2 + i}</option>
            ))}
          </select>
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            className="bg-theme-bg-tertiary border border-theme-border-secondary rounded px-3 py-1.5 text-sm outline-none focus:border-accent text-white"
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <div className="ml-auto text-sm gap-4 flex">
             <div>Top. Gözetim: <span className="font-bold text-green-400">{stats.totalHours.gozetim}h</span></div>
             <div>Top. Mesai: <span className="font-bold text-orange-400">{stats.totalHours.mesai}h</span></div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Hours Chart */}
          <div className="bg-theme-bg-secondary p-4 rounded-lg border border-theme-border-primary shadow-sm">
             <h4 className="text-sm font-medium mb-4 text-theme-text-primary flex items-center gap-2">
                <BarChart3 size={16} /> Proje Bazlı Çalışma Saatleri (Ay: {monthNames[selectedMonth - 1]})
             </h4>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.projectStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.2} />
                      <XAxis dataKey="name" fontSize={12} stroke="#888" />
                      <YAxis fontSize={12} stroke="#888" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Bar dataKey="gozetim" name="Gözetim Saati" fill="#4ade80" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="mesai" name="Mesai Saati" fill="#fb923c" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Shift Type Distribution */}
          <div className="bg-theme-bg-secondary p-4 rounded-lg border border-theme-border-primary shadow-sm">
             <h4 className="text-sm font-medium mb-4 text-theme-text-primary flex items-center gap-2">
                <PieIcon size={16} /> Vardiya Tipi Dağılımı
             </h4>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={stats.shiftTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.shiftTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                         contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                         itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                   </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>
    </div>
  )
}
