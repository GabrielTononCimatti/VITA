// Caminho: vita-frontend/src/pages/Employee/StepsPage/index.js

import React, { useState, useEffect } from "react";
// NOVO: Importando useNavigate, que substitui useHistory
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import {
    createProject,
    getProjectById,
    updateProject,
} from "../../../services/projectService";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// --- Styled Components (Preservados) ---
const PageWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
`;
// ... (demais styled-components mantidos)
const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 32px;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

const FormSection = styled.div`
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StepsListSection = styled.div`
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
`;

const SectionTitle = styled.h2`
    margin-top: 0;
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
    padding-bottom: 10px;
    margin-bottom: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-height: 80px;
`;

const StepCard = styled.div`
    background: white;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StepActions = styled.div`
    display: flex;
    gap: 10px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
`;

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
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

// --- Componente ---
const StepsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useParams();

    const [projectInfo, setProjectInfo] = useState(
        location.state?.projectData || {}
    );
    const [initialStages, setInitialStages] = useState([]); // Para lógica de edição

    // As 3 etapas padrão
    const defaultStages = [
        {
            id: `temp-${Date.now()}-1`,
            order: 1,
            name: "Contrato",
            description: "Etapa de assinatura e formalização do contrato.",
            status: "Não iniciada",
            requiresDocument: true,
        },
        {
            id: `temp-${Date.now()}-2`,
            order: 2,
            name: "Desenvolvimento",
            description: "Execução das atividades principais do projeto.",
            status: "Não iniciada",
            requiresDocument: false,
        },
        {
            id: `temp-${Date.now()}-3`,
            order: 3,
            name: "Finalização",
            description: "Entrega final e encerramento do projeto.",
            status: "Não iniciada",
            requiresDocument: false,
        },
    ];

    const [stages, setStages] = useState(defaultStages);
    const [currentStep, setCurrentStep] = useState({
        name: "",
        description: "",
        requiresDocument: false,
    });
    const [editingStepId, setEditingStepId] = useState(null);

    // Lógica para carregar dados em modo de edição
    useEffect(() => {
        if (projectId) {
            const fetchProjectForEdit = async () => {
                try {
                    const data = await getProjectById(projectId);
                    setProjectInfo(location.state?.projectData || data.project);

                    const sortedStages = data.project.stages.sort(
                        (a, b) => a.order - b.order
                    );
                    setStages(sortedStages);
                    setInitialStages(sortedStages); // Guarda o estado original
                } catch (error) {
                    console.error("Erro ao buscar projeto para edição:", error);
                    alert("Não foi possível carregar o projeto para edição.");
                    navigate("/employee/home");
                }
            };
            fetchProjectForEdit();
        } else {
            // Garante que o estado das etapas seja o padrão ao criar novo projeto
            setStages(defaultStages);
        }
    }, [projectId, navigate, location.state]);

    const handleStepChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentStep((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Adiciona ou atualiza uma etapa
    const handleAddOrUpdateStep = () => {
        if (!currentStep.name) {
            alert("O nome da etapa é obrigatório.");
            return;
        }

        if (editingStepId) {
            // Atualizando
            setStages(
                stages.map((s) =>
                    s.id === editingStepId ? { ...s, ...currentStep } : s
                )
            );
            setEditingStepId(null);
        } else {
            // Adicionando
            const newStep = {
                ...currentStep,
                id: `temp-${Date.now()}`,
                order: stages.length + 1,
                status: "Não iniciada",
            };
            setStages([...stages, newStep]);
        }
        setCurrentStep({ name: "", description: "", requiresDocument: false }); // Limpa o formulário
    };

    // Prepara o formulário para edição de uma etapa
    const handleEditStep = (step) => {
        setEditingStepId(step.id);
        setCurrentStep({
            name: step.name,
            description: step.description,
            requiresDocument: step.requiresDocument,
        });
    };

    const handleRemoveStep = (id) => {
        if (window.confirm("Tem certeza que deseja remover esta etapa?")) {
            setStages(stages.filter((s) => s.id !== id));
        }
    };

    // Lógica de Drag and Drop
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(stages);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Atualiza a ordem
        setStages(items.map((item, index) => ({ ...item, order: index + 1 })));
    };

    // NOVO: Função para o botão "Voltar"
    const handleBack = () => {
        // Se temos um projectId, estamos em modo de EDIÇÃO
        if (projectId) {
            navigate(`/employee/projeto/${projectId}/editar`, {
                state: { projectData: projectInfo },
            });
        } else {
            // Senão, estamos em modo de CRIAÇÃO
            navigate("/employee/novo-projeto", {
                state: { projectData: projectInfo },
            });
        }
    };

    const handleFinalSubmit = async () => {
        if (projectId) {
            // Modo Edição
            const changes = {
                stages: stages
                    .map((s) => {
                        const original = initialStages.find(
                            (is) => is.id === s.id
                        );
                        // Se a etapa é nova (não tem ID original)
                        if (!original) {
                            const { id, ...newStageData } = s; // Remove o ID temporário
                            return newStageData;
                        }
                        // Se a etapa mudou
                        if (JSON.stringify(s) !== JSON.stringify(original)) {
                            return {
                                id: s.id,
                                name: s.name,
                                description: s.description,
                                order: s.order,
                                requiresDocument: s.requiresDocument,
                            };
                        }
                        return null; // Etapa não mudou
                    })
                    .filter(Boolean), // Remove nulos
            };

            // Adiciona etapas removidas para deleção (lógica a ser implementada no backend se necessário)

            try {
                await updateProject(projectId, changes);
                alert("Projeto atualizado com sucesso!");
                navigate(`/employee/projeto/${projectId}`);
            } catch (error) {
                alert("Erro ao atualizar o projeto.");
            }
        } else {
            // Modo Criação
            const payload = {
                ...projectInfo,
                clientID: `persons/${projectInfo.clientID}`,
                employeeID: `users/${projectInfo.employeeID}`,
                stages: stages.map(({ id, ...rest }) => rest), // Remove IDs temporários
            };

            console.log("Enviando payload para criar projeto:", payload);

            try {
                const newProject = await createProject(payload);
                alert("Projeto criado com sucesso!");
                navigate(`/employee/inicio`);
            } catch (error) {
                console.error("Detalhes do erro:", error);
                const errorMessage =
                    error.response?.data?.message || "Erro ao criar projeto.";
                alert(errorMessage);
            }
        }
    };

    return (
        <PageWrapper>
            <Title>
                {projectId
                    ? "Editar Etapas do Projeto"
                    : "Adicionar Etapas ao Projeto"}
            </Title>
            <ContentWrapper>
                <FormSection>
                    <SectionTitle>
                        {editingStepId ? "Editando Etapa" : "Nova Etapa"}
                    </SectionTitle>
                    <FormGroup>
                        <Label>Nome da Etapa</Label>
                        <Input
                            name="name"
                            value={currentStep.name}
                            onChange={handleStepChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Descrição</Label>
                        <Textarea
                            name="description"
                            value={currentStep.description}
                            onChange={handleStepChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label>
                            <input
                                type="checkbox"
                                name="requiresDocument"
                                checked={currentStep.requiresDocument}
                                onChange={handleStepChange}
                            />
                            Exige Documentos?
                        </label>
                    </FormGroup>
                    <Button onClick={handleAddOrUpdateStep}>
                        {editingStepId
                            ? "Salvar Alterações na Etapa"
                            : "Adicionar Etapa à Lista"}
                    </Button>
                </FormSection>

                <StepsListSection>
                    <SectionTitle>Ordem das Etapas</SectionTitle>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="steps">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {stages.map((step, index) => (
                                        <Draggable
                                            key={step.id}
                                            draggableId={String(step.id)}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <StepCard>
                                                        <span>
                                                            {step.order}.{" "}
                                                            {step.name}
                                                        </span>
                                                        <StepActions>
                                                            <FaEdit
                                                                onClick={() =>
                                                                    handleEditStep(
                                                                        step
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                            <FaTrash
                                                                onClick={() =>
                                                                    handleRemoveStep(
                                                                        step.id
                                                                    )
                                                                }
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}
                                                            />
                                                        </StepActions>
                                                    </StepCard>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </StepsListSection>
            </ContentWrapper>
            <ButtonContainer>
                {/* NOVO: Botão voltar com a nova funcionalidade */}
                <BackButton onClick={handleBack}>Voltar</BackButton>
                <SubmitButton onClick={handleFinalSubmit}>
                    {projectId
                        ? "Salvar Alterações no Projeto"
                        : "Criar Projeto"}
                </SubmitButton>
            </ButtonContainer>
        </PageWrapper>
    );
};

export default StepsPage;
