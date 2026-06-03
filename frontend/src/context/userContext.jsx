import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; 
import { signOut, onAuthStateChanged } from 'firebase/auth';

// Dynamic selection based on your hosting environment context
export const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true
});

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext({});

export function UserContextProvider({children}) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Single source of truth for profile fetching
    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/profile');
            setUser(data);
        // eslint-disable-next-line no-unused-vars
        } catch (e) {
            setUser(null);
        } finally {
            setReady(true);
        }
    };

    useEffect(() => {
        // Step 1: Handle Theme initialization
        const root = window.document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        // Step 2: Sync Auth State
        fetchProfile();

        // Listen for Firebase changes (e.g., Google login redirects)
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                fetchProfile();
            }
        });

        return () => unsubscribe();
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const logout = async () => {
        try {
            await signOut(auth); 
            await API.post('/logout');
            setUser(null);
            window.location.href = '/login'; 
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <UserContext.Provider value={{user, setUser, ready, logout, theme, toggleTheme}}>
            {children}
        </UserContext.Provider>
    );
}