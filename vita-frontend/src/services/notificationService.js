// Caminho: vita-frontend/src/services/notificationService.js

import api from "./api";

/**
 * Busca todas as notificações recebidas pelo usuário logado.
 */
export const getReceivedNotifications = async () => {
    try {
        const response = await api.get("/notification/received");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar notificações recebidas:", error);
        throw error;
    }
};

/**
 * Busca todas as notificações enviadas pelo usuário logado.
 */
export const getSentNotifications = async () => {
    try {
        const response = await api.get("/notification/sended");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar notificações enviadas:", error);
        throw error;
    }
};

/**
 * Marca uma notificação específica como lida.
 * @param {string} notificationId - O ID da notificação.
 */
export const markAsRead = async (notificationId) => {
    try {
        const response = await api.put(`/notification/read/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error(
            `Erro ao marcar notificação ${notificationId} como lida:`,
            error
        );
        throw error;
    }
};

/**
 * Deleta uma notificação específica.
 * @param {string} notificationId - O ID da notificação.
 */
export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/notification/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar notificação ${notificationId}:`, error);
        throw error;
    }
};

export const markAllAsRead = async () => {
    try {
        // Esta função chama o novo endpoint do backend
        const response = await api.put("/notification/read/all");
        return response.data;
    } catch (error) {
        console.error(
            "Erro ao marcar todas as notificações como lidas:",
            error
        );
        throw error;
    }
};
