import api from "./api";
import { createNotification } from "./notificationService";

/**
 * Busca todos os projetos. Futuramente, pode receber filtros como parâmetros.
 * @returns {Promise<Array>} Uma promessa que resolve para um array de projetos.
 */

const fetchAndAssociateData = async (projectPromise) => {
    try {
        const [projectsResponse, usersResponse] = await Promise.all([
            projectPromise,
            api.get("/users"),
        ]);

        const projects = projectsResponse.data;
        const users = usersResponse.data;
        const userMap = users.reduce((map, user) => {
            map[user.id] = user;
            return map;
        }, {});

        return projects.map((project) => ({
            ...project,
            client: userMap[project.clientId],
            employee: userMap[project.employeeId],
        }));
    } catch (error) {
        console.error("Erro ao buscar e associar dados de projetos:", error);
        return [];
    }
};

export const getProjectsForUser = async (user) => {
    if (!user) return [];
    const filter =
        user.role === "employee"
            ? `employeeId=${user.id}`
            : `clientId=${user.id}`;
    return fetchAndAssociateData(api.get(`/projects?${filter}`));
};

// Busca TODOS os projetos para o admin
export const getAllProjectsWithData = async () => {
    return fetchAndAssociateData(api.get("/projects"));
};

// export const getProjectsForUser = async (user) => {
//     if (!user) return [];

//     // Define o filtro e o que expandir com base no perfil
//     const filter =
//         user.role === "employee"
//             ? `employeeId=${user.id}`
//             : `clientId=${user.id}`;

//     // try {
//     //     // 1. Fazemos duas chamadas à API em simultâneo para otimizar o tempo.
//     //     // const [projectsResponse, usersResponse] = await Promise.all([
//     //     //     api.get(`/projects?${filter}`),
//     //     //     api.get("/users"),
//     //     // ]);
//     //     const projectsResponse = await api.get(`/projects?${filter}`);
//     //     const projects = projectsResponse.data;

//     //     // const users = usersResponse.data;
//     //     const [usersResponse, clientsResponse] = await Promise.all([
//     //         api.get("/users"),
//     //         api.get("/clients"),
//     //     ]);

//     //     const userMap = usersResponse.data.reduce((map, u) => {
//     //         map[u.id] = u;
//     //         return map;
//     //     }, {});

//     //     const clientMap = clientsResponse.data.reduce((map, c) => {
//     //         map[c.id] = c;
//     //         return map;
//     //     }, {});

//     //     // Junta os dados manualmente para garantir
//     //     const projectsWithData = projects.map((project) => ({
//     //         ...project,
//     //         client: userMap[project.clientId],
//     //         employee: userMap[project.employeeId],
//     //     }));

//     //     return projectsWithData;
//     // } catch (error) {
//     //     console.error(
//     //         "Erro ao buscar e combinar dados de projetos e clientes:",
//     //         error
//     //     );
//     //     return [];
//     // }
// };

// export const getAllProjectsWithData = async () => {
//     try {
//         // Busca todos os projetos e expande tanto o cliente como o funcionário
//         const [projectsResponse, usersResponse, clientsResponse] =
//             await Promise.all([
//                 api.get("/projects"),
//                 api.get("/users"),
//                 api.get("/clients"),
//             ]);

//         const projects = projectsResponse.data;
//         const users = usersResponse.data;
//         const clients = clientsResponse.data;

//         // Criamos mapas para facilitar a busca
//         const userMap = users.reduce((map, u) => {
//             map[u.id] = u;
//             return map;
//         }, {});
//         const clientMap = clients.reduce((map, c) => {
//             map[c.id] = c;
//             return map;
//         }, {});

//         // Juntamos os dados manualmente
//         const projectsWithData = projects.map((project) => ({
//             ...project,
//             employee: userMap[project.employeeId],
//             client: clientMap[project.clientId],
//         }));

//         return projectsWithData;
//     } catch (error) {
//         console.error("Erro ao buscar todos os projetos:", error);
//         return [];
//     }
// };

/**
 * Busca um projeto específico pelo seu ID.
 * @param {string} projectId - O ID do projeto.
 * @returns {Promise<Object|null>} O objeto do projeto ou null se não for encontrado.
 */
export const getProjectById = async (projectId) => {
    try {
        // Antigo.
        const response = await api.get(`/projects/${projectId}?_expand=client`);
        // const response = await api.get(`/projects?_expand=client`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar projeto com ID ${projectId}:`, error);
        return null;
    }
};

/**
 * Cria um novo projeto no back-end.
 * @param {object} projectData - O objeto completo do projeto, incluindo as etapas.
 * @returns {Promise<object>} O projeto recém-criado.
 */
export const createProject = async (projectData) => {
    try {
        const response = await api.post("/projects", projectData);
        const createdProject = response.data;
        const initialStepName =
            createdProject.steps[0]?.name || "etapa inicial";

        const message = `O projeto "${createdProject.name}" foi criado e está na etapa de "${initialStepName}".`;

        await createNotification({
            userId: projectData.employeeId, // Supondo que o criador é o funcionário
            message,
            projectId: createdProject.id,
        });

        await createNotification({
            userId: createdProject.clientId,
            message,
            projectId: createdProject.id,
        });

        // Notificar todos os administradores
        const usersResponse = await api.get("/users?role=admin");
        const admins = usersResponse.data;
        for (const admin of admins) {
            await createNotification({
                userId: admin.id,
                message,
                projectId: createdProject.id,
            });
        }

        return createdProject;
    } catch (error) {
        console.error("Erro ao criar projeto:", error);
        throw error;
    }
};

/**
 * Atualiza um projeto existente.
 * @param {string} projectId - O ID do projeto a ser atualizado.
 * @param {object} projectUpdateData - Os campos a serem atualizados.
 * @returns {Promise<object>} O projeto atualizado.
 */
export const updateProject = async (projectId, projectUpdateData) => {
    try {
        const originalProjectResponse = await api.get(`/projects/${projectId}`);
        const originalProject = originalProjectResponse.data;

        const response = await api.patch(
            `/projects/${projectId}`,
            projectUpdateData
        );
        const updatedProject = response.data;

        if (projectUpdateData.activeStepIndex !== undefined) {
            const newStepIndex = updatedProject.activeStepIndex;
            const oldStepIndex = originalProject.activeStepIndex;

            const actionText =
                newStepIndex > oldStepIndex ? "avançou" : "regrediu";

            const currentStep =
                updatedProject.steps[updatedProject.activeStepIndex];
            const message = `O projeto "${updatedProject.name}" ${actionText} para a etapa "${currentStep.name}".`;

            // Notificação para o funcionário
            await createNotification({
                userId: updatedProject.employeeId,
                message,
                projectId,
            });
            // Notificação para o cliente
            await createNotification({
                userId: updatedProject.clientId,
                message,
                projectId,
            });

            const usersResponse = await api.get("/users");
            const admins = usersResponse.data.filter((u) => u.role === "admin");
            for (const admin of admins) {
                await createNotification({
                    userId: admin.id,
                    message,
                    projectId,
                });
            }
        }

        // return response.data;
        return updatedProject;
    } catch (error) {
        console.error(`Erro ao atualizar projeto ${projectId}:`, error);
        throw error;
    }
};
