import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { getProjectsForUser } from "../../../services/projectService";
import StatCard from "../../../components/cards/StatCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { FaBell } from "react-icons/fa";
import ProjectNotificationsPanel from "../../../components/layout/ProjectNotificationsPanel";

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const CardsContainer = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.large};
    margin-bottom: ${({ theme }) => theme.spacing.large};
    flex-wrap: wrap; // Garante que os cards quebrem a linha em telas menores
`;

const TableWrapper = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.large};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow-x: auto; // Permite scroll horizontal em telas pequenas
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
    }

    th {
        background-color: #f8f9fa;
        font-weight: bold;
        color: ${({ theme }) => theme.colors.primary};
    }

    tbody tr {
        cursor: pointer;
        &:hover {
            background-color: #f1f1f1;
        }
    }
`;

const StatusBadge = styled.span`
    padding: 5px 10px;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.white};
    font-weight: bold;
    font-size: 12px;
    background-color: ${({ theme, status }) => {
        switch (status) {
            case "Em Andamento":
                return theme.colors.gray;
            case "Concluído":
                return theme.colors.green;
            case "Atrasado":
                return theme.colors.yellow;
            default:
                return "#ccc";
        }
    }};
    color: ${({ status, theme }) =>
        status === "Atrasado" ? theme.colors.black : theme.colors.white};
`;

const ButtonsContainer = styled.div`
    margin-top: ${({ theme }) => theme.spacing.large};
    display: flex;
    justify-content: center;
`;

const ActionButton = styled.button`
    padding: 12px 24px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
`;

const HomePage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // useEffect(() => {
    //     if (user) {
    //         const loadProjects = async () => {
    //             const data = await getProjectsForUser(user);

    //             console.log("DADOS VINDOS DA API:", data);

    //             // 1. Filtra para remover os concluídos
    //             const activeProjects = data.filter(
    //                 (p) => p.status !== "Concluído"
    //             );

    //             // 2. Ordena pelos mais antigos primeiro (data de início)
    //             const sortedProjects = activeProjects.sort(
    //                 (a, b) => new Date(a.startDate) - new Date(b.startDate)
    //             );

    //             // 3. Pega apenas os 5 primeiros
    //             setProjects(sortedProjects.slice(0, 5));
    //         };
    //         loadProjects();
    //     }
    // }, [user]);

    // const projectCounts = useMemo(() => {
    //     return projects.reduce((acc, project) => {
    //         acc[project.status] = (acc[project.status] || 0) + 1;
    //         return acc;
    //     }, {});
    // }, [projects]);

    const [allProjects, setAllProjects] = useState([]); // NOVO: Estado para todos os projetos
    const [recentProjects, setRecentProjects] = useState([]); // NOVO: Estado para projetos recentes

    useEffect(() => {
        if (user) {
            const loadProjects = async () => {
                const data = await getProjectsForUser(user);
                setAllProjects(data); // Guarda todos os projetos para os cards

                // Filtra e ordena apenas para a lista de "Projetos Recentes"
                const activeProjects = data.filter(
                    (p) => p.status !== "Concluído"
                );
                const sortedProjects = activeProjects.sort(
                    (a, b) => new Date(a.startDate) - new Date(b.startDate)
                );
                setRecentProjects(sortedProjects.slice(0, 5));
            };
            loadProjects();
        }
    }, [user]);

    const projectCounts = useMemo(() => {
        // Agora faz a contagem a partir de TODOS os projetos
        return allProjects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {});
    }, [allProjects]);

    const handleRowClick = (projectId) => {
        // Futuramente, navegará para a tela de detalhes do projeto
        alert(`Redirecionando para o projeto com ID: ${projectId}`);
        navigate(`/employee/projeto/${projectId}`);
    };

    const handleNotificationClick = (project, event) => {
        event.stopPropagation(); // Impede que o clique na linha seja acionado
        setSelectedProject(project);
        setIsPanelOpen(true);
    };

    return (
        <div>
            <Title>Início</Title>

            <CardsContainer>
                <StatCard
                    title="Projetos em Andamento"
                    count={projectCounts["Em Andamento"] || 0}
                    color="#E0E0E0"
                />
                <StatCard
                    title="Projetos em Atraso"
                    count={projectCounts["Atrasado"] || 0}
                    color="#FFD700"
                />
                <StatCard
                    title="Projetos Concluídos"
                    count={projectCounts["Concluído"] || 0}
                    color="#2E8B57"
                />
            </CardsContainer>

            <Title as="h2" style={{ fontSize: "24px" }}>
                Projetos Recentes
            </Title>
            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Projeto</th>
                            <th>Cliente</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th>Notificações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentProjects.map(
                            (
                                project // Mostrando apenas os 5 primeiros
                            ) => (
                                <tr
                                    key={project.id}
                                    onClick={() => handleRowClick(project.id)}
                                >
                                    <td>{project.id}</td>
                                    <td>{project.name}</td>
                                    <td>
                                        {project.client?.name ||
                                            project.client?.razaoSocial ||
                                            "N/A"}
                                    </td>
                                    <td>{project.client?.phone || "N/A"}</td>
                                    <td>
                                        <StatusBadge status={project.status}>
                                            {project.status}
                                        </StatusBadge>
                                    </td>
                                    <td
                                        onClick={(e) =>
                                            handleNotificationClick(project, e)
                                        }
                                    >
                                        <FaBell
                                            style={{
                                                cursor: "pointer",
                                                fontSize: "18px",
                                            }}
                                        />
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </StyledTable>
            </TableWrapper>

            <ButtonsContainer>
                <ActionButton onClick={() => navigate("/employee/pesquisa")}>
                    Ver Todos os Projetos
                </ActionButton>
            </ButtonsContainer>

            {selectedProject && (
                <ProjectNotificationsPanel
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                />
            )}
        </div>
    );
};

export default HomePage;
