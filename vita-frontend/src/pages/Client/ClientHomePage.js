// Caminho: vita-frontend/src/pages/Client/ClientHomePage.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAllProjects } from "../../services/projectService";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "../../components/cards/StatCard";

// --- Styled Components (estilo preservado / theme-aware) ---
const PageWrapper = styled.div`
    padding: 24px;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;

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
    padding: 6px 10px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 12px;
    display: inline-block;
    background-color: ${({ theme, status }) => {
        const s = String(status || "").toLowerCase();
        if (s.includes("andam") || s.includes("em andamento"))
            return theme.colors.gray || "#6c757d";
        if (s.includes("final") || s.includes("conclu"))
            return theme.colors.green || "#28a745";
        if (s.includes("atras")) return theme.colors.yellow || "#ffc107";
        return "#ccc";
    }};
    color: ${({ theme, status }) => {
        const s = String(status || "").toLowerCase();
        if (s.includes("atras")) return theme.colors.black || "#000";
        return theme.colors.white || "#fff";
    }};
`;

// --- Helpers ---
const stripRef = (ref) => {
    if (!ref || typeof ref !== "string") return null;
    return ref.includes("/") ? ref.split("/").pop() : ref;
};

// --- Componente ---
const ClientHomePage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectsData = await getAllProjects();
                setProjects(projectsData || []);
            } catch (err) {
                console.error(
                    "Erro ao buscar projetos na ClientHomePage:",
                    err
                );
                setError("Não foi possível carregar seus projetos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const clientProjects = useMemo(() => {
        if (!projects.length || !user || !user.personID) return [];
        const userPersonId = stripRef(user.personID);
        return projects.filter((p) => stripRef(p.clientID) === userPersonId);
    }, [projects, user]);

    const projectStats = useMemo(() => {
        return clientProjects.reduce(
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
    }, [clientProjects]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <PageWrapper>
            <Title>Seus Projetos</Title>

            <CardsContainer>
                {/* envio tanto count quanto value pra compatibilidade com diferentes StatCard implementations */}
                <StatCard
                    title="Projetos em Andamento"
                    count={projectStats.inProgress ?? 0}
                    value={projectStats.inProgress ?? 0}
                    color="#6c757d"
                />
                <StatCard
                    title="Projetos em Atraso"
                    count={projectStats.delayed ?? 0}
                    value={projectStats.delayed ?? 0}
                    color="#ffc107"
                />
                <StatCard
                    title="Projetos Finalizados"
                    count={projectStats.completed ?? 0}
                    value={projectStats.completed ?? 0}
                    color="#28a745"
                />
            </CardsContainer>

            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>Nome do Projeto</th>
                            <th>Data de Início</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientProjects.length > 0 ? (
                            clientProjects.map((project) => (
                                <tr
                                    key={project.id}
                                    onClick={() =>
                                        navigate(
                                            `/client/projeto/${project.id}`
                                        )
                                    }
                                >
                                    <td>{project.name}</td>
                                    <td>
                                        {project.startDate
                                            ? new Date(
                                                  project.startDate
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </td>
                                    <td>
                                        <StatusBadge status={project.status}>
                                            {project.status || "Sem status"}
                                        </StatusBadge>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center" }}>
                                    Você ainda não possui projetos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </StyledTable>
            </TableWrapper>
        </PageWrapper>
    );
};

export default ClientHomePage;
