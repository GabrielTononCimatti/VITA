import api from "./api";

export const getClients = async () => {
    try {
        const response = await api.get("/clients");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        return [];
    }
};
