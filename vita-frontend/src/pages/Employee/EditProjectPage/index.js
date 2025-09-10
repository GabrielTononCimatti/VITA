// Caminho: vita-frontend/src/pages/Employee/EditProjectPage/index.js

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { getAllPeople } from "../../../services/peopleService";
import { getProjectById } from "../../../services/projectService";
import { getDisplayName } from "../../../utils/peopleUtils";

// --- Styled Components (Preservados) ---
const PageWrapper = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
`;
// ... (demais styled-components mantidos)
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
    justify-content: space-between;
    margin-top: 16px;
`;

const Button = styled.button`
    padding: 12px 24px;
    border-radius: 4px;
    border: none;
    font-weight: bold;
    cursor: pointer;
`;

const BackButton = styled(Button)`
    background-color: #f1f1f1;
`;

const SubmitButton = styled(Button)`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
`;

// --- Helpers ---
const stripRef = (ref) => {
    if (!ref || typeof ref !== "string") return null;
    return ref.includes("/") ? ref.split("/").pop() : ref;
};

const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString); // o JS entende essa string como data
    if (isNaN(d)) return ""; // proteção caso não dê pra parsear
    return d.toISOString().split("T")[0]; // "2025-09-09"
};

// --- Componente ---
const EditProjectPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useParams();

    const [projectData, setProjectData] = useState(null);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Prioriza os dados que vieram da StepsPage
                if (location.state?.projectData) {
                    setProjectData(location.state.projectData);
                } else {
                    const data = await getProjectById(projectId);
                    setProjectData({
                        ...data.project,
                        clientID: stripRef(data.project.clientID),
                        employeeID: stripRef(data.project.employeeID),
                    });
                }

                const peopleData = await getAllPeople();
                setPeople(peopleData || []);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                alert("Erro ao carregar dados para edição.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [projectId, location.state]);

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
        navigate(`/employee/projeto/${projectId}/editar-etapas`, {
            state: { projectData },
        });
    };

    if (loading || !projectData) {
        return <p>Carregando...</p>;
    }

    return (
        <PageWrapper>
            <Title>Editar Projeto</Title>
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
                    {/* CORREÇÃO: Formata a data para o input */}
                    <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={projectData.startDate?.split("T")[0] || ""}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="expectedEndDate">
                        Data de Término (Prevista)
                    </Label>
                    {/* CORREÇÃO: Formata a data para o input */}
                    <Input
                        id="expectedEndDate"
                        name="expectedEndDate"
                        type="date"
                        value={projectData.expectedEndDate?.split("T")[0] || ""}
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
                    <BackButton
                        type="button"
                        onClick={() =>
                            navigate(`/employee/projeto/${projectId}`)
                        }
                    >
                        Cancelar
                    </BackButton>
                    <SubmitButton type="submit">
                        Avançar para Editar Etapas
                    </SubmitButton>
                </ButtonContainer>
            </Form>
        </PageWrapper>
    );
};

export default EditProjectPage;
