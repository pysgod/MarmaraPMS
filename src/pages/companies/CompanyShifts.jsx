import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Plus, Trash2, Clock } from 'lucide-react'

export default function CompanyShifts({ companyId }) {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newShift, setNewShift] = useState({
    name: '',
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    loadShifts()
  }, [companyId])

  const loadShifts = async () => {
    try {
      const data = await api.getCompanyShifts(companyId)
      setShifts(data)
    } catch (error) {
      console.error('Vardiyalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.createShiftDefinition({
        company_id: companyId,
        ...newShift
      })
      setNewShift({ name: '', start_time: '', end_time: '' })
      loadShifts()
    } catch (error) {
      console.error('Vardiya oluşturulurken hata:', error)
      alert('Vardiya oluşturulamadı')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu vardiyayı silmek istediğinize emin misiniz?')) return
    try {
      await api.deleteShiftDefinition(id)
      loadShifts()
    } catch (error) {
      console.error('Vardiya silinirken hata:', error)
      alert('Vardiya silinemedi (Atama yapılmış olabilir)')
    }
  }

  if (loading) return <div>Yükleniyor...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-theme-text-primary">Vardiya Tanımları</h3>
      </div>

      {/* Yeni Vardiya Ekleme Formu */}
      <div className="bg-theme-bg-hover p-4 rounded-lg border border-theme-border-secondary">
        <h4 className="text-sm font-medium text-theme-text-secondary mb-3">Yeni Vardiya Ekle</h4>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-theme-text-muted mb-1">Vardiya Adı</label>
            <input
              type="text"
              required
              placeholder="Örn: Sabah"
              className="w-full px-3 py-2 bg-theme-bg-elevated border border-dark-500 rounded-md text-sm text-theme-text-primary placeholder-theme-text-placeholder focus:outline-none focus:border-accent"
              value={newShift.name}
              onChange={e => setNewShift({ ...newShift, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text-muted mb-1">Başlangıç Saati</label>
            <input
              type="time"
              required
              className="w-full px-3 py-2 bg-theme-bg-elevated border border-dark-500 rounded-md text-sm text-theme-text-primary focus:outline-none focus:border-accent [color-scheme:dark]"
              value={newShift.start_time}
              onChange={e => setNewShift({ ...newShift, start_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text-muted mb-1">Bitiş Saati</label>
            <input
              type="time"
              required
              className="w-full px-3 py-2 bg-theme-bg-elevated border border-dark-500 rounded-md text-sm text-theme-text-primary focus:outline-none focus:border-accent [color-scheme:dark]"
              value={newShift.end_time}
              onChange={e => setNewShift({ ...newShift, end_time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-theme-text-muted mb-1">Dinlenme (dk)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 bg-theme-bg-elevated border border-dark-500 rounded-md text-sm text-theme-text-primary placeholder-theme-text-placeholder focus:outline-none focus:border-accent"
              value={newShift.break_duration || ''}
              onChange={e => setNewShift({ ...newShift, break_duration: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-dark transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Ekle
          </button>
        </form>
      </div>

      {/* Vardiya Listesi */}
      <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-dark-700">
          <thead className="bg-theme-bg-hover">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Vardiya Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Saat Aralığı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted uppercase tracking-wider">Dinlenme</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-theme-text-muted uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-theme-bg-secondary divide-y divide-dark-700">
            {shifts.map((shift) => (
              <tr key={shift.id} className="hover:bg-theme-bg-tertiary/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-primary">{shift.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-tertiary flex items-center">
                  <Clock size={16} className="mr-2 text-theme-text-muted" />
                  {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-text-tertiary">
                  {shift.break_duration ? `${shift.break_duration} dk` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(shift.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {shifts.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-theme-text-muted">
                  Henüz vardiya tanımı yapılmamış.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
