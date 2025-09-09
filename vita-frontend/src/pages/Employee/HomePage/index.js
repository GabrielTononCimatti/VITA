// Caminho: vita-frontend/src/pages/Employee/HomePage/index.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAllProjects } from "../../../services/projectService";
import { getAllPeople } from "../../../services/peopleService"; // NOVO: Importando o serviço de pessoas
import { getDisplayName } from "../../../utils/peopleUtils";
import StatCard from "../../../components/cards/StatCard";

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
            case "Em Andamento":
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
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]); // NOVO: Estado para armazenar as pessoas
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // NOVO: Buscamos projetos e pessoas em paralelo
                const [projectsData, peopleData] = await Promise.all([
                    getAllProjects(),
                    getAllPeople(),
                ]);

                console.log("Projects Data:", projectsData);
                console.log("People Data:", peopleData);

                setProjects(projectsData);
                setPeople(peopleData);
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError(
                    "Não foi possível carregar os dados da página inicial."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // NOVO: Memoizamos a combinação dos dados para otimização
    const projectsWithClients = useMemo(() => {
        if (!projects.length || !people.length) return [];

        return projects.map((project) => {
            const cleanClientId = project.clientID?.replace("persons/", "");
            return {
                ...project,
                client: people.find((p) => p.id === cleanClientId),
            };
        });
    }, [projects, people]);

    const projectStats = useMemo(() => {
        return projectsWithClients.reduce(
            (acc, project) => {
                console.log("Project Status:", project.status);
                // CORREÇÃO: Usando a chave correta 'status'
                if (project.status === "Finalizado") {
                    acc.completed++;
                } else if (project.status === "Atrasado") {
                    acc.delayed++;
                } else if (project.status === "Em andamento") {
                    console.log("Counting In Progress Project");
                    // Ser mais específico
                    acc.inProgress++;
                }
                console.log("Current Stats:", acc);
                return acc;
            },
            { inProgress: 0, delayed: 0, completed: 0 }
        );
    }, [projectsWithClients]);

    const recentProjects = useMemo(() => {
        return projectsWithClients
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 5);
    }, [projectsWithClients]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <HomePageWrapper>
            <StatsContainer>
                <StatCard
                    title="Projetos em Andamento"
                    count={projectStats.inProgress ?? 0}
                    color="#6c757d"
                />
                <StatCard
                    title="Projetos em Atraso"
                    count={projectStats.delayed ?? 0}
                    color="#ffc107"
                />
                <StatCard
                    title="Projetos Concluídos"
                    count={projectStats.completed ?? 0}
                    color="#28a745"
                />
            </StatsContainer>
            <RecentProjects>
                <SectionTitle>Projetos Recentes</SectionTitle>
                <Table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Projeto</th>
                            <th>Cliente</th>
                            <th>Data de Início</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentProjects.map((project) => (
                            <tr
                                key={project.id}
                                onClick={() =>
                                    navigate(`/employee/projeto/${project.id}`)
                                }
                            >
                                <td>{project.id}</td>
                                <td>{project.name}</td>
                                {/* CORREÇÃO: Exibindo o nome do cliente a partir dos dados combinados */}
                                <td>
                                    {project.client
                                        ? getDisplayName(project.client)
                                        : "N/A"}
                                </td>
                                <td>
                                    {new Date(
                                        project.startDate
                                    ).toLocaleDateString()}
                                </td>
                                <td>
                                    <StatusBadge status={project.status}>
                                        {project.status}
                                    </StatusBadge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </RecentProjects>
        </HomePageWrapper>
    );
};

export default HomePage;
