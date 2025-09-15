// Caminho: vita-frontend/src/pages/Admin/AdminHomePage.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAllProjects } from "../../services/projectService"; // Apenas este serviço é necessário agora
import { getDisplayName } from "../../utils/peopleUtils";
import StatCard from "../../components/cards/StatCard";

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

// --- Componente ---
const AdminHomePage = () => {
    // ESTADO SIMPLIFICADO: Apenas uma lista de projetos é necessária
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // BUSCA ÚNICA: Chamamos apenas getAllProjects
                const projectsData = await getAllProjects();
                setProjects(projectsData || []);
            } catch (err) {
                console.error(err);
                setError("Não foi possível carregar os dados.");
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const projectStats = useMemo(() => {
        if (!Array.isArray(projects) || projects.length === 0) {
            return { inProgress: 0, delayed: 0, completed: 0 };
        }

        return projects.reduce(
            (acc, item) => {
                // LÓGICA ATUALIZADA: Acessa o status dentro de item.project
                const status = item.project?.status || "";
                const s = status.toLowerCase();
                if (s.includes("final") || s.includes("conclu"))
                    acc.completed++;
                else if (s.includes("atras")) acc.delayed++;
                else if (s.includes("andam") || s.includes("em andamento"))
                    acc.inProgress++;
                return acc;
            },
            { inProgress: 0, delayed: 0, completed: 0 }
        );
    }, [projects]);

    const recentProjects = useMemo(() => {
        if (!Array.isArray(projects) || projects.length === 0) {
            return [];
        }

        return projects
            .slice()
            .sort(
                (a, b) =>
                    new Date(b.project.startDate) -
                    new Date(a.project.startDate)
            )
            .slice(0, 5);
    }, [projects]);

    const handleRowClick = (projectId) =>
        navigate(`/admin/projeto/${projectId}`);

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
                    color="#05c85aff"
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
                        </tr>
                    </thead>
                    <tbody>
                        {recentProjects.map((item) => (
                            <tr
                                key={item.project.id}
                                onClick={() => handleRowClick(item.project.id)}
                            >
                                <td>{item.project.id}</td>
                                <td>{item.project.name}</td>
                                <td>
                                    {item.client
                                        ? getDisplayName(item.client.personData)
                                        : "N/A"}
                                </td>
                                <td>
                                    {item.employee
                                        ? getDisplayName(
                                              item.employee.personData
                                          )
                                        : "N/A"}
                                </td>
                                <td>
                                    <StatusBadge status={item.project.status}>
                                        {item.project.status}
                                    </StatusBadge>
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
        </div>
    );
};

export default AdminHomePage;
