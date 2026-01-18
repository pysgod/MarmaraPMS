import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Download, Printer, Copy, Check, LogIn, LogOut } from 'lucide-react'

/**
 * QR Code Modal for Project Attendance
 * Shows separate Entry and Exit QR codes for the project
 */
const QRCodeModal = ({ isOpen, onClose, project }) => {
  const [copied, setCopied] = useState(null)
  
  if (!isOpen || !project) return null

  const baseUrl = window.location.origin
  const entryUrl = `${baseUrl}/attendance/scan?projectId=${project.id}&type=entry`
  const exitUrl = `${baseUrl}/attendance/scan?projectId=${project.id}&type=exit`

  const handleCopy = async (url, type) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Kopyalama hatası:', err)
    }
  }

  const handleDownload = (type) => {
    const svgElement = document.getElementById(`qr-${type}`)
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      const a = document.createElement('a')
      a.download = `${project.name}-${type === 'entry' ? 'giris' : 'cikis'}-qr.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const entryQR = document.getElementById('qr-entry')?.outerHTML || ''
    const exitQR = document.getElementById('qr-exit')?.outerHTML || ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Kodları - ${project.name}</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
          .qr-container { display: inline-block; margin: 20px; padding: 20px; border: 2px solid #333; border-radius: 10px; }
          .qr-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .qr-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
          .project-name { font-size: 18px; margin-top: 15px; color: #333; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>${project.name}</h1>
        <p>Vardiya Giriş/Çıkış QR Kodları</p>
        <div class="qr-container">
          <div class="qr-title" style="color: #16a34a;">GİRİŞ</div>
          <div class="qr-subtitle">Vardiya başlangıcında okutunuz</div>
          ${entryQR}
          <div class="project-name">${project.name}</div>
        </div>
        <div class="qr-container">
          <div class="qr-title" style="color: #dc2626;">ÇIKIŞ</div>
          <div class="qr-subtitle">Vardiya bitiminde okutunuz</div>
          ${exitQR}
          <div class="project-name">${project.name}</div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg border border-border-color rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <div>
            <h2 className="text-xl font-bold text-primary-text">QR Kodları</h2>
            <p className="text-sm text-secondary-text mt-1">{project.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Yazdır
            </button>
            <button
              onClick={onClose}
              className="p-2 text-secondary-text hover:text-primary-text hover:bg-hover-bg rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QR Codes */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Entry QR */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <LogIn className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-green-500">GİRİŞ QR</h3>
            </div>
            <p className="text-sm text-secondary-text mb-4">Vardiya başlangıcında okutulur</p>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QRCodeSVG
                id="qr-entry"
                value={entryUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleCopy(entryUrl, 'entry')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-card-bg hover:bg-hover-bg border border-border-color rounded-lg transition-colors"
              >
                {copied === 'entry' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied === 'entry' ? 'Kopyalandı' : 'Link Kopyala'}
              </button>
              <button
                onClick={() => handleDownload('entry')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-card-bg hover:bg-hover-bg border border-border-color rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                İndir
              </button>
            </div>
          </div>

          {/* Exit QR */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <LogOut className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-red-500">ÇIKIŞ QR</h3>
            </div>
            <p className="text-sm text-secondary-text mb-4">Vardiya bitiminde okutulur</p>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <QRCodeSVG
                id="qr-exit"
                value={exitUrl}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleCopy(exitUrl, 'exit')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-card-bg hover:bg-hover-bg border border-border-color rounded-lg transition-colors"
              >
                {copied === 'exit' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied === 'exit' ? 'Kopyalandı' : 'Link Kopyala'}
              </button>
              <button
                onClick={() => handleDownload('exit')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-card-bg hover:bg-hover-bg border border-border-color rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                İndir
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 border-t border-border-color">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">Nasıl Kullanılır?</h4>
            <ul className="text-sm text-secondary-text space-y-1">
              <li>• Personel vardiya başlangıcında <strong>GİRİŞ QR</strong>'ı telefonuyla okutarak giriş yapar</li>
              <li>• Vardiya bitiminde <strong>ÇIKIŞ QR</strong>'ı okutarak çıkış yapar</li>
              <li>• QR kodları indirip sahaya asabilir veya yazdırabilirsiniz</li>
              <li>• Her proje için ayrı QR kodları oluşturulur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal
