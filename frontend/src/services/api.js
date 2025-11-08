/**
 * API service with authentication support
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get default headers with credentials
   */
  getHeaders(includeContentType = true) {
    const headers = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    // Include credentials for session-based auth
    return {
      ...headers,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.body && typeof options.body === 'string'),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session auth
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - user needs to login
      if (response.status === 401) {
        // Clear any stored auth state
        localStorage.removeItem('authUser');
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized - Please login');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        // Create a more detailed error message
        const errorMessage = errorData.message || errorData.error || `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.response = errorData; // Attach full response for detailed error handling
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication methods
  async signup(userData) {
    return this.request('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials) {
    return this.request('/auth/signin/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signout() {
    return this.request('/auth/signout/', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me/');
  }

  async checkAuth() {
    return this.request('/auth/check/');
  }

  // Workflow methods
  async getWorkflows() {
    return this.request('/workflows/');
  }

  async getWorkflow(id) {
    return this.request(`/workflows/${id}/`);
  }

  async createWorkflow(workflowData) {
    return this.request('/workflows/', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async updateWorkflow(id, workflowData) {
    return this.request(`/workflows/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(workflowData),
    });
  }

  async deleteWorkflow(id) {
    return this.request(`/workflows/${id}/`, {
      method: 'DELETE',
    });
  }

  async executeWorkflow(id, executionData) {
    return this.request(`/workflows/${id}/execute/`, {
      method: 'POST',
      body: JSON.stringify(executionData),
    });
  }

  // UI Builder Project methods
  async getUIProjects() {
    return this.request('/ui-projects/');
  }

  async getUIProject(id) {
    return this.request(`/ui-projects/${id}/`);
  }

  async createUIProject(projectData) {
    return this.request('/ui-projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateUIProject(id, projectData) {
    return this.request(`/ui-projects/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteUIProject(id) {
    return this.request(`/ui-projects/${id}/`, {
      method: 'DELETE',
    });
  }

  // Credential methods
  async getCredentials() {
    return this.request('/credentials/');
  }

  async createCredential(credentialData) {
    return this.request('/credentials/', {
      method: 'POST',
      body: JSON.stringify(credentialData),
    });
  }

  // AI Chat (public endpoint)
  async aiChat(message, conversationHistory, settings) {
    return this.request('/ai-chat/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
        settings,
      }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

