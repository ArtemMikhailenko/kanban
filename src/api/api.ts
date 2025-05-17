// src/api/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

// Створюємо екземпляр axios з базовим URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Додаємо інтерцептор для додавання токену авторизації до кожного запиту
api.interceptors.request.use(
  (config) => {
    // Отримуємо токен з localStorage (якщо він є)
    let token;
    
    // Use try-catch to handle localStorage access errors (e.g., in SSR context)
    try {
      token = localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    
    // Якщо токен є, додаємо його до заголовків запиту
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Додаємо інтерцептор для обробки помилок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error has response
    if (error.response) {
      // Перевіряємо, чи це помилка 401 (Unauthorized)
      if (error.response.status === 401) {
        // Try to use localStorage only in browser environment
        try {
          // Видаляємо токен і перенаправляємо на сторінку входу
          localStorage.removeItem('authToken');
          
          // Only redirect in browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        } catch (e) {
          console.error('Error handling unauthorized response:', e);
        }
      }
      
      // Log error details for debugging
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Експортуємо API модулі для роботи з різними ресурсами
export const auth = {
  register: (data: { email: string; password: string; fullName: string }) => 
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string; rememberMe: boolean }) => 
    api.post('/auth/login', data),
  
  me: () => api.get('/auth/me'),
  
  verifyEmail: (token: string) => api.get(`/users/verify/${token}`),
  
  resendVerification: (email: string) => 
    api.post('/auth/resend-verification', { email }),
};

export const projects = {
  getAll: () => api.get('/projects'),
  
  getById: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.get(`/projects/${id}`);
  },
  
  create: (data: { name: string; description?: string }) => 
    api.post('/projects', data),
  
  update: (id: string, data: { name: string; description?: string }) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.put(`/projects/${id}`, data);
  },
  
  delete: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.delete(`/projects/${id}`);
  },
  
  updateColumnOrder: (id: string, columnOrder: string[]) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.patch(`/projects/${id}/column-order`, { columnOrder });
  },
};

export const columns = {
  getAll: (projectId: string) => {
    // Validate projectId before making request
    if (!projectId || projectId === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.get('/columns', { params: { projectId } });
  },
  
  getById: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid column ID'));
    }
    return api.get(`/columns/${id}`);
  },
  
  create: (data: { title: string; projectId: string }) => {
    // Validate projectId before making request
    if (!data.projectId || data.projectId === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.post('/columns', data);
  },
  
  update: (id: string, data: { title: string }) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid column ID'));
    }
    return api.put(`/columns/${id}`, data);
  },
  
  delete: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid column ID'));
    }
    return api.delete(`/columns/${id}`);
  },
  
  updateTaskOrder: (id: string, taskIds: string[]) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid column ID'));
    }
    return api.patch(`/columns/${id}/task-order`, { taskIds });
  },
};

export const tasks = {
  getAll: (projectId: string) => {
    // Validate projectId before making request
    if (!projectId || projectId === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.get('/tasks', { params: { projectId } });
  },
  
  getById: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid task ID'));
    }
    return api.get(`/tasks/${id}`);
  },
  
  create: (data: {
    title: string;
    description?: string;
    columnId: string;
    projectId: string;
    deadline?: string;
    labels?: string[];
  }) => {
    // Validate ids before making request
    if (!data.projectId || data.projectId === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    if (!data.columnId || data.columnId === 'undefined') {
      return Promise.reject(new Error('Invalid column ID'));
    }
    return api.post('/tasks', data);
  },
  
  update: (id: string, data: {
    title?: string;
    description?: string;
    columnId?: string;
    deadline?: string;
    labels?: string[];
  }) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid task ID'));
    }
    if (data.columnId && data.columnId === 'undefined') {
      return Promise.reject(new Error('Invalid column ID'));
    }
    return api.put(`/tasks/${id}`, data);
  },
  
  delete: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid task ID'));
    }
    return api.delete(`/tasks/${id}`);
  },
  
  move: (id: string, targetColumnId: string) => {
    // Validate ids before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid task ID'));
    }
    if (!targetColumnId || targetColumnId === 'undefined') {
      return Promise.reject(new Error('Invalid target column ID'));
    }
    return api.patch(`/tasks/${id}/move`, { targetColumnId });
  },
  
  getUpcoming: (days: number = 7) => 
    api.get('/tasks/upcoming', { params: { days } }),
  
  getOverdue: () => api.get('/tasks/overdue'),
};

export const notifications = {
  getAll: () => api.get('/notifications'),
  
  markAsRead: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid notification ID'));
    }
    return api.post(`/notifications/${id}/read`);
  },
  
  markAllAsRead: () => api.post('/notifications/read-all'),
  
  delete: (id: string) => {
    // Validate id before making request
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid notification ID'));
    }
    return api.delete(`/notifications/${id}`);
  },
};

export const analytics = {
  getStatistics: (timeRange = 'month', startDate?: string, endDate?: string) => {
    const params: Record<string, string> = { timeRange };
    if (timeRange === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    return api.get('/analytics/statistics', { params });
  },
  
  getActivity: (timeRange = 'month', startDate?: string, endDate?: string) => {
    const params: Record<string, string> = { timeRange };
    if (timeRange === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    return api.get('/analytics/activity', { params });
  },
  
  getTasksDistribution: (projectId: string) => {
    // Validate projectId before making request
    if (!projectId || projectId === 'undefined') {
      return Promise.reject(new Error('Invalid project ID'));
    }
    return api.get(`/analytics/projects/${projectId}/distribution`);
  },
  
  getCompletionVelocity: (timeRange = 'month', startDate?: string, endDate?: string) => {
    const params: Record<string, string> = { timeRange };
    if (timeRange === 'custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    return api.get('/analytics/velocity', { params });
  },
};

export default api;