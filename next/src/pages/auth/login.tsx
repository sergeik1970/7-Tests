import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import AuthNavigation from "@/shared/components/AuthNavigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./auth.module.scss";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(email, password);
            // Перенаправляем в dashboard после успешного входа
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка входа");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <AuthNavigation currentPage="login" />
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Вход в систему</h1>
                    <p className={styles.subtitle}>
                        Войдите в свой аккаунт для доступа к платформе тестирования
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <InputText
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите ваш email"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Пароль</label>
                        <InputText
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
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
                        {isLoading ? "Вход..." : "Войти"}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Нет аккаунта?{" "}
                        <a href="/auth/register" className={styles.link}>
                            Зарегистрироваться
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;