const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseUrl = API_URL
  }

  getToken() {
    return localStorage.getItem('token')
  }

  setToken(token) {
    localStorage.setItem('token', token)
  }

  removeToken() {
    localStorage.removeItem('token')
  }

  async request(endpoint, options = {}) {
    const token = this.getToken()
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      this.removeToken()
      window.location.href = '/login'
      throw new Error('Oturum süresi doldu')
    }

    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      data = text ? JSON.parse(text) : {}
    } else {
      const text = await response.text()
      data = { message: text || `HTTP error ${response.status}` }
    }

    if (!response.ok) {
      throw new Error(data.message || 'Bir hata oluştu')
    }

    return data
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.token)
    return data
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    this.setToken(data.token)
    return data
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  logout() {
    this.removeToken()
  }

  // ==========================================
  // Companies
  // ==========================================
  async getCompanies() {
    return this.request('/companies')
  }

  async getCompany(id) {
    return this.request(`/companies/${id}`)
  }

  async createCompany(data) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCompany(id, data) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCompany(id) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    })
  }

  // ==========================================
  // Employees (was Personnel)
  // ==========================================
  async getEmployees(companyId = null) {
    const query = companyId ? `?companyId=${companyId}` : ''
    return this.request(`/employees${query}`)
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}`)
  }

  async createEmployee(data) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEmployee(id, data) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    })
  }

  // ==========================================
  // Projects
  // ==========================================
  async getProjects(companyId = null) {
    const query = companyId ? `?companyId=${companyId}` : ''
    return this.request(`/projects${query}`)
  }

  async getProject(id) {
    return this.request(`/projects/${id}`)
  }

  async createProject(data) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // Project Employees
  async getProjectEmployees(projectId) {
    return this.request(`/projects/${projectId}/employees`)
  }

  async assignEmployeeToProject(projectId, employeeId, assignedRole = null) {
    return this.request(`/projects/${projectId}/employees`, {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId, assigned_role: assignedRole }),
    })
  }

  async removeEmployeeFromProject(projectId, employeeId) {
    return this.request(`/projects/${projectId}/employees/${employeeId}`, {
      method: 'DELETE',
    })
  }

  // ==========================================
  // Patrols
  // ==========================================
  async getPatrols(companyId = null, projectId = null) {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    if (projectId) params.append('projectId', projectId)
    const query = params.toString()
    return this.request(`/patrols${query ? `?${query}` : ''}`)
  }

  async getPatrol(id) {
    return this.request(`/patrols/${id}`)
  }

  async createPatrol(data) {
    return this.request('/patrols', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePatrol(id, data) {
    return this.request(`/patrols/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deletePatrol(id) {
    return this.request(`/patrols/${id}`, {
      method: 'DELETE',
    })
  }

  // Patrol Assignments
  async getPatrolAssignments(patrolId) {
    return this.request(`/patrols/${patrolId}/assignments`)
  }

  async createPatrolAssignment(patrolId, data) {
    return this.request(`/patrols/${patrolId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deletePatrolAssignment(patrolId, assignmentId) {
    return this.request(`/patrols/${patrolId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    })
  }

  // Patrol Logs
  async getPatrolLogs(patrolId) {
    return this.request(`/patrols/${patrolId}/logs`)
  }

  async createPatrolLog(patrolId, data) {
    return this.request(`/patrols/${patrolId}/logs`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ==========================================
  // Notifications
  // ==========================================
  async getNotifications() {
    return this.request('/notifications')
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    })
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    })
  }

  // ==========================================
  // Stats
  // ==========================================
  async getStats(companyId = null) {
    const query = companyId ? `?companyId=${companyId}` : ''
    return this.request(`/stats${query}`)
  }
}

export const api = new ApiService()
export default api
