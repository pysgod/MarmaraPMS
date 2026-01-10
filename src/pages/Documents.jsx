import { useState, useEffect } from 'react'
import { 
  FolderOpen, 
  Upload, 
  Search, 
  Filter,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Grid,
  List,
  Folder
} from 'lucide-react'

function getFileIcon(type) {
  switch (type) {
    case 'pdf': return { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10' }
    case 'excel': return { icon: FileSpreadsheet, color: 'text-green-400', bg: 'bg-green-500/10' }
    case 'word': return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' }
    case 'image': return { icon: Image, color: 'text-purple-400', bg: 'bg-purple-500/10' }
    default: return { icon: File, color: 'text-dark-400', bg: 'bg-dark-600' }
  }
}

function DocumentCard({ doc }) {
  const [showMenu, setShowMenu] = useState(false)
  const fileType = getFileIcon(doc.type)
  const Icon = fileType.icon

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 card-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${fileType.bg} flex items-center justify-center`}>
          <Icon size={24} className={fileType.color} />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-dark-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={18} className="text-dark-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-dark-700 border border-dark-600 rounded-xl shadow-xl overflow-hidden z-10 animate-fadeIn">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors">
                <Eye size={16} />
                Görüntüle
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-200 hover:bg-dark-600 transition-colors">
                <Download size={16} />
                İndir
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-600 transition-colors">
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>
      <h3 className="font-medium text-dark-100 truncate mb-1">{doc.name}</h3>
      <div className="flex items-center justify-between text-sm text-dark-400">
        <span>{doc.size}</span>
        <span>{doc.date}</span>
      </div>
      <div className="mt-3">
        <span className="px-2 py-1 bg-dark-700 rounded-md text-xs text-dark-300">{doc.category}</span>
      </div>
    </div>
  )
}

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState(['Tümü'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [viewRes, docRes] = await Promise.all([
          fetch('http://localhost:3001/api/data-view'),
          fetch('http://localhost:3001/api/documents')
        ])
        
        const viewData = await viewRes.json()
        const docData = await docRes.json()

        setCategories(['Tümü', ...viewData.docCategories.map(c => c.name)])
        setDocuments(docData.map(d => ({
          ...d,
          category: d.category ? d.category.name : 'Genel'
        })))
        setLoading(false)
      } catch (error) {
        console.error('Error fetching documents:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'Tümü' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculations
  const totalSizeVal = documents.reduce((acc, doc) => {
    // Basic parse logic for demo "2.4 MB" -> 2.4 * 1024 * 1024
    // Since this is becoming dynamic, we might store size in bytes in DB 
    // but for now let's just count documents.
    return acc
  }, 0)
  
  // Just show count for now
  const newThisWeek = 0 // Would need date math

  if (loading) return <div className="p-6 text-center text-dark-300">Yükleniyor...</div>

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50">Belgeler</h1>
          <p className="text-dark-400 mt-1">Tüm belgeleri yönetin ve organize edin</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent/25">
          <Upload size={18} />
          Belge Yükle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-dark-50">{documents.length}</p>
          <p className="text-xs text-dark-400">Toplam Belge</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-blue-400">{newThisWeek}</p>
          <p className="text-xs text-dark-400">Bu Hafta Eklenen</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-green-400">-</p>
          <p className="text-xs text-dark-400">Toplam Boyut</p>
        </div>
        <div className="bg-dark-800 rounded-xl p-4 border border-dark-700">
          <p className="text-2xl font-bold text-purple-400">{categories.length - 1}</p>
          <p className="text-xs text-dark-400">Kategori</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-800 rounded-xl p-4 border border-dark-700">
        <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
            <input
              type="text"
              placeholder="Belge ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg
                text-dark-100 placeholder-dark-400 text-sm
                focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-dark-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 bg-dark-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-dark-600 text-accent' : 'text-dark-400 hover:text-dark-200'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-dark-600 text-accent' : 'text-dark-400 hover:text-dark-200'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredDocs.map(doc => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-16 bg-dark-800 rounded-xl border border-dark-700">
          <FolderOpen size={48} className="text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-200 mb-2">Belge bulunamadı</h3>
          <p className="text-dark-400 mb-6">Arama kriterlerinize uygun belge bulunamadı.</p>
          <button className="px-5 py-2.5 gradient-accent rounded-lg text-white text-sm font-medium">
            Belge Yükle
          </button>
        </div>
      )}
    </div>
  )
}
