import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import FormField from "@/shared/components/FormField";
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
                    {error && <div className={styles.error}>{error}</div>}

                    <FormField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="Введите ваш email"
                        required
                    />

                    <FormField
                        label="Пароль"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="Введите пароль"
                        required
                    />

                    <Button variant="primary" size="large" type="submit" disabled={isLoading}>
                        {isLoading ? "Вход..." : "Войти"}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>
                        Нет аккаунта?{" "}
                        <Link href="/auth/register" className={styles.link}>
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
