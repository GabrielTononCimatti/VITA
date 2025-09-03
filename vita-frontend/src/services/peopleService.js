import api from "./api";

export const getAllPeople = async () => {
    try {
        const response = await api.get("/users");
        return response.data;
        // const [usersResponse, clientsResponse] = await Promise.all([
        //     api.get("/users"),
        //     api.get("/clients"),
        // ]);
        // return { users: usersResponse.data, clients: clientsResponse.data };
    } catch (error) {
        console.error("Erro ao buscar pessoas:", error);
        return { users: [], clients: [] }; // Retorna listas vazias em caso de erro
    }
};

export const getPersonById = async (personId) => {
    try {
        const response = await api.get(`/users/${personId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar pessoa com ID ${personId}:`, error);
        return null;
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

// Atualiza o perfil de qualquer pessoa na tabela `/users`
export const updatePerson = async (person, dataToUpdate) => {
    const endpoint = `/users/${person.id}`;
    try {
        const response = await api.patch(endpoint, dataToUpdate);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar pessoa:", error);
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
