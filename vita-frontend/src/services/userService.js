import api from "./api";

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
