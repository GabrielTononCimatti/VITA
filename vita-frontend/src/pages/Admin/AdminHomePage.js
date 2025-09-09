// Caminho: vita-frontend/src/pages/Admin/AdminHomePage.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAllProjects } from "../../services/projectService";
import { getAllPeople } from "../../services/peopleService";
import { getAllUsers } from "../../services/userService"; // NOVO: Importando o serviço de usuários
import { getDisplayName } from "../../utils/peopleUtils";
import StatCard from "../../components/cards/StatCard";
import { FaBell } from "react-icons/fa";
import ProjectNotificationsPanel from "../../components/layout/ProjectNotificationsPanel";

// --- Styled Components (Seus componentes mantidos) ---
const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;
// ... (O restante dos seus styled-components permanece igual)
const CardsContainer = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.large};
    margin-bottom: ${({ theme }) => theme.spacing.large};
    flex-wrap: wrap;
`;

const TableWrapper = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.large};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    overflow-x: auto;
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
    font-weight: bold;
    font-size: 12px;
    background-color: ${({ theme, status }) => {
        const s = String(status || "").toLowerCase();
        if (s.includes("andam") || s.includes("em andamento"))
            return theme.colors.gray;
        if (s.includes("final") || s.includes("conclu"))
            return theme.colors.green;
        if (s.includes("atras")) return theme.colors.yellow;
        return "#ccc";
    }};
    color: ${({ status, theme }) =>
        String(status || "")
            .toLowerCase()
            .includes("atras")
            ? theme.colors.black
            : theme.colors.white};
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

// --- Helpers ---
const stripRef = (ref) => {
    if (!ref || typeof ref !== "string") return null;
    return ref.includes("/") ? ref.split("/").pop() : ref;
};

// --- Componente ---
const AdminHomePage = () => {
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [users, setUsers] = useState([]); // NOVO: Estado para a lista de usuários
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // NOVO: Buscando projetos, pessoas E usuários
                const [projectsData, peopleData, usersData] = await Promise.all(
                    [getAllProjects(), getAllPeople(), getAllUsers()]
                );
                setProjects(projectsData || []);
                setPeople(peopleData || []);
                setUsers(usersData || []); // Armazena os usuários no estado
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar os dados.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const projectsWithData = useMemo(() => {
        if (!projects?.length || !people?.length || !users?.length) return [];

        return projects.map((project) => {
            const client = people.find(
                (p) => p.id === stripRef(project.clientID)
            );

            // CORREÇÃO: Lógica de busca do funcionário em duas etapas
            const employeeUser = users.find(
                (u) => u.id === stripRef(project.employeeID)
            );
            const employeePerson = employeeUser
                ? people.find((p) => p.id === stripRef(employeeUser.personID))
                : null;

            return {
                ...project,
                client: client || null,
                employee: employeePerson || null, // O resultado da busca de duas etapas
            };
        });
    }, [projects, people, users]);

    // A lógica de projectStats e recentProjects continua a mesma e funcionará com os dados corretos
    const projectStats = useMemo(() => {
        return projectsWithData.reduce(
            (acc, project) => {
                const s = String(project.status || "").toLowerCase();
                if (s.includes("final") || s.includes("conclu"))
                    acc.completed++;
                else if (s.includes("atras")) acc.delayed++;
                else if (s.includes("andam") || s.includes("em andamento"))
                    acc.inProgress++;
                return acc;
            },
            { inProgress: 0, delayed: 0, completed: 0 }
        );
    }, [projectsWithData]);

    const recentProjects = useMemo(() => {
        return projectsWithData
            .slice()
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5);
    }, [projectsWithData]);

    const handleRowClick = (projectId) =>
        navigate(`/admin/projeto/${projectId}`);

    const handleNotificationClick = (project, e) => {
        e.stopPropagation();
        setSelectedProject(project);
        setIsPanelOpen(true);
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div>
            <Title>Início</Title>
            <CardsContainer>
                <StatCard
                    title="Projetos em Andamento"
                    count={projectStats.inProgress}
                    color="#E0E0E0"
                />
                <StatCard
                    title="Projetos em Atraso"
                    count={projectStats.delayed}
                    color="#FFD700"
                />
                <StatCard
                    title="Projetos Concluídos"
                    count={projectStats.completed}
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
                            <th>Funcionário</th>
                            <th>Status</th>
                            <th>Notificações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentProjects.map((project) => (
                            <tr
                                key={project.id}
                                onClick={() => handleRowClick(project.id)}
                            >
                                <td>{project.id}</td>
                                <td>{project.name}</td>
                                <td>
                                    {project.client
                                        ? getDisplayName(project.client)
                                        : "N/A"}
                                </td>
                                <td>
                                    {project.employee
                                        ? getDisplayName(project.employee)
                                        : "N/A"}
                                </td>
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
                        ))}
                    </tbody>
                </StyledTable>
            </TableWrapper>

            <ButtonsContainer>
                <ActionButton onClick={() => navigate("/admin/pesquisa")}>
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

export default AdminHomePage;
