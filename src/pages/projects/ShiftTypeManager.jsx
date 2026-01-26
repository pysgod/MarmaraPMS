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

  // Duration formatter
  const formatDuration = (hoursVal) => {
    const totalMinutes = Math.round(hoursVal * 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    
    if (h > 0 && m > 0) return `${h} sa ${m} dk`
    if (h > 0) return `${h} saat`
    return `${m} dk`
  }

  const PRESET_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
    '#64748B', '#1F2937'
  ]

  // RGB Color Picker state
  const [showColorPicker, setShowColorPicker] = useState(false)
  
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 }
  }
  
  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }
  
  const handleRgbChange = (channel, value) => {
    const rgb = hexToRgb(newShift.color)
    rgb[channel] = Math.max(0, Math.min(255, parseInt(value) || 0))
    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b)
    setNewShift(prev => ({ ...prev, color: newColor }))
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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
                 <div className="relative">
                   {/* Color Preview & Toggle */}
                   <button
                     type="button"
                     onClick={() => setShowColorPicker(!showColorPicker)}
                     className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 w-[120px]"
                   >
                     <div 
                       className="w-6 h-6 rounded border border-slate-300 dark:border-slate-500 shrink-0"
                       style={{ backgroundColor: newShift.color }}
                     />
                     <span className="text-sm dark:text-white font-mono">{newShift.color.toUpperCase()}</span>
                   </button>
                   
                   {/* RGB Picker Dropdown */}
                   {showColorPicker && (
                     <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg shadow-xl z-20 min-w-[280px]">
                       {/* Large Color Preview */}
                       <div 
                         className="w-full h-12 rounded-lg mb-3 border dark:border-slate-600"
                         style={{ backgroundColor: newShift.color }}
                       />
                       
                       {/* RGB Sliders */}
                       <div className="space-y-2 mb-3">
                         {[
                           { channel: 'r', label: 'R', color: 'bg-red-500' },
                           { channel: 'g', label: 'G', color: 'bg-green-500' },
                           { channel: 'b', label: 'B', color: 'bg-blue-500' }
                         ].map(({ channel, label, color }) => {
                           const rgb = hexToRgb(newShift.color)
                           return (
                             <div key={channel} className="flex items-center gap-2">
                               <span className={`w-5 h-5 rounded text-white text-xs flex items-center justify-center font-bold ${color}`}>
                                 {label}
                               </span>
                               <input
                                 type="range"
                                 min="0"
                                 max="255"
                                 value={rgb[channel]}
                                 onChange={e => handleRgbChange(channel, e.target.value)}
                                 className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-slate-600"
                                 style={{
                                   background: `linear-gradient(to right, ${rgbToHex(
                                     channel === 'r' ? 0 : rgb.r,
                                     channel === 'g' ? 0 : rgb.g,
                                     channel === 'b' ? 0 : rgb.b
                                   )}, ${rgbToHex(
                                     channel === 'r' ? 255 : rgb.r,
                                     channel === 'g' ? 255 : rgb.g,
                                     channel === 'b' ? 255 : rgb.b
                                   )})`
                                 }}
                               />
                               <input
                                 type="number"
                                 min="0"
                                 max="255"
                                 value={rgb[channel]}
                                 onChange={e => handleRgbChange(channel, e.target.value)}
                                 className="w-14 px-2 py-1 text-xs border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white text-center"
                               />
                             </div>
                           )
                         })}
                       </div>
                       
                       {/* Hex Input */}
                       <div className="flex items-center gap-2 mb-3">
                         <span className="text-xs dark:text-slate-400">HEX:</span>
                         <input
                           type="text"
                           value={newShift.color}
                           onChange={e => {
                             let val = e.target.value
                             if (!val.startsWith('#')) val = '#' + val
                             if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                               setNewShift(prev => ({ ...prev, color: val }))
                             }
                           }}
                           className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white font-mono"
                           maxLength={7}
                         />
                       </div>
                       
                       {/* Preset Colors */}
                       <div className="flex flex-wrap gap-1.5">
                         {PRESET_COLORS.map(c => (
                           <button
                             key={c}
                             type="button"
                             onClick={() => setNewShift(prev => ({ ...prev, color: c }))}
                             className={`w-6 h-6 rounded-md border-2 hover:scale-110 transition-transform ${newShift.color === c ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'}`}
                             style={{ backgroundColor: c }}
                           />
                         ))}
                       </div>
                       
                       {/* Close Button */}
                       <button
                         type="button"
                         onClick={() => setShowColorPicker(false)}
                         className="mt-3 w-full py-1.5 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white"
                       >
                         Kapat
                       </button>
                     </div>
                   )}
                 </div>
              </div>

              <div className="md:col-span-3 ms-3">
                 <label className="block text-xs mb-1 dark:text-slate-400">Süre</label>
                 <div className="text-sm font-medium dark:text-white py-2">{formatDuration(newShift.hours)}</div>
              </div>
            </form>
            {/* Ekle Button - Separate Row */}
            <div className="flex justify-end mt-3">
              <button 
                type="button"
                onClick={handleCreate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                disabled={loading}
              >
                Ekle
              </button>
            </div>
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
                                {type.start_time?.slice(0, 5)} - {type.end_time?.slice(0, 5)} ({formatDuration(type.hours)})
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
