import React, { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Statistics from "@/shared/components/Statistics";
import { useAuth } from "@/contexts/AuthContext";

const StatisticsPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [error, setError] = useState("");

    const handleTestClick = (testId: number) => {
        router.push(`/dashboard/tests/detail?id=${testId}`);
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleAccessDenied = () => {
        router.push("/dashboard");
    };

    return (
        <DashboardLayout>
            <Statistics
                userRole={user?.role}
                onTestClick={handleTestClick}
                onError={handleError}
                onAccessDenied={handleAccessDenied}
            />
        </DashboardLayout>
    );
};

export default StatisticsPage;
