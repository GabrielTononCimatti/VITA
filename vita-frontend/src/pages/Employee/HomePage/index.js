// Caminho: vita-frontend/src/pages/Employee/HomePage/index.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAllProjects } from "../../../services/projectService";
import { getDisplayName } from "../../../utils/peopleUtils";
import { useAuth } from "../../../contexts/AuthContext"; // Para pegar o funcionário logado
import StatCard from "../../../components/cards/StatCard";
import ProjectNotificationsPanel from "../../../components/layout/ProjectNotificationsPanel";
import { FaBell } from "react-icons/fa";

// --- Styled Components (Preservados) ---
const HomePageWrapper = styled.div`
    padding: 24px;
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
`;

const RecentProjects = styled.div`
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
    margin-top: 0;
    margin-bottom: 20px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    th,
    td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #f1f1f1;
    }
    th {
        font-weight: bold;
        color: #800020;
    }
    tbody tr {
        cursor: pointer;
        &:hover {
            background-color: #f9f9f9;
        }
    }
`;

const StatusBadge = styled.span`
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    background-color: ${({ status }) => {
        switch (status) {
            case "Em andamento":
                return "#6c757d";
            case "Atrasado":
                return "#ffc107";
            case "Finalizado":
                return "#28a745";
            default:
                return "#6c757d";
        }
    }};
`;

// --- Componente da Página ---
const HomePage = () => {
    const { user } = useAuth(); // Pega o usuário (funcionário) logado
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectsData = await getAllProjects();
                setAllProjects(projectsData || []);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError("Não foi possível carregar os projetos.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // NOVO: Filtra os projetos para mostrar apenas os do funcionário logado
    const employeeProjects = useMemo(() => {
        if (!allProjects.length || !user) return [];
        return allProjects.filter((item) =>
            item.project?.employeeID?.includes(user.id)
        );
    }, [allProjects, user]);

    const projectStats = useMemo(() => {
        return employeeProjects.reduce(
            (acc, item) => {
                const status = item.project?.status || "";
                if (status === "Finalizado") {
                    acc.completed++;
                } else if (status === "Atrasado") {
                    acc.delayed++;
                } else if (status === "Em andamento") {
                    acc.inProgress++;
                }
                return acc;
            },
            { inProgress: 0, delayed: 0, completed: 0 }
        );
    }, [employeeProjects]);

    const recentProjects = useMemo(() => {
        return employeeProjects
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.project.startDate) -
                    new Date(a.project.startDate)
            )
            .slice(0, 5);
    }, [employeeProjects]);

    const handleNotificationClick = (project, e) => {
        e.stopPropagation();
        setSelectedProject(project); // Passa o objeto do projeto para o painel
        setIsPanelOpen(true);
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <HomePageWrapper>
            <StatsContainer>
                <StatCard
                    title="Seus Projetos em Andamento"
                    count={projectStats.inProgress}
                    color="#E0E0E0"
                />
                <StatCard
                    title="Seus Projetos em Atraso"
                    count={projectStats.delayed}
                    color="#FFD700"
                />
                <StatCard
                    title="Seus Projetos Concluídos"
                    count={projectStats.completed}
                    color="#2E8B57"
                />
            </StatsContainer>
            <RecentProjects>
                <SectionTitle>Seus Projetos Recentes</SectionTitle>
                <Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Projeto</th>
                            <th>Cliente</th>
                            <th>Data de Início</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentProjects.map((item) => (
                            <tr
                                key={item.project.id}
                                onClick={() =>
                                    navigate(
                                        `/employee/projeto/${item.project.id}`
                                    )
                                }
                            >
                                <td>{item.project.id}</td>
                                <td>{item.project.name}</td>
                                <td>
                                    {item.client
                                        ? getDisplayName(item.client.personData)
                                        : "N/A"}
                                </td>
                                <td>
                                    {new Date(
                                        item.project.startDate
                                    ).toLocaleDateString()}
                                </td>
                                <td>
                                    <StatusBadge status={item.project.status}>
                                        {item.project.status}
                                    </StatusBadge>
                                </td>
                                <td
                                    onClick={(e) =>
                                        handleNotificationClick(item.project, e)
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
                </Table>
            </RecentProjects>
            {selectedProject && (
                <ProjectNotificationsPanel
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                />
            )}
        </HomePageWrapper>
    );
};

export default HomePage;
