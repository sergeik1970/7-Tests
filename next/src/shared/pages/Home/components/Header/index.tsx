import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDisplayName } from "@/shared/utils/roles";
import styles from "./index.module.scss";

const Header = (): ReactElement => {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <a href={isAuthenticated ? "/dashboard" : "/"} className={styles.logoLink}>
                        <h1 className={styles.logoText}>Skorix</h1>
                    </a>
                </div>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li><a href="#features" className={styles.navLink}>Возможности</a></li>
                        <li><a href="#contact" className={styles.navLink}>Контакты</a></li>
                    </ul>
                </nav>
                <div className={styles.authButtons}>
                    {isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>
                                    Привет, {user?.name}!
                                </span>
                                <span className={styles.userRole}>
                                    {user?.role ? getRoleDisplayName(user.role) : 'Пользователь'}
                                </span>
                            </div>
                            <Button variant="outline" size="small" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </div>
                    ) : (
                        <>
                            <a href="/auth/login">
                                <Button variant="outline" size="small">
                                    Войти
                                </Button>
                            </a>
                            <a href="/auth/register">
                                <Button variant="primary" size="small">
                                    Регистрация
                                </Button>
                            </a>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;