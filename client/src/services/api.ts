import type {
  AssessmentFormData,
  AuthResponse,
  Assessment,
  DashboardSummary,
  Recommendation,
  SustainabilityScore,
  TrendPoint,
  Goal,
  GoalFormData,
  ChatMessage,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('ecotrack_token');
}

function setToken(token: string): void {
  localStorage.setItem('ecotrack_token', token);
}

function removeToken(): void {
  localStorage.removeItem('ecotrack_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(result.token);
    return result;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(result.token);
    return result;
  },

  async getProfile(): Promise<{ user: { id: number; name: string; email: string } }> {
    return request('/auth/profile');
  },

  logout(): void {
    removeToken();
  },

  getToken,

  // Assessment
  async submitAssessment(data: AssessmentFormData): Promise<{ assessment: Assessment; score: SustainabilityScore; recommendations: Recommendation[] }> {
    return request('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getLatestAssessment(): Promise<{ assessment: Assessment }> {
    return request('/assessments/latest');
  },

  // Dashboard
  async getDashboard(): Promise<DashboardSummary> {
    return request('/dashboard/summary');
  },

  // Recommendations
  async getRecommendations(): Promise<{ recommendations: Recommendation[] }> {
    return request('/recommendations');
  },

  async completeRecommendation(id: number): Promise<{ recommendation: Recommendation }> {
    return request(`/recommendations/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // Scores
  async getScoreHistory(): Promise<{ scores: SustainabilityScore[] }> {
    return request('/scores/history');
  },

  // Trends
  async getTrends(): Promise<{ trends: TrendPoint[] }> {
    return request('/progress/trends');
  },

  // Goals
  async getGoals(): Promise<{ goals: Goal[] }> {
    return request('/progress/goals');
  },

  async createGoal(data: GoalFormData): Promise<{ goal: Goal }> {
    return request('/progress/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGoal(id: number, data: Partial<Goal>): Promise<{ goal: Goal }> {
    return request(`/progress/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Chat
  async chatWithAssistant(message: string, history?: ChatMessage[]): Promise<{ reply: string; suggestions: string[] }> {
    return request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },
};

export default api;
