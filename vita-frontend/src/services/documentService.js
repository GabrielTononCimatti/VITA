import api from "./api";

// export const getDocumentsForStep = async (projectId, etapaId) => {
//     try {
//         const response = await api.get(
//             `/documents?projectId=${projectId}&etapaId=${etapaId}`
//         );
//         return response.data;
//     } catch (error) {
//         console.error("Erro ao buscar documentos:", error);
//         return [];
//     }
// };

export const getDocumentsForStep = (projectId, etapaId) =>
    api.get(`/documents?projectId=${projectId}&etapaId=${etapaId}`);

export const addDocument = async (documentData) => {
    try {
        const response = await api.post("/documents", documentData);
        return response.data;
    } catch (error) {
        console.error("Erro ao adicionar documento:", error);
        throw error;
    }
};

export const deleteDocument = async (documentId) => {
    try {
        const response = await api.delete(`/documents/${documentId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao deletar documento:", error);
        throw error;
    }
};
