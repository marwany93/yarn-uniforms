'use client';

import { createContext, useContext, useState, useEffect } from 'react';

/**
 * StudentContext — holds verified student data after passing National ID check.
 * Data is persisted in sessionStorage so a tab refresh within the same session
 * doesn't log the student out. Closing the browser/tab clears the session.
 */

const StudentContext = createContext(null);

const SESSION_KEY = 'yarn_verified_student';

export function StudentProvider({ children }) {
    const [student, setStudent] = useState(null); // { name, nationalId, schoolId }
    const [isHydrated, setIsHydrated] = useState(false);

    // Rehydrate from sessionStorage on mount
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(SESSION_KEY);
            if (saved) {
                setStudent(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('StudentContext: Failed to read session:', e);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    /**
     * Call after successful National ID verification.
     * @param {{ name: string, nationalId: string, schoolId: string }} studentData
     */
    const verifyStudent = (studentData) => {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(studentData));
        } catch (e) {
            console.warn('StudentContext: Failed to persist session:', e);
        }
        setStudent(studentData);
    };

    /**
     * Clear verified student — e.g., on logout / new school selection.
     */
    const clearStudent = () => {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (e) {
            console.warn('StudentContext: Failed to clear session:', e);
        }
        setStudent(null);
    };

    return (
        <StudentContext.Provider value={{ student, verifyStudent, clearStudent, isHydrated }}>
            {children}
        </StudentContext.Provider>
    );
}

export const useStudent = () => {
    const ctx = useContext(StudentContext);
    if (!ctx) {
        // Graceful fallback — components can check isHydrated before acting
        return { student: null, verifyStudent: () => {}, clearStudent: () => {}, isHydrated: false };
    }
    return ctx;
};
