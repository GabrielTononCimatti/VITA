// Caminho: vita-frontend/src/pages/Client/ClientHomePage.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAllProjects } from "../../services/projectService";
import { useAuth } from "../../contexts/AuthContext";
import { getDisplayName } from "../../utils/peopleUtils";
import StatCard from "../../components/cards/StatCard";
import { FaBell } from "react-icons/fa";
import ProjectNotificationsPanel from "../../components/layout/ProjectNotificationsPanel";

// --- Styled Components (mantidos) ---
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
            case "Em atraso":
                return "#ffc107";
            case "Finalizado":
                return "#28a745";
            default:
                return "#6c757d";
        }
    }};
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

// --- Componente da Página ---
const ClientHomePage = () => {
    const { user } = useAuth(); // Pega o cliente logado
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectsData = await getAllProjects();
                setAllProjects(projectsData || []);
            } catch (err) {
                console.error("Erro ao buscar projetos:", err);
                setError("Não foi possível carregar seus projetos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtra para mostrar apenas projetos DESTE cliente
    const clientProjects = useMemo(() => {
        if (!allProjects.length || !user || !user.personID) return [];

        const userPersonId = stripRef(user.personID);
        return allProjects.filter(
            (item) => stripRef(item.project?.clientID) === userPersonId
        );
    }, [allProjects, user]);

    const projectStats = useMemo(() => {
        return clientProjects.reduce(
            (acc, item) => {
                const status = item.project?.status || "";
                if (status === "Finalizado") acc.completed++;
                else if (status === "Em atraso") acc.delayed++;
                else if (status === "Em andamento") acc.inProgress++;
                return acc;
            },
            { inProgress: 0, delayed: 0, completed: 0 }
        );
    }, [clientProjects]);

    const recentProjects = useMemo(() => {
        return clientProjects
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.project.startDate) -
                    new Date(a.project.startDate)
            )
            .slice(0, 5);
    }, [clientProjects]);

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
                    title="Projetos Finalizados"
                    count={projectStats.completed}
                    color="#2E8B57"
                />
            </StatsContainer>
            <RecentProjects>
                <SectionTitle>Seus Projetos</SectionTitle>
                <Table>
                    <thead>
                        <tr>
                            <th>Nome do Projeto</th>
                            <th>Responsável (Vulcano)</th>
                            <th>Data de Início</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientProjects.length > 0 ? (
                            recentProjects.map((item) => (
                                <tr
                                    key={item.project.id}
                                    onClick={() =>
                                        navigate(
                                            `/client/projeto/${item.project.id}`
                                        )
                                    }
                                >
                                    <td>{item.project.name}</td>
                                    <td>
                                        {item.employee
                                            ? getDisplayName(
                                                  item.employee.personData
                                              )
                                            : "N/A"}
                                    </td>
                                    <td>
                                        {new Date(
                                            item.project.startDate
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <StatusBadge
                                            status={item.project.status}
                                        >
                                            {item.project.status}
                                        </StatusBadge>
                                    </td>
                                    <td
                                        onClick={(e) =>
                                            handleNotificationClick(
                                                item.project,
                                                e
                                            )
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: "center" }}>
                                    Você ainda não possui projetos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                <ButtonsContainer>
                    <ActionButton onClick={() => navigate("/client/pesquisa")}>
                        Ver Todos os Projetos
                    </ActionButton>
                </ButtonsContainer>
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

export default ClientHomePage;
