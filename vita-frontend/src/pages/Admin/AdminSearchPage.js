// Caminho: vita-frontend/src/pages/Admin/AdminSearchPage.js

import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAllProjects } from "../../services/projectService";
import { getAllPeople } from "../../services/peopleService";
import { getAllUsers } from "../../services/userService";
import { getDisplayName } from "../../utils/peopleUtils";

// --- Styled Components ---
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
            case "Atrasado":
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

const stripRef = (ref) => {
    if (!ref || typeof ref !== "string") return null;
    return ref.includes("/") ? ref.split("/").pop() : ref;
};

// --- Componente da Página ---
const AdminSearchPage = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilters, setStatusFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, peopleData, usersData] = await Promise.all(
                    [getAllProjects(), getAllPeople(), getAllUsers()]
                );
                setProjects(projectsData || []);
                setPeople(peopleData || []);
                setUsers(usersData || []); // Armazena os usuários no estado
            } catch (err) {
                setError("Não foi possível carregar os projetos.");
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

    const handleStatusFilterChange = (e) => {
        const { value, checked } = e.target;
        setStatusFilters((prev) =>
            checked
                ? [...prev, value]
                : prev.filter((status) => status !== value)
        );
    };

    const filteredProjects = useMemo(() => {
        return projectsWithData.filter((project) => {
            if (
                statusFilters.length > 0 &&
                !statusFilters.includes(project.status)
            ) {
                return false;
            }
            const clientName = project.client
                ? getDisplayName(project.client)
                : "";
            const employeeName = project.employee
                ? getDisplayName(project.employee)
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
    }, [projectsWithData, searchTerm, statusFilters]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <SearchContainer>
            <Title>Todos os Projetos</Title>
            <Controls>
                <SearchInput
                    type="text"
                    placeholder="Pesquisar por projeto, ID, cliente ou funcionário..."
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
                        value="Atrasado"
                        onChange={handleStatusFilterChange}
                    />
                    Atrasado
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
                        {filteredProjects.map((project) => (
                            <tr
                                key={project.id}
                                onClick={() =>
                                    navigate(`/admin/projeto/${project.id}`)
                                }
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
                            </tr>
                        ))}
                    </tbody>
                </StyledTable>
            </TableWrapper>
        </SearchContainer>
    );
};

export default AdminSearchPage;
