import React, { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import TestsList from "@/shared/components/TestsList";
import { useAuth } from "@/contexts/AuthContext";

const TestsListPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [error, setError] = useState("");

    const handleCreateTest = () => {
        router.push("/dashboard/tests/create");
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    return (
        <DashboardLayout>
            <TestsList
                userRole={user?.role}
                onCreateTest={handleCreateTest}
                onError={handleError}
            />
        </DashboardLayout>
    );
};

export default TestsListPage;
