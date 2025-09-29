import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { isTeacher, getRoleDisplayName } from "@/shared/utils/roles";
import styles from "./index.module.scss";

export interface MenuItem {
    icon: string;
    label: string;
    href: string;
    active?: boolean;
}

interface SidebarProps {
    className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
    const { user } = useAuth();
    const router = useRouter();

    // Меню для учителей (создателей тестов)
    const teacherMenuItems: MenuItem[] = [
        { icon: "🏠", label: "Главная", href: "/dashboard" },
        { icon: "📝", label: "Мои тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Статистика", href: "/dashboard/statistics" },
        { icon: "👥", label: "Ученики", href: "/dashboard/participants" },
        { icon: "⚙️", label: "Настройки", href: "/dashboard/settings" },
    ];

    // Меню для учеников
    const studentMenuItems: MenuItem[] = [
        { icon: "🏠", label: "Главная", href: "/dashboard" },
        { icon: "📝", label: "Доступные тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Мои результаты", href: "/dashboard/results" },
        { icon: "⚙️", label: "Настройки", href: "/dashboard/settings" },
    ];

    const menuItems = user?.role && isTeacher(user.role) ? teacherMenuItems : studentMenuItems;

    // Определяем активный пункт меню на основе текущего пути
    const getActiveMenuItem = (href: string) => {
        const currentPath = router.asPath;

        // Точное совпадение для главной страницы
        if (href === "/dashboard" && currentPath === "/dashboard") {
            return true;
        }

        // Для остальных страниц проверяем, начинается ли путь с href
        if (href !== "/dashboard" && currentPath.startsWith(href)) {
            return true;
        }

        return false;
    };

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    return (
        <aside className={`${styles.sidebar} ${className || ""}`}>
            <div className={styles.logo}>
                <a href="/" className={styles.logoLink}>
                    <h2 className={styles.logoText}>Skorix</h2>
                </a>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => handleNavigation(item.href)}
                                className={`${styles.navItem} ${
                                    getActiveMenuItem(item.href) ? styles.active : ""
                                }`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={styles.user}>
                <div className={styles.userAvatar}>👤</div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{user?.name || "Пользователь"}</div>
                    <div className={styles.userRole}>
                        {user?.role ? getRoleDisplayName(user.role) : "Пользователь"}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
