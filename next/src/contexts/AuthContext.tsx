import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '@/services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
        role?: 'participant' | 'creator';
    }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Проверяем, есть ли сохраненный пользователь при загрузке
        const savedUser = apiService.getCurrentUser();
        const token = apiService.getToken();
        
        if (savedUser && token) {
            setUser(savedUser);
        }
        
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiService.login({ email, password });
        setUser(response.user);
    };

    const register = async (userData: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
        role?: 'participant' | 'creator';
    }) => {
        const response = await apiService.register(userData);
        setUser(response.user);
    };

    const logout = () => {
        apiService.logout();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};