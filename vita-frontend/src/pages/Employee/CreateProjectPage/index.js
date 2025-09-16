// Caminho: vita-frontend/src/pages/Employee/CreateProjectPage/index.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { getAllPeople } from "../../../services/peopleService";
import { useAuth } from "../../../contexts/AuthContext";
import { getDisplayName } from "../../../utils/peopleUtils";
import { formatISOToInputDate } from "../../../utils/dateUtils";

// --- Styled Components (Preservando seu estilo) ---
const PageWrapper = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 32px;
`;

const Form = styled.form`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    grid-column: ${({ fullWidth }) => (fullWidth ? "1 / -1" : "auto")};
`;

const Label = styled.label`
    margin-bottom: 8px;
    font-weight: bold;
`;

const Input = styled.input`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const Select = styled.select`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
`;

const Textarea = styled.textarea`
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-height: 100px;
    resize: vertical;
`;

const ButtonContainer = styled.div`
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
`;

const SubmitButton = styled.button`
    padding: 12px 24px;
    border-radius: 4px;
    border: none;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    font-weight: bold;
    cursor: pointer;
`;

// --- Componente ---
const CreateProjectPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // Para associar o funcionário logado

    const [projectData, setProjectData] = useState(
        location.state?.projectData || {
            name: "",
            clientID: "",
            employeeID: user?.id || "",
            startDate: "",
            expectedEndDate: "",
            description: "",
        }
    );

    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const peopleData = await getAllPeople();
                setPeople(peopleData || []);
            } catch (error) {
                console.error("Erro ao buscar pessoas:", error);
                alert(
                    "Não foi possível carregar a lista de clientes e funcionários."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchPeople();
    }, []);

    const { clients, employees } = useMemo(() => {
        const clients = people.filter(
            (p) => p.personType === "PF" || p.personType === "PJ"
        );
        const employees = people.filter(
            (p) => p.personType === "F" || p.personType === "A"
        );
        return { clients, employees };
    }, [people]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const { startDate, expectedEndDate } = projectData;
        if (
            startDate &&
            expectedEndDate &&
            new Date(startDate) > new Date(expectedEndDate)
        ) {
            alert(
                "A data de início não pode ser posterior à data de término prevista."
            );
            return; // Impede o envio do formulário
        }

        // Passa os dados do projeto para a próxima página (StepsPage)
        navigate("/employee/novo-projeto/etapas", { state: { projectData } });
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <PageWrapper>
            <Title>Novo Projeto</Title>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={projectData.name}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="clientID">Cliente</Label>
                    <Select
                        id="clientID"
                        name="clientID"
                        value={projectData.clientID}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Selecione um cliente
                        </option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {getDisplayName(client)}
                            </option>
                        ))}
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={projectData.startDate}
                        max={formatISOToInputDate(new Date().toISOString())}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="expectedEndDate">
                        Data de Término (Prevista)
                    </Label>
                    <Input
                        id="expectedEndDate"
                        name="expectedEndDate"
                        type="date"
                        value={projectData.expectedEndDate}
                        onChange={handleChange}
                    />
                </FormGroup>

                <FormGroup fullWidth>
                    <Label htmlFor="description">Descrição do Projeto</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={projectData.description}
                        onChange={handleChange}
                    />
                </FormGroup>

                <ButtonContainer>
                    <SubmitButton type="submit">
                        Avançar para Etapas
                    </SubmitButton>
                </ButtonContainer>
            </Form>
        </PageWrapper>
    );
};

export default CreateProjectPage;
