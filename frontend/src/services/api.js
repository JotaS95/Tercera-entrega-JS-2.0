import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
});

export default api;

export const userService = {
    getUsers: async () => {
        const res = await api.get('/users');
        return res.data;
    },
    login: async (username, password) => {
        const res = await api.post('/login', { username, password });
        return res.data;
    },
    register: async (username, password) => {
        const res = await api.post('/register', { username, password });
        return res.data;
    },
    deleteUser: async (username) => {
        const res = await api.delete(`/users/${username}`);
        return res.data;
    }
};

export const dataService = {
    getData: async (username) => {
        const res = await api.get(`/data/${username}`);
        return res.data;
    },
    saveData: async (username, data) => {
        const res = await api.post(`/data/${username}`, data);
        return res.data;
    }
};
