import React, { useState } from "react";
import Link from "next/link";
import styles from "./index.module.scss";

interface AuthNavigationProps {
    currentPage: "login" | "register";
}

const AuthNavigation: React.FC<AuthNavigationProps> = ({ currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <button className={styles.burgerButton} onClick={toggleMenu} aria-label="Открыть меню">
                <span className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ""}`}></span>
                <span className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ""}`}></span>
                <span className={`${styles.burgerLine} ${isMenuOpen ? styles.open : ""}`}></span>
            </button>

            {isMenuOpen && (
                <div className={styles.overlay} onClick={closeMenu}>
                    <nav className={styles.menu} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.menuHeader}>
                            <Link href="/" className={styles.logo} onClick={closeMenu}>
                                <span className={styles.logoText}>Skorix</span>
                            </Link>
                            <button
                                className={styles.closeButton}
                                onClick={closeMenu}
                                aria-label="Закрыть меню"
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.menuContent}>
                            <div className={styles.authSection}>
                                <h3 className={styles.sectionTitle}>Авторизация</h3>
                                <Link
                                    href="/auth/login"
                                    className={`${styles.menuLink} ${currentPage === "login" ? styles.active : ""}`}
                                    onClick={closeMenu}
                                >
                                    <span className={styles.linkIcon}>🔑</span>
                                    Вход в систему
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className={`${styles.menuLink} ${currentPage === "register" ? styles.active : ""}`}
                                    onClick={closeMenu}
                                >
                                    <span className={styles.linkIcon}>📝</span>
                                    Регистрация
                                </Link>
                            </div>

                            <div className={styles.navigationSection}>
                                <h3 className={styles.sectionTitle}>Навигация</h3>
                                <Link href="/" className={styles.menuLink} onClick={closeMenu}>
                                    <span className={styles.linkIcon}>🏠</span>
                                    Главная страница
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
};

export default AuthNavigation;
