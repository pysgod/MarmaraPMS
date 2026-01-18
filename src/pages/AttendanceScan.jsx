import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { LogIn, LogOut, CheckCircle, XCircle, Clock, User, Building2 } from 'lucide-react'

/**
 * Mobile Attendance Scan Page
 * This page is accessed via QR code scan URL
 * URL format: /attendance/scan?projectId=123&type=entry|exit
 */
export default function AttendanceScan() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const projectId = searchParams.get('projectId')
  const type = searchParams.get('type') // 'entry' or 'exit'
  
  const [status, setStatus] = useState('loading') // loading, select_employee, processing, success, error
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [message, setMessage] = useState('')
  const [attendanceData, setAttendanceData] = useState(null)
  const [project, setProject] = useState(null)

  useEffect(() => {
    if (!projectId || !type) {
      setStatus('error')
      setMessage('Geçersiz QR kodu. Lütfen tekrar deneyin.')
      return
    }

    loadProjectAndEmployees()
  }, [projectId, type])

  const loadProjectAndEmployees = async () => {
    try {
      // Load project info
      const projectData = await api.getProject(projectId)
      setProject(projectData)

      // Load project employees
      const empData = await api.getProjectEmployees(projectId)
      setEmployees(empData)
      setStatus('select_employee')
    } catch (error) {
      console.error('Load error:', error)
      setStatus('error')
      setMessage('Proje bilgileri yüklenemedi: ' + error.message)
    }
  }

  const handleScan = async () => {
    if (!selectedEmployee) {
      setMessage('Lütfen bir personel seçin')
      return
    }

    setStatus('processing')
    setMessage('')

    try {
      const result = await api.recordAttendanceScan(projectId, selectedEmployee, type)
      setAttendanceData(result.attendance)
      setStatus('success')
      setMessage(result.message)
    } catch (error) {
      console.error('Scan error:', error)
      setStatus('error')
      setMessage(error.message || 'Kayıt başarısız')
    }
  }

  const isEntry = type === 'entry'
  const Icon = isEntry ? LogIn : LogOut
  const bgColor = isEntry ? 'bg-green-500' : 'bg-red-500'
  const bgColorLight = isEntry ? 'bg-green-500/10' : 'bg-red-500/10'
  const borderColor = isEntry ? 'border-green-500/30' : 'border-red-500/30'
  const textColor = isEntry ? 'text-green-500' : 'text-red-500'

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className={`${bgColorLight} border ${borderColor} rounded-t-2xl p-6 text-center`}>
          <div className={`w-20 h-20 ${bgColor} rounded-full mx-auto flex items-center justify-center mb-4`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${textColor}`}>
            {isEntry ? 'VARDİYA GİRİŞİ' : 'VARDİYA ÇIKIŞI'}
          </h1>
          {project && (
            <div className="mt-3 flex items-center justify-center gap-2 text-gray-400">
              <Building2 className="w-4 h-4" />
              <span>{project.name}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-b-2xl p-6 border border-t-0 border-gray-700">
          {status === 'loading' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Yükleniyor...</p>
            </div>
          )}

          {status === 'select_employee' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Personel Seçin
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500 text-lg"
                >
                  <option value="">-- Personel Seçin --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.title ? `(${emp.title})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {message && (
                <p className="text-amber-400 text-sm text-center">{message}</p>
              )}

              <button
                onClick={handleScan}
                disabled={!selectedEmployee}
                className={`w-full py-4 ${bgColor} hover:opacity-90 disabled:opacity-50 rounded-lg text-white font-semibold text-lg transition-all flex items-center justify-center gap-2`}
              >
                <Icon className="w-5 h-5" />
                {isEntry ? 'Giriş Yap' : 'Çıkış Yap'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                {new Date().toLocaleString('tr-TR')}
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center py-8">
              <div className={`w-10 h-10 border-4 ${isEntry ? 'border-green-500' : 'border-red-500'} border-t-transparent rounded-full animate-spin mx-auto mb-4`} />
              <p className="text-gray-400">İşleniyor...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-green-500">{message}</h2>
              {attendanceData && (
                <div className="bg-gray-700/50 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tarih:</span>
                    <span className="text-white">{attendanceData.date}</span>
                  </div>
                  {attendanceData.check_in_time && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Giriş Saati:</span>
                      <span className="text-green-400">
                        {new Date(attendanceData.check_in_time).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                  )}
                  {attendanceData.check_out_time && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Çıkış Saati:</span>
                      <span className="text-red-400">
                        {new Date(attendanceData.check_out_time).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Durum:</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      attendanceData.status === 'present' ? 'bg-green-500/20 text-green-400' :
                      attendanceData.status === 'late' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {attendanceData.status === 'present' ? 'Zamanında' :
                       attendanceData.status === 'late' ? 'Geç' :
                       attendanceData.status === 'incomplete' ? 'Devam Ediyor' : attendanceData.status}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={() => window.close()}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Kapat
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full mx-auto flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-red-500">Hata!</h2>
              <p className="text-gray-400">{message}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Marmara PMS - Personel Yönetim Sistemi
        </p>
      </div>
    </div>
  )
}
