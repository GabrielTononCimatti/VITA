// Caminho: vita-frontend/src/pages/Client/ClientSearchPage.js

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../../services/projectService";
import { getDisplayName } from "../../utils/peopleUtils";
import { useAuth } from "../../contexts/AuthContext";
import ProjectNotificationsPanel from "../../components/layout/ProjectNotificationsPanel";
import { FaBell } from "react-icons/fa";
import Pagination from "../../components/layout/Pagination";

// --- Styled Components (reutilizados) ---
const SearchContainer = styled.div`
    padding: 24px;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 24px;
`;

const Controls = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
`;

const SearchInput = styled.input`
    flex-grow: 1;
    min-width: 250px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const TableWrapper = styled.div`
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    overflow-x: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StyledTable = styled.table`
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

const FilterContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
`;

const FilterLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
`;

// --- Helpers ---
const stripRef = (ref) => {
    if (!ref || typeof ref !== "string") return null;
    return ref.includes("/") ? ref.split("/").pop() : ref;
};

// --- Componente da Página ---
const ClientSearchPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Pega o cliente logado
    const [allProjects, setAllProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilters, setStatusFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectsData = await getAllProjects();
                setAllProjects(projectsData || []);
            } catch (err) {
                setError("Não foi possível carregar os projetos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Primeiro, filtramos os projetos que pertencem a este cliente
    const clientProjects = useMemo(() => {
        if (!allProjects.length || !user || !user.personID) return [];
        const userPersonId = stripRef(user.personID);
        return allProjects.filter(
            (item) => stripRef(item.project?.clientID) === userPersonId
        );
    }, [allProjects, user]);

    const handleStatusFilterChange = (e) => {
        const { value, checked } = e.target;
        setStatusFilters((prev) =>
            checked
                ? [...prev, value]
                : prev.filter((status) => status !== value)
        );
    };

    // Agora, a busca e os filtros operam sobre a lista de projetos do cliente
    const filteredProjects = useMemo(() => {
        return clientProjects.filter((item) => {
            const { project } = item;

            if (
                statusFilters.length > 0 &&
                !statusFilters.includes(project.status)
            ) {
                return false;
            }

            const searchTermLower = searchTerm.toLowerCase();
            if (searchTermLower === "") return true;

            // O cliente só pode pesquisar por nome ou ID do projeto
            return (
                project.name.toLowerCase().includes(searchTermLower) ||
                project.id.toString().includes(searchTermLower)
            );
        });
    }, [clientProjects, searchTerm, statusFilters]);

    const currentProjects = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredProjects, currentPage, itemsPerPage]);

    const handleNotificationClick = (project, e) => {
        e.stopPropagation();
        setSelectedProject(project); // Passa o objeto do projeto para o painel
        setIsPanelOpen(true);
    };

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <SearchContainer>
            <Title>Seus Projetos</Title>
            <Controls>
                <SearchInput
                    type="text"
                    placeholder="Pesquisar em seus projetos por nome do projeto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Controls>
            <FilterContainer>
                <strong>Filtrar por Status:</strong>
                <FilterLabel>
                    <input
                        type="checkbox"
                        value="Em andamento"
                        onChange={handleStatusFilterChange}
                    />
                    Em andamento
                </FilterLabel>
                <FilterLabel>
                    <input
                        type="checkbox"
                        value="Em atraso"
                        onChange={handleStatusFilterChange}
                    />
                    Em atraso
                </FilterLabel>
                <FilterLabel>
                    <input
                        type="checkbox"
                        value="Finalizado"
                        onChange={handleStatusFilterChange}
                    />
                    Finalizado
                </FilterLabel>
            </FilterContainer>
            <br />
            <TableWrapper>
                <StyledTable>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome do Projeto</th>
                            <th>Responsável (Vulcano)</th>
                            <th>Data de Início</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProjects.map((item) => (
                            <tr
                                key={item.project.id}
                                onClick={() =>
                                    navigate(
                                        `/client/projeto/${item.project.id}`
                                    )
                                }
                            >
                                <td>{item.project.id}</td>
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
                </StyledTable>
            </TableWrapper>
            <Pagination
                totalItems={filteredProjects.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
            {selectedProject && (
                <ProjectNotificationsPanel
                    isOpen={isPanelOpen}
                    onClose={() => setIsPanelOpen(false)}
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                />
            )}
        </SearchContainer>
    );
};

export default ClientSearchPage;
