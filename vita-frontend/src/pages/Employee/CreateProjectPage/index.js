import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { getClients } from "../../../services/clientService";

// Componentes de UI genéricos para formulários
const FormWrapper = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.large};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    max-width: 800px;
    margin: auto;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const Form = styled.form`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.large};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.small};
    ${({ fullWidth }) => fullWidth && `grid-column: 1 / -1;`}
`;

const Label = styled.label`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textLight};
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
`;

const Select = styled.select`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    background-color: white;
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    min-height: 100px;
    resize: vertical;
`;

const Button = styled.button`
    padding: 12px 24px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    grid-column: 2 / 3; // Alinha o botão à direita no grid
    justify-self: end; // Alinha o conteúdo do item à direita

    @media (max-width: 768px) {
        grid-column: 1 / -1;
        width: 100%;
    }
`;

const CreateProjectPage = () => {
    const [clients, setClients] = useState([]);
    const location = useLocation();
    const [projectData, setProjectData] = useState({
        name: "",
        clientId: "",
        startDate: "",
        endDate: "",
        description: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.projectData) {
            setProjectData(location.state.projectData);
        }

        const loadClients = async () => {
            const data = await getClients();
            setClients(data);
        };
        loadClients();
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!projectData.clientId) {
            alert("Por favor, selecione um cliente.");
            return;
        }
        // Navega para a próxima etapa, passando os dados do formulário
        navigate("/employee/novo-projeto/etapas", {
            state: { projectData },
        });
    };

    return (
        <FormWrapper>
            <Title>Novo Projeto</Title>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={projectData.name}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="clientId">Cliente</Label>
                    <Select
                        id="clientId"
                        name="clientId"
                        value={projectData.clientId}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Selecione um cliente
                        </option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name || client.razaoSocial} -{" "}
                                {client.cnpj || client.cpf}
                            </option>
                        ))}
                    </Select>
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={projectData.startDate}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="endDate">Data de Término (Opcional)</Label>
                    <Input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={projectData.endDate}
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
                        required
                    />
                </FormGroup>

                <Button type="submit">Avançar para Etapas</Button>
            </Form>
        </FormWrapper>
    );
};

export default CreateProjectPage;
