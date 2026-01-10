import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { User, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function ProjectShifts({ projectId }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    project: null,
    shiftDefinitions: [],
    assignments: [],
    employees: []
  })
  
  // Dragging state
  const [draggedEmployeeId, setDraggedEmployeeId] = useState(null)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const result = await api.getProjectShiftAssignments(projectId)
      setData(result)
    } catch (error) {
      console.error('Proje vardiya bilgileri alınamadı:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate shift status (Planned, Active, Finished) based on current time
  const getShiftStatus = (start, end) => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    // Convert HH:mm to minutes
    const [sH, sM] = start.split(':').map(Number)
    const [eH, eM] = end.split(':').map(Number)
    const startMin = sH * 60 + sM
    const endMin = eH * 60 + eM

    // Handle cross-midnight shifts (e.g. 22:00 - 06:00)
    if (endMin < startMin) {
      if (currentTime >= startMin || currentTime < endMin) return 'active'
    } else {
      if (currentTime >= startMin && currentTime < endMin) return 'active'
    }
    
    // Simple logic for planned/finished requires date context which we don't fully track daily here.
    // For now, if not active, we can say "Simdi degil" or based on closeness.
    // Let's stick to "active" check. If not active, it's inactive.
    return 'inactive'
  }

  const handleDragStart = (e, employeeId) => {
    setDraggedEmployeeId(employeeId)
    e.dataTransfer.effectAllowed = 'move'
    // Set invisible drag image or custom one if needed
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetShiftId) => {
    e.preventDefault()
    if (!draggedEmployeeId) return

    try {
      // Find current assignment
      const currentAssignment = data.assignments.find(a => a.employee_id === draggedEmployeeId)
      
      // If dropping into "Unassigned" (targetShiftId is null)
      if (targetShiftId === null) {
        if (currentAssignment) {
          await api.unassignShift({
             project_id: projectId,
             employee_id: draggedEmployeeId
          })
        }
      } else {
         // Dropping into a Shift
         // If already in this shift, do nothing
         if (currentAssignment && currentAssignment.shift_id === targetShiftId) return;

         await api.assignShift({
            project_id: projectId,
            employee_id: draggedEmployeeId,
            shift_id: targetShiftId
         })
      }

      // Reload data to reflect changes
      loadData()
    } catch (error) {
      console.error('Atama hatası:', error)
      alert('Vardiya ataması başarısız.')
    } finally {
      setDraggedEmployeeId(null)
    }
  }

  if (loading) return <div>Yükleniyor...</div>

  // Group employees by shift assignment
  const unassignedEmployees = data.employees.filter(emp => 
    !data.assignments.some(a => a.employee_id === emp.id)
  )

  const getEmployeesInShift = (shiftId) => {
    const assignments = data.assignments.filter(a => a.shift_id === shiftId)
    // Join with employee details (assignments include employee model)
    // But data.employees has the full list, assignments has 'employee' include.
    return assignments.map(a => a.employee).filter(Boolean)
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6 overflow-hidden">
      
      {/* Unassigned Column */}
      <div 
        className="w-1/4 bg-dark-800 rounded-lg flex flex-col border border-dark-700"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        <div className="p-4 border-b border-dark-700 bg-dark-700/50 rounded-t-lg">
          <h3 className="font-semibold text-dark-200">Atanmamış Personel</h3>
          <span className="text-xs text-dark-400">{unassignedEmployees.length} kişi</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {unassignedEmployees.map(emp => (
            <div
              key={emp.id}
              draggable
              onDragStart={(e) => handleDragStart(e, emp.id)}
              className="bg-dark-700 p-3 rounded shadow-sm border border-dark-600 cursor-grab active:cursor-grabbing hover:bg-dark-600 transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-xs font-bold text-dark-300">
                {emp.first_name?.[0]}{emp.last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-100">{emp.first_name} {emp.last_name}</p>
                <p className="text-xs text-dark-400">{emp.title || 'Personel'}</p>
              </div>
            </div>
          ))}
          {unassignedEmployees.length === 0 && (
             <div className="text-center mt-10 px-2">
                <p className="text-sm text-dark-500">Boş</p>
                {data.employees.length === 0 && (
                  <p className="text-xs text-red-400 mt-2">Projede kayıtlı personel yok. <br /> Lütfen Personel sekmesinden ekleyin.</p>
                )}
             </div>
          )}
        </div>
      </div>

      {/* Shifts Area */}
      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-full">
           {data.shiftDefinitions.map(shift => {
             const status = getShiftStatus(shift.start_time, shift.end_time)
             const employees = getEmployeesInShift(shift.id)

             return (
               <div 
                 key={shift.id}
                 className={`min-w-[300px] rounded-lg flex flex-col border-2 transition-colors ${
                    status === 'active' ? 'border-green-500/30 bg-green-900/10' : 'border-dark-700 bg-dark-800'
                 }`}
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, shift.id)}
               >
                 <div className={`p-4 border-b flex justify-between items-start rounded-t-lg ${
                    status === 'active' ? 'bg-green-900/20 border-green-500/20' : 'bg-dark-700/50 border-dark-700'
                 }`}>
                   <div>
                     <h3 className="font-bold text-dark-100">{shift.name}</h3>
                     <div className="flex items-center text-xs text-dark-400 mt-1">
                       <Clock size={12} className="mr-1" />
                       {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                     </div>
                   </div>
                   {status === 'active' ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center">
                        <CheckCircle size={10} className="mr-1" /> Aktif
                      </span>
                   ) : (
                      <span className="px-2 py-1 bg-dark-600 text-dark-300 text-xs rounded-full">
                        Planlı
                      </span>
                   )}
                 </div>

                 <div className="flex-1 overflow-y-auto p-2 space-y-2">
                   {employees.map(emp => (
                      <div
                        key={emp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, emp.id)}
                        className="bg-dark-700 p-3 rounded shadow-sm border border-dark-600 cursor-grab flex items-center gap-3 relative group hover:bg-dark-600 transition-colors"
                      >
                         <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-100">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-dark-400">{emp.title || 'Personel'}</p>
                        </div>
                      </div>
                   ))}
                   {employees.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-dark-500 border-2 border-dashed border-dark-700 rounded m-2">
                        <User size={24} className="mb-2 opacity-30" />
                        <span className="text-sm">Personel sürükleyin</span>
                      </div>
                   )}
                 </div>
               </div>
             )
           })}

           {data.shiftDefinitions.length === 0 && (
             <div className="flex-1 flex items-center justify-center bg-dark-800 rounded-lg border border-dashed border-dark-700">
                <div className="text-center">
                  <AlertCircle size={48} className="mx-auto text-dark-500 mb-2" />
                  <p className="text-dark-300 font-medium">Bu firmaya tanımlı vardiya bulunamadı.</p>
                  <p className="text-sm text-dark-500">Lütfen önce firma detay sayfasından vardiya tanımlayın.</p>
                </div>
             </div>
           )}
        </div>
      </div>

    </div>
  )
}
