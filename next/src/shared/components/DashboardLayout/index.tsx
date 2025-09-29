import React, { ReactNode } from "react";
import Sidebar from "@/shared/components/Sidebar";
import styles from "./index.module.scss";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerActions}>
                        <button className={styles.notificationBtn}>🔔</button>
                        <button className={styles.profileBtn}>
                            <span>👤</span>
                        </button>
                    </div>
                </header>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
};

export default DashboardLayout;
