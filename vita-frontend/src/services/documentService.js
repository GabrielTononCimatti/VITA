// Caminho: vita-frontend/src/services/documentService.js

import api from "./api";

/**
 * Busca todos os documentos associados a uma etapa específica de um projeto.
 * @param {string} projectId - O ID do projeto.
 * @param {string} stageId - O ID da etapa.
 */
export const getDocumentsByStage = async (projectId, stageId) => {
    try {
        // CORREÇÃO: Usando a URL correta com projectId e stageId
        const response = await api.get(
            `/document/project/${projectId}/stage/${stageId}`
        );

        console.log("To recebendo: ", response.data);

        return response.data;
    } catch (error) {
        console.error(
            `Erro ao buscar documentos para a etapa ${stageId}:`,
            error
        );
        throw error;
    }
};

/**
 * Adiciona um novo documento do tipo LINK.
 * @param {object} data - Contém name, url, description, stageID.
 */
export const addDocumentLink = async (linkData) => {
    try {
        const response = await api.post("/document/link", linkData);
        return response.data;
    } catch (error) {
        console.error("Erro ao adicionar documento de link:", error);
        throw error;
    }
};

/**
 * Adiciona um novo documento do tipo ARQUIVO.
 * @param {FormData} formData - Objeto FormData contendo o arquivo e outros dados.
 */
export const addDocumentFile = async (formData) => {
    try {
        const response = await api.post("/document", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("Erro ao adicionar documento de arquivo:", error);
        throw error;
    }
};

/**
 * Deleta um documento.
 * @param {string} documentId - O ID do documento a ser deletado.
 */
export const deleteDocument = async (documentId) => {
    try {
        const response = await api.delete(`/document/${documentId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar o documento ${documentId}:`, error);
        throw error;
    }
};
