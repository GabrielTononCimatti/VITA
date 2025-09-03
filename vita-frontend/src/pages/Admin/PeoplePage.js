import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAllPeople } from "../../services/peopleService";

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const ActionButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    cursor: pointer;
`;

const TabsContainer = styled.div`
    display: flex;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
`;

const TabButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    ${({ active }) =>
        active &&
        `
    font-weight: bold;
    color: #800020;
    border-bottom: 3px solid #800020;
  `}
`;

const SearchInput = styled.input`
    width: 100%;
    max-width: 400px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 20px;
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
`;

const PeopleList = ({ people, searchTerm, navigate }) => {
    const handleRowClick = (personId) => {
        navigate(`/admin/pessoas/editar/${personId}`);
    };

    const filteredPeople = useMemo(
        () =>
            Array.isArray(people)
                ? people.filter((person) =>
                      (person.name || person.razaoSocial || "")
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                  )
                : [],
        [(people, searchTerm)]
    );

    return (
        <TableWrapper>
            <StyledTable>
                <thead>
                    <tr>
                        <th>Nome / Razão Social</th>
                        <th>Email</th>
                        <th>Telefone</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPeople.map((person) => (
                        <tr
                            key={person.id}
                            onClick={() => handleRowClick(person.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{person.name || person.razaoSocial}</td>
                            <td>{person.email || "A aguardar registo"}</td>
                            <td>{person.phone || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </StyledTable>
        </TableWrapper>
    );
};

const PeoplePage = () => {
    const navigate = useNavigate();
    // 1. O estado agora armazena uma única lista de pessoas
    const [allPeople, setAllPeople] = useState([]);
    const [activeTab, setActiveTab] = useState("clients");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // A função getAllPeople agora retorna uma lista simples
        getAllPeople().then((data) => setAllPeople(data));
    }, []);

    // 2. A lógica de filtro agora acontece sobre a mesma lista 'allPeople'
    const clients = allPeople.filter((p) => p.role === "client");
    const employees = allPeople.filter((p) => p.role === "employee");
    const admins = allPeople.filter((p) => p.role === "admin");

    const renderList = () => {
        switch (activeTab) {
            case "clients":
                return (
                    <PeopleList
                        people={clients}
                        searchTerm={searchTerm}
                        navigate={navigate}
                    />
                );
            case "employees":
                return (
                    <PeopleList
                        people={employees}
                        searchTerm={searchTerm}
                        navigate={navigate}
                    />
                );
            case "admins":
                return (
                    <PeopleList
                        people={admins}
                        searchTerm={searchTerm}
                        navigate={navigate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <PageHeader>
                <Title>Pessoas</Title>
                <ActionButton onClick={() => navigate("/admin/pessoas/novo")}>
                    Novo Utilizador
                </ActionButton>
            </PageHeader>

            <TabsContainer>
                <TabButton
                    active={activeTab === "clients"}
                    onClick={() => setActiveTab("clients")}
                >
                    Clientes
                </TabButton>
                <TabButton
                    active={activeTab === "employees"}
                    onClick={() => setActiveTab("employees")}
                >
                    Funcionários
                </TabButton>
                <TabButton
                    active={activeTab === "admins"}
                    onClick={() => setActiveTab("admins")}
                >
                    Admins
                </TabButton>
            </TabsContainer>

            <SearchInput
                type="text"
                placeholder={`Pesquisar em ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {renderList()}
        </div>
    );
};

export default PeoplePage;
