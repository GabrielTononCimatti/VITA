import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { getAllPeople, deletePerson } from "../../services/peopleService";
import {
    getDisplayName,
    formatPhoneNumber,
    formatDocument,
} from "../../utils/peopleUtils";
import Pagination from "../../components/layout/Pagination";

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

// const PeopleList = ({ people, searchTerm, navigate, activeTab }) => {
//     const handleRowClick = (personId) => {
//         navigate(`/admin/pessoas/editar/${personId}`);
//     };

//     const filteredPeople = useMemo(
//         () =>
//             Array.isArray(people)
//                 ? people.filter(
//                       (person) =>
//                           getDisplayName(person)
//                               .toLowerCase()
//                               .includes(searchTerm.toLowerCase()) ||
//                           (person.cpf || person.cnpj || "").includes(searchTerm)
//                   )
//                 : [],
//         [people, searchTerm]
//     );

//     const isClientTab = activeTab === "clients";

//     return (
//         <TableWrapper>
//             <StyledTable>
//                 <thead>
//                     <tr>
//                         {/* A coluna de nome muda o título para ser mais genérica */}
//                         <th>{isClientTab ? "Nome / Razão Social" : "Nome"}</th>
//                         <th>Telefone</th>
//                         {/* A coluna de CPF/CNPJ só aparece na aba de clientes */}
//                         {isClientTab && <th>CPF / CNPJ</th>}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredPeople.map((person) => (
//                         <tr
//                             key={person.id}
//                             onClick={() => handleRowClick(person.id)}
//                             style={{ cursor: "pointer" }}
//                         >
//                             <td>{getDisplayName(person)}</td>
//                             <td>
//                                 {formatPhoneNumber(person.phoneNumber) || "N/A"}
//                             </td>
//                             {isClientTab && (
//                                 <td>
//                                     {formatDocument(person.cpf || person.cnpj)}
//                                 </td>
//                             )}
//                         </tr>
//                     ))}
//                 </tbody>
//             </StyledTable>
//         </TableWrapper>
//     );
// };

const PeopleList = ({ people, navigate, activeTab }) => {
    const handleRowClick = (personId) => {
        navigate(`/admin/pessoas/editar/${personId}`);
    };

    const isClientTab = activeTab === "clients";

    return (
        <TableWrapper>
            <StyledTable>
                <thead>
                    <tr>
                        <th>{isClientTab ? "Nome / Razão Social" : "Nome"}</th>
                        <th>Telefone</th>
                        {isClientTab && <th>CPF / CNPJ</th>}
                    </tr>
                </thead>
                <tbody>
                    {people.map((person) => (
                        <tr
                            key={person.id}
                            onClick={() => handleRowClick(person.id)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{getDisplayName(person)}</td>
                            <td>
                                {formatPhoneNumber(person.phoneNumber) || "N/A"}
                            </td>
                            {isClientTab && (
                                <td>
                                    {formatDocument(person.cpf || person.cnpj)}
                                </td>
                            )}
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
    const [activeTabName, setActiveTabName] = useState("Clientes");
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                // NOVO: Lógica de fetch de dados com async/await e tratamento de erro
                const data = await getAllPeople();
                setAllPeople(data);
            } catch (err) {
                console.error("Erro ao carregar pessoas:", err);
                setError("Falha ao carregar dados. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };
        fetchPeople();
    }, []);

    // 2. A lógica de filtro agora acontece sobre a mesma lista 'allPeople'
    const clients = allPeople.filter(
        (p) => p.personType === "PF" || p.personType === "PJ"
    );
    const employees = allPeople.filter((p) => p.personType === "F");
    const admins = allPeople.filter((p) => p.personType === "A");

    // const renderList = () => {
    //     if (loading) return <p>Carregando...</p>;
    //     if (error) return <p style={{ color: "red" }}>{error}</p>;

    //     let peopleToShow = [];
    //     switch (activeTab) {
    //         case "clients":
    //             peopleToShow = clients;
    //             break;
    //         case "employees":
    //             peopleToShow = employees;
    //             break;
    //         case "admins":
    //             peopleToShow = admins;
    //             break;
    //         default:
    //             break;
    //     }

    //     return (
    //         <PeopleList
    //             people={peopleToShow}
    //             searchTerm={searchTerm}
    //             navigate={navigate}
    //             activeTab={activeTab}
    //         />
    //     );
    // };

    const renderList = () => {
        if (loading) return <p>Carregando...</p>;
        if (error) return <p style={{ color: "red" }}>{error}</p>;

        let peopleToShow = [];
        switch (activeTab) {
            case "clients":
                peopleToShow = clients;
                break;
            case "employees":
                peopleToShow = employees;
                break;
            case "admins":
                peopleToShow = admins;
                break;
            default:
                break;
        }

        const filteredPeople = peopleToShow.filter(
            (person) =>
                getDisplayName(person)
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (person.cpf || person.cnpj || "").includes(searchTerm)
        );

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentPeople = filteredPeople.slice(
            indexOfFirstItem,
            indexOfLastItem
        );

        return (
            <>
                <PeopleList
                    people={currentPeople}
                    navigate={navigate}
                    activeTab={activeTab}
                />
                <Pagination
                    totalItems={filteredPeople.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </>
        );
    };

    return (
        <div>
            <PageHeader>
                <Title>Pessoas</Title>
                <ActionButton onClick={() => navigate("/admin/pessoas/novo")}>
                    Nova Pessoa
                </ActionButton>
            </PageHeader>

            <TabsContainer>
                <TabButton
                    active={activeTab === "clients"}
                    onClick={() => {
                        setActiveTab("clients");
                        setActiveTabName("clientes");
                        setCurrentPage(1);
                    }}
                >
                    Clientes
                </TabButton>
                <TabButton
                    active={activeTab === "employees"}
                    onClick={() => {
                        setActiveTab("employees");
                        setActiveTabName("funcionários");
                        setCurrentPage(1);
                    }}
                >
                    Funcionários
                </TabButton>
                <TabButton
                    active={activeTab === "admins"}
                    onClick={() => {
                        setActiveTab("admins");
                        setActiveTabName("administradores");
                        setCurrentPage(1);
                    }}
                >
                    Administradores
                </TabButton>
            </TabsContainer>

            <SearchInput
                type="text"
                placeholder={`Pesquisar em ${activeTabName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {renderList()}
        </div>
    );
};

export default PeoplePage;
