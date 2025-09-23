export type UserRole = 'pupil' | 'teacher' | 'student' | 'professor';

export const isTeacher = (role: UserRole): boolean => {
    return role === 'teacher' || role === 'professor';
};

export const isStudent = (role: UserRole): boolean => {
    return role === 'pupil' || role === 'student';
};

export const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
        case 'pupil':
            return 'Ученик';
        case 'teacher':
            return 'Учитель';
        case 'student':
            return 'Студент';
        case 'professor':
            return 'Преподаватель';
        default:
            return 'Неизвестная роль';
    }
};

export const getDashboardTitle = (role: UserRole): string => {
    if (isTeacher(role)) {
        return role === 'teacher' ? 'Панель учителя' : 'Панель преподавателя';
    }
    return role === 'pupil' ? 'Панель ученика' : 'Панель студента';
};