import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import AuthNavigation from "@/shared/components/AuthNavigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./auth.module.scss";

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "participant" as "participant" | "creator"
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

                    <div className={styles.field}>
                        <label className={styles.label}>Имя</label>
                        <InputText
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="Введите ваше имя"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <InputText
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="Введите ваш email"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Роль</label>
                        <select 
                            className={styles.select}
                            value={formData.role}
                            onChange={(e) => handleChange("role", e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="participant">Ученик</option>
                            <option value="creator">Учитель</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Пароль</label>
                        <InputText
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            placeholder="Введите пароль"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Подтвердите пароль</label>
                        <InputText
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            placeholder="Повторите пароль"
                            required
                            disabled={isLoading}
                        />
                    </div>

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