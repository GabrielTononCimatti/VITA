// Caminho: vita-frontend/src/services/api.js

import axios from "axios";
import { auth } from "./firebase"; // Assumindo que você tem um services/firebase.js

const api = axios.create({
    baseURL: "http://localhost:5000", // Certifique-se que a porta está correta
});

// Este interceptor adiciona o token do Firebase a cada requisição
api.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error(
                    "Não foi possível obter o token de autenticação",
                    error
                );
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
