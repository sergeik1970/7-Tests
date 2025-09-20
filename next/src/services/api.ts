const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'participant' | 'creator';
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: 'participant' | 'creator';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface QuestionOption {
    text: string;
    isCorrect: boolean;
    order: number;
}

export interface Question {
    id?: number;
    text: string;
    type: 'multiple_choice' | 'text_input';
    order: number;
    correctTextAnswer?: string;
    options?: QuestionOption[];
}

export interface Test {
    id?: number;
    title: string;
    description?: string;
    timeLimit?: number;
    status: 'draft' | 'active' | 'completed';
    questions: Question[];
    creator?: User;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTestData {
    title: string;
    description?: string;
    timeLimit?: number;
    questions: Question[];
}

class ApiService {
    private getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка регистрации');
        }

        const result = await response.json();
        
        // Сохраняем токен в localStorage
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        return result;
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка входа');
        }

        const result = await response.json();
        
        // Сохраняем токен в localStorage
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        return result;
    }

    async getProfile(): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Ошибка получения профиля');
        }

        return response.json();
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    }

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // Методы для работы с тестами
    async createTest(data: CreateTestData): Promise<Test> {
        const response = await fetch(`${API_BASE_URL}/tests`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка создания теста');
        }

        return response.json();
    }

    async getTests(): Promise<Test[]> {
        const response = await fetch(`${API_BASE_URL}/tests`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Ошибка получения тестов');
        }

        return response.json();
    }

    async getTest(id: number): Promise<Test> {
        const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Ошибка получения теста');
        }

        return response.json();
    }

    async updateTest(id: number, data: Partial<CreateTestData>): Promise<Test> {
        const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка обновления теста');
        }

        return response.json();
    }

    async publishTest(id: number): Promise<Test> {
        const response = await fetch(`${API_BASE_URL}/tests/${id}/publish`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка публикации теста');
        }

        return response.json();
    }

    async deleteTest(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка удаления теста');
        }
    }
}

export const apiService = new ApiService();

// Экспорт функций для удобства
export const register = (data: RegisterData) => apiService.register(data);
export const login = (data: LoginData) => apiService.login(data);
export const getProfile = () => apiService.getProfile();
export const logout = () => apiService.logout();
export const getCurrentUser = () => apiService.getCurrentUser();
export const getToken = () => apiService.getToken();
export const isAuthenticated = () => apiService.isAuthenticated();

// Функции для работы с тестами
export const createTest = (data: CreateTestData) => apiService.createTest(data);
export const getTests = () => apiService.getTests();
export const getTest = (id: number) => apiService.getTest(id);
export const updateTest = (id: number, data: Partial<CreateTestData>) => apiService.updateTest(id, data);
export const publishTest = (id: number) => apiService.publishTest(id);
export const deleteTest = (id: number) => apiService.deleteTest(id);