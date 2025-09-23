const API_BASE_URL = 'http://localhost:3001/api';

export interface User {
    id: number;
    email: string;
    name: string;
    role: 'pupil' | 'teacher' | 'student' | 'professor';
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
    role?: 'pupil' | 'teacher' | 'student' | 'professor';
}

export interface LoginData {
    email: string;
    password: string;
}

export interface QuestionOption {
    id?: number;
    text: string;
    isCorrect?: boolean;
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

export interface TestAttempt {
    id: number;
    testId: number;
    userId: number;
    status: 'in_progress' | 'completed' | 'abandoned';
    startedAt: string;
    completedAt?: string;
    score?: number;
    correctAnswers?: number;
    totalQuestions: number;
    test: Test;
    answers?: TestAnswer[];
    remainingTime?: number;
}

export interface TestAnswer {
    id: number;
    attemptId: number;
    questionId: number;
    selectedOptionId?: number;
    textAnswer?: string;
    isCorrect: boolean;
    selectedOption?: QuestionOption;
}

export interface TeacherStatistics {
    overview: {
        totalTests: number;
        activeTests: number;
        draftTests: number;
        totalStudents: number;
        totalAttempts: number;
        completedAttempts: number;
        averageScore: number;
    };
    testStatistics: {
        id: number;
        title: string;
        status: string;
        totalAttempts: number;
        completedAttempts: number;
        averageScore: number;
        createdAt: string;
    }[];
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

    async deactivateTest(id: number): Promise<Test> {
        const response = await fetch(`${API_BASE_URL}/tests/${id}/deactivate`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка деактивации теста');
        }

        return response.json();
    }

    async getTeacherStatistics(): Promise<TeacherStatistics> {
        const response = await fetch(`${API_BASE_URL}/tests/statistics/overview`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка получения статистики');
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

    // Методы для работы с попытками прохождения тестов
    async startTest(testId: number): Promise<TestAttempt> {
        const response = await fetch(`${API_BASE_URL}/test-attempts/start`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ testId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка начала теста');
        }

        return response.json();
    }

    async getAttempt(attemptId: number): Promise<TestAttempt> {
        const response = await fetch(`${API_BASE_URL}/test-attempts/${attemptId}`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка получения попытки');
        }

        return response.json();
    }

    async submitAnswer(attemptId: number, questionId: number, selectedOptionId?: number, textAnswer?: string): Promise<TestAnswer> {
        const response = await fetch(`${API_BASE_URL}/test-attempts/${attemptId}/answer`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
                questionId,
                selectedOptionId,
                textAnswer,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка отправки ответа');
        }

        return response.json();
    }

    async completeTest(attemptId: number): Promise<TestAttempt> {
        const response = await fetch(`${API_BASE_URL}/test-attempts/${attemptId}/complete`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка завершения теста');
        }

        return response.json();
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
export const deactivateTest = (id: number) => apiService.deactivateTest(id);
export const deleteTest = (id: number) => apiService.deleteTest(id);
export const getTeacherStatistics = () => apiService.getTeacherStatistics();

// Функции для работы с попытками прохождения тестов
export const startTest = (testId: number) => apiService.startTest(testId);
export const getAttempt = (attemptId: number) => apiService.getAttempt(attemptId);
export const submitAnswer = (attemptId: number, questionId: number, selectedOptionId?: number, textAnswer?: string) => 
    apiService.submitAnswer(attemptId, questionId, selectedOptionId, textAnswer);
export const completeTest = (attemptId: number) => apiService.completeTest(attemptId);