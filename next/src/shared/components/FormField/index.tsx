import React from "react";
import InputText from "../InputText";
import styles from "./index.module.scss";

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "email" | "password" | "select";
    placeholder?: string;
    required?: boolean;
    error?: string;
    options?: { value: string; label: string }[];
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    error,
    options,
    className,
}) => {
    return (
        <div className={`${styles.formField} ${className || ""}`}>
            <label className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>
            
            {type === "select" && options ? (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${styles.select} ${error ? styles.error : ""}`}
                    required={required}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <InputText
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={error ? styles.error : ""}
                />
            )}
            
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

export default FormField;