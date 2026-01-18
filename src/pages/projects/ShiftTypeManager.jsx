import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import api from '../../services/api'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function ShiftTypeManager({ projectId, onClose, onUpdate }) {
  const [shiftTypes, setShiftTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // New shift form state
  const [newShift, setNewShift] = useState({
    name: '',
    color: '#3B82F6',
    hours: 8,
    start_time: '',
    end_time: ''
  })

  useEffect(() => {
    fetchShiftTypes()
  }, [projectId])

  const fetchShiftTypes = async () => {
    try {
      setLoading(true)
      const data = await api.getShiftTypes(projectId)
      setShiftTypes(data)
    } catch (err) {
      setError('Vardiya tipleri yüklenirken hata oluştu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto calculate duration
  const handleTimeChange = (field, value) => {
    const updated = { ...newShift, [field]: value }
    setNewShift(updated)

    if (updated.start_time && updated.end_time) {
      const today = '2000-01-01'
      const start = new Date(`${today}T${updated.start_time}`)
      let end = new Date(`${today}T${updated.end_time}`)
      
      if (end < start) {
        end = new Date(`2000-01-02T${updated.end_time}`) // Next day
      }
      
      const diff = (end - start) / (1000 * 60 * 60) // hours
      setNewShift(prev => ({ ...prev, [field]: value, hours: parseFloat(diff.toFixed(2)) }))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const nextNumber = shiftTypes.length + 1
      await api.createShiftType({ 
        ...newShift, 
        project_id: projectId,
        short_code: String(nextNumber),
        order: shiftTypes.length 
      })
      
      setNewShift({
        name: '',
        color: '#3B82F6',
        hours: 8,
        start_time: '',
        end_time: ''
      })
      await fetchShiftTypes()
      if (onUpdate) onUpdate()
    } catch (err) {
      setError('Vardiya tipi oluşturulamadı')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu vardiya tipini silmek istediğinize emin misiniz?')) return
    try {
      await api.deleteShiftType(id)
      await fetchShiftTypes()
      if (onUpdate) onUpdate()
    } catch (err) {
      setError('Silme işlemi başarısız')
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(shiftTypes)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Optimistic Update with re-numbering
    const optimisticItems = items.map((item, index) => ({
      ...item,
      short_code: String(index + 1)
    }))
    setShiftTypes(optimisticItems)

    const orderUpdates = items.map((item, index) => ({
      id: item.id,
      order: index
    }))

    try {
      await api.reorderShiftTypes(orderUpdates)
      // We rely on backend to update short_code permanently, fetching will sync it next time
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error('Sıralama hatası:', err)
      // Revert if needed
      fetchShiftTypes()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-xl font-bold dark:text-white">Vardiya Tiplerini Düzenle</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X size={20} className="dark:text-slate-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Create Form */}
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-700">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2 dark:text-slate-200">
              <Plus size={16} /> Yeni Ekle
            </h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs mb-1 dark:text-slate-400">Vardiya Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Sabah"
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={newShift.name}
                  onChange={e => setNewShift({...newShift, name: e.target.value})}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs mb-1 dark:text-slate-400">Başlangıç</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white [color-scheme:dark]"
                  value={newShift.start_time}
                  onChange={e => handleTimeChange('start_time', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs mb-1 dark:text-slate-400">Bitiş</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white [color-scheme:dark]"
                  value={newShift.end_time}
                  onChange={e => handleTimeChange('end_time', e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-xs mb-1 dark:text-slate-400">Renk</label>
                 <input
                    type="color"
                    className="h-9 w-full cursor-pointer rounded border p-1 bg-white dark:bg-slate-700 dark:border-slate-600"
                    value={newShift.color}
                    onChange={e => setNewShift({...newShift, color: e.target.value})}
                  />
              </div>
              <div className="md:col-span-1">
                 <label className="block text-xs mb-1 dark:text-slate-400">Süre</label>
                 <div className="text-sm font-medium dark:text-white py-2">{newShift.hours}s</div>
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>

          {/* List Drag & Drop */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="shift-types">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {shiftTypes.map((type, index) => (
                    <Draggable key={type.id} draggableId={type.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm group hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab">
                              <GripVertical size={20} />
                            </div>
                            <div 
                              className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm shadow-sm"
                              style={{ backgroundColor: type.color }}
                            >
                              {type.short_code}
                            </div>
                            <div>
                              <div className="font-medium text-sm dark:text-white">{type.name}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {type.start_time?.slice(0, 5)} - {type.end_time?.slice(0, 5)} ({type.hours} Saat)
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleDelete(type.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {shiftTypes.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Henüz vardiya tipi tanımlanmamış. Yukarıdan ekleyiniz.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-right">
           <button 
             onClick={onClose}
             className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition"
           >
             Kapat
           </button>
        </div>
      </div>
    </div>
  )
}
