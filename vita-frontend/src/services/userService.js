import api from "./api";

export const getAllUsers = async () => {
    try {
        const response = await api.get("/user"); // Requer um endpoint GET /user no backend
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar todos os usuários:", error);
        throw error;
    }
};

/**
 * Atualiza os dados de um usuário.
 * @param {number} userId - O ID do usuário a ser atualizado.
 * @param {object} userData - Os novos dados do usuário.
 * @returns {Promise<object>} O objeto do usuário atualizado.
 */
export const updateUser = async (userId, userData) => {
    try {
        // O método PATCH atualiza apenas os campos enviados.
        const response = await api.patch(`/users/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar usuário com ID ${userId}:`, error);
        throw error; // Lança o erro para ser tratado no componente.
    }
};

/**
 * Atualiza o email e/ou senha de um usuário.
 * @param {string} userId - O ID do usuário (da coleção 'users').
 * @param {object} credentials - Objeto com { email, password }.
 */
export const resetEmailPassword = async (userId, credentials) => {
    try {
        const response = await api.post(
            `/user/resetemailpassword/${userId}`,
            credentials
        );
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar email/senha:", error);
        throw error;
    }
};
