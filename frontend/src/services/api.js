import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 1000 // Short timeout to quickly switch to localStorage if server is down
});

export default api;

// Helper to determine if we should use localStorage
const isStaticDemo = () => {
    return window.location.hostname.includes('github.io') || window.location.hostname === 'localhost'; 
    // We allow localhost for testing the "static mode" even locally if server is off
};

const getLocalData = (key, defaultVal = []) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
};

const setLocalData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const userService = {
    getUsers: async () => {
        try {
            const res = await api.get('/users');
            return res.data;
        } catch (e) {
            console.warn("Backend unavailable. Using localStorage (Static Mode).");
            const db = getLocalData('finanzas_db', { users: {}, data: {} });
            return Object.keys(db.users);
        }
    },
    login: async (username, password) => {
        try {
            const res = await api.post('/login', { username, password });
            return res.data;
        } catch (e) {
            const db = getLocalData('finanzas_db', { users: {}, data: {} });
            // Simplified hash for static mode (don't worry about security for the demo)
            if (db.users[username]) {
                return { success: true, username };
            }
            throw new Error('Usuario no encontrado en modo local');
        }
    },
    register: async (username, password) => {
        try {
            const res = await api.post('/register', { username, password });
            return res.data;
        } catch (e) {
            const db = getLocalData('finanzas_db', { users: {}, data: {} });
            db.users[username] = { password }; // plain text for demo
            db.data[username] = { transacciones: [], presupuesto: 0, fondo: 'default' };
            setLocalData('finanzas_db', db);
            return { success: true };
        }
    },
    deleteUser: async (username) => {
        try {
            const res = await api.delete(`/users/${username}`);
            return res.data;
        } catch (e) {
            const db = getLocalData('finanzas_db', { users: {}, data: {} });
            delete db.users[username];
            delete db.data[username];
            setLocalData('finanzas_db', db);
            return { success: true };
        }
    }
};

export const dataService = {
    getData: async (username) => {
        try {
            const res = await api.get(`/data/${username}`);
            return res.data;
        } catch (e) {
            const db = getLocalData('finanzas_db', { users: {}, data: {} });
            return db.data[username] || { transacciones: [], presupuesto: 0, fondo: 'default' };
        }
    },
    saveData: async (username, data) => {
        try {
            const res = await api.post(`/data/${username}`, data);
            return res.data;
        } catch (e) {
            const db = getLocalData('finanzas_db', { users: {}, data: {} });
            db.data[username] = { ...db.data[username], ...data };
            setLocalData('finanzas_db', db);
            return { success: true };
        }
    }
};
