import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import FormField from "@/shared/components/FormField";
import AuthNavigation from "@/shared/components/AuthNavigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./auth.module.scss";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "pupil" as "pupil" | "teacher" | "student" | "professor"
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { register } = useAuth();

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await register(formData);
            // Перенаправляем в dashboard после успешной регистрации
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка регистрации");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <AuthNavigation currentPage="register" />
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Регистрация</h1>
                    <p className={styles.subtitle}>
                        Создайте аккаунт для доступа к платформе тестирования
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <FormField
                        label="Имя"
                        value={formData.name}
                        onChange={(value) => handleChange("name", value)}
                        placeholder="Введите ваше имя"
                        required
                    />

                    <FormField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleChange("email", value)}
                        placeholder="Введите ваш email"
                        required
                    />

                    <FormField
                        label="Роль"
                        type="select"
                        value={formData.role}
                        onChange={(value) => handleChange("role", value)}
                        options={[
                            { value: "pupil", label: "Ученик" },
                            { value: "teacher", label: "Учитель" },
                            { value: "student", label: "Студент" },
                            { value: "professor", label: "Преподаватель" }
                        ]}
                        required
                    />

                    <FormField
                        label="Пароль"
                        type="password"
                        value={formData.password}
                        onChange={(value) => handleChange("password", value)}
                        placeholder="Введите пароль"
                        required
                    />

                    <FormField
                        label="Подтвердите пароль"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(value) => handleChange("confirmPassword", value)}
                        placeholder="Повторите пароль"
                        required
                    />

                    <Button 
                        variant="primary" 
                        size="large" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Уже есть аккаунт?{" "}
                        <a href="/auth/login" className={styles.link}>
                            Войти
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;