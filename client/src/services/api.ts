import type {
  User,
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
  LeaderboardEntry,
  ActionPlan,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let activeToken: string | null = null;

function getToken(): string | null {
  return activeToken;
}

function setToken(token: string): void {
  activeToken = token;
}

function removeToken(): void {
  activeToken = null;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function performTokenRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    setToken(data.token);
    return data.token;
  } catch (err) {
    removeToken();
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isAuth = endpoint.startsWith('/auth/');
  let token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If unauthorized and not an authentication endpoint, try to refresh the token and retry the request
  if (response.status === 401 && !isAuth && endpoint !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = performTokenRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
  }

  if (response.status === 401) {
    removeToken();
    if (!isAuth) {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const msgs = errorData.errors.map((e: any) => e.msg).filter(Boolean);
      if (msgs.length > 0) {
        throw new Error(msgs.join(' '));
      }
    }
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

  async getProfile(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/profile');
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      removeToken();
    }
  },

  getToken,

  async refreshToken(): Promise<string | null> {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = performTokenRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    return refreshPromise;
  },

  async verify(email: string, code: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async submitAssessment(data: AssessmentFormData): Promise<{
    assessment: Assessment;
    emissions: {
      daily: number;
      monthly: number;
      annual: number;
      breakdown: Record<string, number>;
    };
    scores: {
      overall: number;
      categories: Record<string, number>;
    };
    recommendations: Recommendation[];
  }> {
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
  async chatWithAssistant(message: string): Promise<{ reply: string; suggestions: string[] }> {
    return request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async getChatHistory(): Promise<{ messages: ChatMessage[] }> {
    return request('/assistant/history');
  },

  // Action Plan
  async generateActionPlan(): Promise<ActionPlan> {
    return request('/assessments/latest/plan', {
      method: 'POST',
    });
  },

  async getLatestActionPlan(): Promise<ActionPlan> {
    return request('/assessments/latest/plan');
  },

  // Leaderboard
  async getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[]; currentUserStats: { totalSavedKg: number; completedActions: number } | null }> {
    return request('/progress/leaderboard');
  },
};

export default api;
