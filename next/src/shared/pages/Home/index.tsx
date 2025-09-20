import React, { ReactElement } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import styles from "./index.module.scss";

const HomePage = (): ReactElement => {
    return (
        <div className={styles.homePage}>
            <Header />
            <main className={styles.main}>
                <Hero />
                <Features />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
