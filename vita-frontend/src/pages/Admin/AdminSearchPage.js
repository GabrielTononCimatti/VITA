import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { getAllProjectsWithData } from "../../services/projectService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaBell } from "react-icons/fa";
import ProjectNotificationsPanel from "../../components/layout/ProjectNotificationsPanel";

const FilterPanel = styled.div`
    width: 100%;
    background-color: #f8f9fa;
    padding: ${({ theme }) => theme.spacing.medium};
    border-radius: 4px;
    margin-top: ${({ theme }) => theme.spacing.medium};
    border: 1px solid #e0e0e0;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
`;

// --- Styled Components ---
const PageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.large};
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const FilterBar = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    padding: ${({ theme }) => theme.spacing.medium};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.medium};
    align-items: center;
`;

const SearchInput = styled.input`
    flex: 1;
    min-width: 250px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const ActionButton = styled.button`
    padding: 10px 15px;
    background-color: #6c757d;
    color: white;
    border-radius: 4px;
`;

// Reutilizando os componentes da HomePage para a tabela
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

const SearchPage = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilters, setStatusFilters] = useState([]);
    const navigate = useNavigate();

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const handleStatusChange = (status) => {
        setStatusFilters(
            (prev) =>
                prev.includes(status)
                    ? prev.filter((s) => s !== status) // desmarca
                    : [...prev, status] // marca
        );
    };

    // Carrega todos os projetos uma vez
    useEffect(() => {
        if (user) {
            getAllProjectsWithData(user).then((data) => {
                setAllProjects(data);
                setFilteredProjects(data);
            });
        }
    }, [user]);

    // Filtra os projetos sempre que o termo de busca mudar
    const filterProjects = useCallback(() => {
        let results = [...allProjects];

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            results = results.filter(
                (p) =>
                    p.name.toLowerCase().includes(lowercasedTerm) ||
                    p.id.toLowerCase().includes(lowercasedTerm) ||
                    (p.client?.name &&
                        p.client.name.toLowerCase().includes(lowercasedTerm))
            );
        }

        if (statusFilters.length > 0) {
            results = results.filter((p) => statusFilters.includes(p.status));
        }

        setFilteredProjects(results);
    }, [searchTerm, allProjects, statusFilters]);

    // Executa a filtragem
    useEffect(() => {
        filterProjects();
    }, [searchTerm, statusFilters, allProjects, filterProjects]);

    const handleRowClick = (projectId) => {
        navigate(`/admin/projeto/${projectId}`);
    };

    const handleNotificationClick = (project, event) => {
        event.stopPropagation(); // Impede que o clique na linha seja acionado
        setSelectedProject(project);
        setIsPanelOpen(true);
    };

    return (
        <PageWrapper>
            <Title>Projetos</Title>
            <FilterBar>
                <SearchInput
                    type="text"
                    placeholder="Pesquise pelo nome/ID do projeto ou do cliente"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ActionButton onClick={() => setShowFilters(!showFilters)}>
                    {showFilters ? "Esconder Filtros" : "Filtros Avançados"}
                </ActionButton>
            </FilterBar>

            {showFilters && (
                <FilterPanel>
                    <strong>Status:</strong>
                    {["Em Andamento", "Atrasado", "Concluído"].map((status) => (
                        <label key={status}>
                            <input
                                type="checkbox"
                                checked={statusFilters.includes(status)}
                                onChange={() => handleStatusChange(status)}
                            />
                            {` ${status}`}
                        </label>
                    ))}
                </FilterPanel>
            )}

            <TableWrapper>
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "24px",
                        overflowX: "auto",
                    }}
                >
                    <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    ID
                                </th>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    Nome do Projeto
                                </th>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    Cliente
                                </th>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    Telefone
                                </th>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    Email do Cliente
                                </th>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    Status
                                </th>
                                <th
                                    style={{
                                        padding: "12px 15px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #eee",
                                    }}
                                >
                                    Notificações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map((project) => (
                                <tr
                                    key={project.id}
                                    onClick={() => handleRowClick(project.id)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        {project.id}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        {project.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        {project.client?.name ||
                                            project.client?.razaoSocial ||
                                            "N/A"}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        {project.client?.phone || "N/A"}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        {project.client?.email || "N/A"}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
                                    >
                                        <span
                                            style={{
                                                padding: "5px 10px",
                                                borderRadius: "12px",
                                                color: "white",
                                                fontSize: "12px",
                                                backgroundColor:
                                                    project.status ===
                                                    "Concluído"
                                                        ? "#2E8B57"
                                                        : project.status ===
                                                          "Atrasado"
                                                        ? "#FFD700"
                                                        : "#E0E0E0",
                                            }}
                                        >
                                            {project.status}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            textAlign: "left",
                                            borderBottom: "1px solid #eee",
                                        }}
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
                    </table>
                </div>
            </TableWrapper>
            {selectedProject && (
                <ProjectNotificationsPanel
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                />
            )}
        </PageWrapper>
    );
};

export default SearchPage;
