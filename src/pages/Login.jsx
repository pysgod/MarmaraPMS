import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center shadow-xl mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-50">Marmara PMS</h1>
          <p className="text-dark-400 mt-1">Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-800 rounded-2xl border border-dark-700 p-8">
          <h2 className="text-xl font-semibold text-dark-100 mb-6 text-center">{t('login.title')}</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-11 pr-4 py-3 text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="admin@marmara.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-11 pr-4 py-3 text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent-dark rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-700">
            <p className="text-center text-sm text-dark-400">
              {t('login.demoCredentials')}
            </p>
            <p className="text-center text-sm text-dark-300 mt-2">
              <span className="text-accent">admin@marmara.com</span> / <span className="text-accent">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
