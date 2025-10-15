// Caminho: vita-frontend/src/pages/Admin/AdminSearchPage.js

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../../services/projectService";
import { getDisplayName } from "../../utils/peopleUtils";
import Pagination from "../../components/layout/Pagination";

// --- Styled Components (mantidos) ---
const SearchContainer = styled.div`
    padding: 24px;
`;
// ... (demais styled-components mantidos)
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

// --- Componente da Página ---
const AdminSearchPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilters, setStatusFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilters]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projectsData = await getAllProjects();
                setProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (err) {
                setError("Não foi possível carregar os projetos.");
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatusFilterChange = (e) => {
        const { value, checked } = e.target;
        setStatusFilters((prev) =>
            checked
                ? [...prev, value]
                : prev.filter((status) => status !== value)
        );
    };

    const filteredProjects = useMemo(() => {
        if (!Array.isArray(projects) || projects.length === 0) {
            return [];
        }

        return projects.filter((item) => {
            const { project, client, employee } = item;

            // Filtro por status
            if (
                statusFilters.length > 0 &&
                !statusFilters.includes(project.status)
            ) {
                return false;
            }

            // Filtro pela barra de pesquisa
            const clientName = client ? getDisplayName(client.personData) : "";
            const employeeName = employee
                ? getDisplayName(employee.personData)
                : "";
            const searchTermLower = searchTerm.toLowerCase();
            if (searchTermLower === "") return true;

            return (
                project.name.toLowerCase().includes(searchTermLower) ||
                project.id.toString().includes(searchTermLower) ||
                (clientName &&
                    clientName.toLowerCase().includes(searchTermLower)) ||
                (employeeName &&
                    employeeName.toLowerCase().includes(searchTermLower))
            );
        });
    }, [projects, searchTerm, statusFilters]);

    const currentProjects = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredProjects.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredProjects, currentPage, itemsPerPage]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <SearchContainer>
            <Title>Todos os Projetos</Title>
            <Controls>
                <SearchInput
                    type="text"
                    placeholder="Pesquisar por projeto, cliente ou funcionário..."
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
                            <th>Cliente</th>
                            <th>Funcionário</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProjects.map((item) => (
                            <tr
                                key={item.project.id}
                                onClick={() =>
                                    navigate(
                                        `/admin/projeto/${item.project.id}`
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
            <Pagination
                totalItems={filteredProjects.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        </SearchContainer>
    );
};

export default AdminSearchPage;
