import api from "./api";

export const getAllPeople = async () => {
    try {
        const response = await api.get("/person");
        return response.data;
        // const [usersResponse, clientsResponse] = await Promise.all([
        //     api.get("/users"),
        //     api.get("/clients"),
        // ]);
        // return { users: usersResponse.data, clients: clientsResponse.data };
    } catch (error) {
        console.error("Erro ao buscar pessoas:", error);
        throw error;
    }
};

/**
 * Busca uma pessoa específica pelo seu ID.
 * @param {string} id - O ID da pessoa.
 */
export const getPersonById = async (id) => {
    try {
        const response = await api.get(`/person/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar pessoa com ID ${id}:`, error);
        throw error;
    }
};

/**
 * Cria uma nova pessoa (pré-cadastro feito pelo admin).
 * @param {object} personData - Os dados da nova pessoa.
 */
export const createPerson = async (personData) => {
    try {
        const response = await api.post("/person", personData);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar a pessoa:", error);
        throw error;
    }
};

/**
 * Atualiza os dados de uma pessoa existente.
 * @param {string} id - O ID da pessoa a ser atualizada.
 * @param {object} personData - Os novos dados da pessoa.
 */
export const updatePerson = async (id, personData) => {
    try {
        const response = await api.put(`/person/${id}`, personData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar a pessoa com ID ${id}:`, error);
        throw error;
    }
};

/**
 * Deleta uma pessoa.
 * @param {string} id - O ID da pessoa a ser deletada.
 */
export const deletePerson = async (id) => {
    try {
        const response = await api.delete(`/person/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar a pessoa com ID ${id}:`, error);
        throw error;
    }
};

// Pré-regista qualquer pessoa (cliente, funcionário, admin) na tabela `/users`
export const preRegisterPerson = async (personData) => {
    const { personType, ...dataToSave } = personData;
    const finalData = {
        ...dataToSave,
        id: Date.now().toString(), // Garante um ID de texto único
    };

    try {
        if (finalData.role === "client") {
            // CORREÇÃO: Se for um cliente, fazemos duas chamadas em simultâneo.

            // 1. Criamos a entrada na tabela 'users' para autenticação.
            const userPromise = api.post("/users", finalData);

            // 2. Criamos a entrada na tabela 'clients' para dados específicos de cliente.
            const clientPromise = api.post("/clients", finalData);

            // Aguardamos que ambas as operações terminem
            await Promise.all([userPromise, clientPromise]);

            // Retornamos os dados para a geração do link de registo
            return finalData;
        } else {
            // Para 'employee' e 'admin', o comportamento mantém-se: criar apenas em 'users'.
            const response = await api.post("/users", finalData);
            return response.data;
        }
    } catch (error) {
        console.error("Erro no pré-registo:", error);
        throw error;
    }
};

// Finaliza o registo de qualquer pessoa na tabela `/users`
export const completeRegistration = async (userId, role, registrationData) => {
    const endpoint = `/users/${userId}`;
    try {
        const response = await api.patch(endpoint, registrationData);
        return response.data;
    } catch (error) {
        console.error("Erro ao completar registo:", error);
        throw error;
    }
};

export const getAdmins = async () => {
    try {
        const response = await api.get("/users?role=admin");
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar administradores:", error);
        return [];
    }
};

/**
 * Finaliza o registro de um usuário.
 * @param {string} token - O token de registro (userID) da URL.
 * @param {object} userData - Objeto com email e password.
 */
export const registerUser = async (token, userData) => {
    try {
        // Faz a chamada POST para a rota de registro do backend
        const response = await api.post(`/user/register/${token}`, userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        throw error;
    }
};
