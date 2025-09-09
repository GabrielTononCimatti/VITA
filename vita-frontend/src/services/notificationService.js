import api from "./api";

/**
 * Busca todas as notificações para um usuário específico.
 * @param {number} userId O ID do usuário logado.
 * @returns {Promise<Array>} Lista de notificações, ordenadas das mais novas para as mais antigas.
 */
export const getNotificationsForUser = async (userId) => {
    try {
        // Busca notificações para o usuário e ordena pela data de criação
        const response = await api.get(
            `/notifications?userId=${userId}&_sort=createdAt&_order=desc`
        );
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        return [];
    }
};

/**
 * Marca uma notificação específica como lida.
 * @param {number} notificationId O ID da notificação.
 * @returns {Promise<object>} A notificação atualizada.
 */
export const markNotificationAsRead = (notificationId) => {
    return api.patch(`/notifications/${notificationId}`, { read: true });
};

/**
 * Cria uma nova notificação no sistema.
 * @param {object} notificationData O objeto da notificação.
 * @returns {Promise<object>} A notificação criada.
 */
export const createNotification = (notificationData) => {
    const dataWithTimestamp = {
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString(),
    };
    return api.post("/notifications", dataWithTimestamp);
};

/**
 * Busca todas as notificações para um projeto específico.
 * @param {string} projectId O ID do projeto.
 * @returns {Promise<Array>} Lista de notificações do projeto.
 */
export const getNotificationsForProject = async (projectId) => {
    try {
        const response = await api.get(
            `/notifications?projectId=${projectId}&_sort=createdAt&_order=desc`
        );
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar notificações do projeto:", error);
        return [];
    }
};
