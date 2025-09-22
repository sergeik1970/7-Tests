import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./index.module.scss";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { user } = useAuth();
    
    // Меню для учителей (создателей тестов)
    const teacherMenuItems = [
        { icon: "🏠", label: "Главная", href: "/dashboard", active: true },
        { icon: "📝", label: "Мои тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Статистика", href: "/dashboard/statistics" },
        { icon: "👥", label: "Ученики", href: "/dashboard/participants" },
        { icon: "⚙️", label: "Настройки", href: "/dashboard/settings" }
    ];
    
    // Меню для учеников
    const studentMenuItems = [
        { icon: "🏠", label: "Главная", href: "/dashboard", active: true },
        { icon: "📝", label: "Доступные тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Мои результаты", href: "/dashboard/results" },
        { icon: "⚙️", label: "Настройки", href: "/dashboard/settings" }
    ];
    
    const menuItems = user?.role === 'creator' ? teacherMenuItems : studentMenuItems;

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <a href="/" className={styles.logoLink}>
                        <h2 className={styles.logoText}>Skorix</h2>
                    </a>
                </div>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        {menuItems.map((item, index) => (
                            <li key={index}>
                                <a 
                                    href={item.href} 
                                    className={`${styles.navItem} ${item.active ? styles.active : ''}`}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navLabel}>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className={styles.user}>
                    <div className={styles.userAvatar}>👤</div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user?.name || 'Пользователь'}</div>
                        <div className={styles.userRole}>
                            {user?.role === 'creator' ? 'Учитель' : 'Ученик'}
                        </div>
                    </div>
                </div>
            </aside>
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerActions}>
                        <button className={styles.notificationBtn}>🔔</button>
                        <button className={styles.profileBtn}>
                            <span>👤</span>
                        </button>
                    </div>
                </header>
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;