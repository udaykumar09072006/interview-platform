import type {
  User,
  Interview,
  CodingProblem,
  InterviewQuestion,
  Submission,
  ExecutionResult,
  InterviewFeedback,
  NotificationItem,
  PlatformStats,
} from '../types';

const TOKEN_KEY = 'intervexa_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: {
      name: string;
      email: string;
      password: string;
      role: 'candidate' | 'interviewer' | 'admin';
      title?: string;
      company?: string;
    }) =>
      request<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    clerkSync: (data: {
      clerkId: string;
      email: string;
      name?: string;
      avatar?: string;
      role?: 'candidate' | 'interviewer' | 'admin';
      title?: string;
      company?: string;
    }) =>
      request<{ message: string; user: User; profile: any; token: string }>('/api/auth/clerk-sync', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateRole: (role: 'candidate' | 'interviewer' | 'admin') =>
      request<{ message: string; user: User; token: string }>('/api/auth/role', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    getMe: () => request<{ user: User; profile: any }>('/api/auth/me'),
    logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
  },

  // Interviews
  interviews: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<Interview[]>(`/api/interviews${qs}`);
    },
    get: (id: string) => request<Interview>(`/api/interviews/${id}`),
    create: (interviewData: Partial<Interview>) =>
      request<Interview>('/api/interviews', {
        method: 'POST',
        body: JSON.stringify(interviewData),
      }),
    update: (id: string, updates: Partial<Interview>) =>
      request<Interview>(`/api/interviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/interviews/${id}`, { method: 'DELETE' }),
    join: (id: string) =>
      request<{ message: string; interview: Interview; userRoleInInterview: string }>(
        `/api/interviews/${id}/join`,
        { method: 'POST' }
      ),
    end: (id: string) =>
      request<{ message: string; interview: Interview }>(`/api/interviews/${id}/end`, {
        method: 'POST',
      }),
    getFeedback: (id: string) =>
      request<{
        feedback: InterviewFeedback;
        interview: Interview;
        candidate: any;
        interviewer: any;
      }>(`/api/interviews/${id}/feedback`),
    submitFeedback: (id: string, feedbackData: any) =>
      request<InterviewFeedback>(`/api/interviews/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      }),
  },

  // Questions
  questions: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<InterviewQuestion[]>(`/api/questions${qs}`);
    },
    create: (questionData: Partial<InterviewQuestion>) =>
      request<InterviewQuestion>('/api/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      }),
    update: (id: string, updates: Partial<InterviewQuestion>) =>
      request<InterviewQuestion>(`/api/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/api/questions/${id}`, { method: 'DELETE' }),
  },

  // Problems
  problems: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<CodingProblem[]>(`/api/problems${qs}`);
    },
    get: (id: string) => request<CodingProblem>(`/api/problems/${id}`),
    create: (problemData: Partial<CodingProblem>) =>
      request<CodingProblem>('/api/problems', {
        method: 'POST',
        body: JSON.stringify(problemData),
      }),
  },

  // Submissions & Execution
  submissions: {
    runOrSubmit: (payload: {
      interviewId?: string;
      problemId: string;
      language: string;
      code: string;
      customInput?: string;
      isSubmit?: boolean;
    }) =>
      request<ExecutionResult>('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<Submission[]>(`/api/submissions${qs}`);
    },
  },

  // Users & Admin
  users: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request<User[]>(`/api/users${qs}`);
    },
    get: (id: string) => request<{ user: User; profile: any }>(`/api/users/${id}`),
    update: (id: string, updates: any) =>
      request<{ message: string; user: User }>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    getStats: () => request<PlatformStats>('/api/users/stats'),
    getNotifications: () => request<NotificationItem[]>('/api/users/notifications/me'),
    markNotificationRead: (id: string) =>
      request<NotificationItem>(`/api/users/notifications/${id}/read`, { method: 'PUT' }),
  },
};
