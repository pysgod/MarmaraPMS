  const API_URL = import.meta.env.VITE_API_URL || '/api'

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
  // Shift Management
  // ==========================================
  async getCompanyShifts(companyId) {
    return this.request(`/shifts/company/${companyId}`)
  }

  async createShiftDefinition(data) {
    return this.request('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateShiftDefinition(id, data) {
    return this.request(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteShiftDefinition(id) {
    return this.request(`/shifts/${id}`, {
      method: 'DELETE',
    })
  }

  async getProjectShiftAssignments(projectId) {
    return this.request(`/shifts/project/${projectId}`)
  }

  async assignShift(data) {
    return this.request('/shifts/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unassignShift(data) {
    return this.request('/shifts/unassign', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ==========================================
  // Work Schedule (New Table-based System)
  // ==========================================
  async getProjectWorkSchedule(projectId, year, month) {
    return this.request(`/work-schedule/project/${projectId}?year=${year}&month=${month}`)
  }

  async toggleWorkSchedule(data) {
    return this.request('/work-schedule/toggle', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateWorkSchedule(data) {
    return this.request('/work-schedule/update', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async setLeaveType(data) {
    return this.request('/work-schedule/leave', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async bulkUpdateWorkSchedule(data) {
    return this.request('/work-schedule/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProjectJokers(projectId, year, month) {
    return this.request(`/work-schedule/jokers/${projectId}?year=${year}&month=${month}`)
  }

  async toggleJoker(data) {
    return this.request('/work-schedule/jokers/toggle', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addJoker(data) {
    return this.request('/work-schedule/jokers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteJoker(id) {
    return this.request(`/work-schedule/jokers/${id}`, {
      method: 'DELETE',
    })
  }

  async getMonthlySummary(projectId, year, month) {
    return this.request(`/work-schedule/project/${projectId}/summary?year=${year}&month=${month}`)
  }

  async getCompanyWorkScheduleStats(companyId, year, month) {
    return this.request(`/work-schedule/company/${companyId}/stats?year=${year}&month=${month}`)
  }

  async getEmployeeWorkSchedule(employeeId, year, month) {
    return this.request(`/work-schedule/employee/${employeeId}?year=${year}&month=${month}`)
  }

  // ==========================================
  // Shift Type Management (Dynamic)
  // ==========================================
  async getShiftTypes(projectId) {
    return this.request(`/shift-types/project/${projectId}`)
  }

  async createShiftType(data) {
    return this.request('/shift-types', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateShiftType(id, data) {
    return this.request(`/shift-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteShiftType(id) {
    return this.request(`/shift-types/${id}`, {
      method: 'DELETE',
    })
  }

  async reorderShiftTypes(orderUpdates) {
    return this.request('/shift-types/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderUpdates }),
    })
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
  async getEmployees(companyId = null, status = null) {
    const params = new URLSearchParams()
    if (companyId) params.append('companyId', companyId)
    if (status) params.append('status', status)
    const query = params.toString()
    return this.request(`/employees${query ? `?${query}` : ''}`)
  }

  async getIdleEmployees() {
    return this.request('/employees/idle')
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

  async assignEmployeeToCompany(employeeId, companyId, notes = null) {
    return this.request(`/employees/${employeeId}/assign-company`, {
      method: 'PUT',
      body: JSON.stringify({ company_id: companyId, notes }),
    })
  }

  async unassignEmployeeFromCompany(employeeId, notes = null) {
    return this.request(`/employees/${employeeId}/unassign-company`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    })
  }

  async generateActivationCode(employeeId) {
    return this.request(`/mobile/generate-code/${employeeId}`, {
      method: 'POST'
    })
  }

  async getHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/employees/history?${queryString}`)
  }

  async getEmployeeHistory(employeeId) {
    return this.request(`/employees/${employeeId}/history`)
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
  // Status Updates
  // ==========================================
  async updateCompanyStatus(id, status) {
    return this.request(`/companies/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async updateProjectStatus(id, status) {
    return this.request(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // ==========================================
  // Project Clothing Types
  // ==========================================
  async getProjectClothingTypes(projectId) {
    return this.request(`/projects/${projectId}/clothing-types`)
  }

  async updateProjectClothingTypes(projectId, clothingTypes) {
    return this.request(`/projects/${projectId}/clothing-types`, {
      method: 'PUT',
      body: JSON.stringify({ clothing_types: clothingTypes }),
    })
  }

  // ==========================================
  // Project Customer Rep
  // ==========================================
  async getProjectCustomerRep(projectId) {
    return this.request(`/projects/${projectId}/customer-rep`)
  }

  async updateProjectCustomerRep(projectId, data) {
    return this.request(`/projects/${projectId}/customer-rep`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ==========================================
  // Admin Users
  // ==========================================
  async getAdminUsers() {
    return this.request('/projects/managers/list')
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

  // ==========================================
  // Attendance (QR System)
  // ==========================================
  async recordAttendanceScan(projectId, employeeId, type) {
    return this.request('/attendance/scan', {
      method: 'POST',
      body: JSON.stringify({ projectId, employeeId, type }),
    })
  }

  async getProjectAttendance(projectId, startDate, endDate) {
    return this.request(`/attendance/project/${projectId}?startDate=${startDate}&endDate=${endDate}`)
  }

  async getAttendanceStats(projectId, month) {
    return this.request(`/attendance/stats/${projectId}?month=${month}`)
  }
}

export const api = new ApiService()
export default api

