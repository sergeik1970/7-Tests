import React, { ReactElement } from "react";
import styles from "./index.module.scss";

const Footer = (): ReactElement => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.brand}>
                        <h3 className={styles.brandName}>Skorix</h3>
                        <p className={styles.brandDescription}>
                            Современная платформа для создания и проведения онлайн-тестов
                        </p>
                    </div>
                    <div className={styles.links}>
                        <div className={styles.linkGroup}>
                            <h4 className={styles.linkGroupTitle}>Продукт</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Возможности
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Тарифы
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        API
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Интеграции
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.linkGroup}>
                            <h4 className={styles.linkGroupTitle}>Поддержка</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Документация
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Помощь
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Контакты
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Статус системы
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.linkGroup}>
                            <h4 className={styles.linkGroupTitle}>Компания</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <a href="#" className={styles.link}>
                                        О нас
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Блог
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Карьера
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>
                                        Пресса
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <div className={styles.copyright}>© 2025 Skorix. Все права защищены.</div>
                    <div className={styles.legal}>
                        <a href="#" className={styles.legalLink}>
                            Политика конфиденциальности
                        </a>
                        <a href="#" className={styles.legalLink}>
                            Условия использования
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
