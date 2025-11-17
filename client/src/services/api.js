// Use relative path for API calls - works in both dev (via Vite proxy) and production
const API_URL = import.meta.env.VITE_API_URL || '/api';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('e3_token');

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.error?.message || error.message || 'Request failed');
    }

    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export class API {
  constructor() {
    this.client = new APIClient(API_URL);

    this.auth = {
      login: (credentials) => this.client.post('/auth/login', credentials),
      register: (data) => this.client.post('/auth/register', data),
      me: () => this.client.get('/auth/me'),
    };

    this.projects = {
      getAll: () => this.client.get('/projects'),
      getOne: (id) => this.client.get(`/projects/${id}`),
      create: (data) => this.client.post('/projects', data),
      update: (id, data) => this.client.put(`/projects/${id}`, data),
      delete: (id) => this.client.delete(`/projects/${id}`),
    };

    this.ecosystems = {
      getByProject: (projectId) => this.client.get(`/ecosystems/project/${projectId}`),
      getOne: (id) => this.client.get(`/ecosystems/${id}`),
      create: (data) => this.client.post('/ecosystems', data),
      delete: (id) => this.client.delete(`/ecosystems/${id}`),
    };

    this.analytics = {
      track: (eventType, eventData) => this.client.post('/analytics/track', { eventType, eventData }),
      getUserStats: () => this.client.get('/analytics/user'),
    };

    this.export = {
      json: (ecosystemId) => `${API_URL}/export/json/${ecosystemId}`,
      pdf: (ecosystemId) => `${API_URL}/export/pdf/${ecosystemId}`,
    };

    this.ai = {
      chat: (message, conversationHistory = [], context = {}) =>
        this.client.post('/ai/chat', { message, conversationHistory, context }),
      getInsights: (ecosystemId) => this.client.get(`/ai/insights/${ecosystemId}`),
      health: () => this.client.get('/ai/health'),
    };
  }
}
