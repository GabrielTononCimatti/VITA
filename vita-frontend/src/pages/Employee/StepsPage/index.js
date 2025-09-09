import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { FaTrash, FaPen } from "react-icons/fa";
// Vamos precisar de uma função para criar o projeto no nosso service
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { createProject, updateProject } from "../../../services/projectService";

// --- Styled Components ---
const PageWrapper = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.large};

    @media (max-width: 1024px) {
        flex-direction: column;
    }
`;

const FormContainer = styled.div`
    flex: 2; // O formulário ocupa 2/3 do espaço
    background-color: ${({ theme }) => theme.colors.white};
    padding: ${({ theme }) => theme.spacing.large};
    border-radius: ${({ theme }) => theme.borderRadius};
`;

const StepsContainer = styled.div`
    flex: 1; // A lista de etapas ocupa 1/3
    background-color: #f8f9fa;
    padding: ${({ theme }) => theme.spacing.large};
    border-radius: ${({ theme }) => theme.borderRadius};
    max-height: 80vh;
    overflow-y: auto;
`;

const StepCard = styled.div`
    background-color: white;
    padding: ${({ theme }) => theme.spacing.medium};
    border-radius: 4px;
    margin-bottom: ${({ theme }) => theme.spacing.medium};
    border-left: 5px solid ${({ theme }) => theme.colors.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const StepActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing.medium};
    color: ${({ theme }) => theme.colors.textLight};

    svg {
        cursor: pointer;
        &:hover {
            color: ${({ theme }) => theme.colors.primary};
        }
    }
`;

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.spacing.large};
`;

const Button = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 4px;
    background-color: ${({ theme, primary }) =>
        primary ? theme.colors.primary : "#6c757d"};
    color: white;
`;

// -- Componente Principal ---
const StepsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { projectData, isEditing } = location.state || {};

    // Etapas padrão
    const defaultSteps = [
        {
            id: 1,
            name: "Contrato",
            description: "Etapa de assinatura e formalização do contrato.",
            requiresDocuments: true,
        },
        {
            id: 2,
            name: "Desenvolvimento",
            description: "Execução das atividades principais do projeto.",
            requiresDocuments: false,
        },
        {
            id: 3,
            name: "Conclusão",
            description: "Entrega final e encerramento do projeto.",
            requiresDocuments: false,
        },
    ];

    const [steps, setSteps] = useState(defaultSteps);
    const [currentStep, setCurrentStep] = useState({
        name: "",
        description: "",
        requiresDocuments: false,
    });
    const [editingStepId, setEditingStepId] = useState(null);

    //ANTIGA
    // const handleAddStep = (e) => {
    //     e.preventDefault();
    //     if (!currentStep.name) return;
    //     setSteps([...steps, { ...currentStep, id: Date.now() }]); // Usando timestamp como ID simples
    //     setCurrentStep({ name: "", description: "", requiresDocuments: false }); // Limpa o formulário
    // };

    //NOVA
    const handleStepSubmit = (e) => {
        e.preventDefault();
        if (!currentStep.name) return;

        if (editingStepId) {
            // Se estiver editando, atualize a etapa existente
            setSteps(
                steps.map((step) =>
                    step.id === editingStepId
                        ? { ...step, ...currentStep }
                        : step
                )
            );
            setEditingStepId(null); // Sai do modo de edição
        } else {
            // Se não, adicione uma nova etapa
            setSteps([...steps, { ...currentStep, id: Date.now() }]);
        }

        setCurrentStep({ name: "", description: "", requiresDocuments: false }); // Limpa o formulário
    };

    const handleEditStep = (stepToEdit) => {
        setEditingStepId(stepToEdit.id);
        setCurrentStep(stepToEdit);
    };

    // Se o usuário chegar aqui sem os dados do projeto, redireciona de volta
    useEffect(() => {
        if (isEditing && projectData && projectData.steps) {
            setSteps(projectData.steps);
        } else if (!isEditing) {
            setSteps(defaultSteps);
        }

        if (!projectData) {
            alert(
                "Dados do projeto não encontrados. Por favor, comece novamente."
            );
            navigate(`/${user.role}/novo-projeto`);
        }
    }, [projectData, isEditing, navigate]);

    const handleDeleteStep = (stepId) => {
        setSteps(steps.filter((step) => step.id !== stepId));
    };

    const handleFinalizeProject = async () => {
        if (isEditing) {
            const updatedProject = { ...projectData, steps: steps };
            try {
                await updateProject(projectData.id, {
                    steps: updatedProject.steps,
                });
                alert("Projeto atualizado com sucesso!");
                navigate(`/${user.role}/projeto/${projectData.id}`); // Volta para a página do projeto
            } catch (error) {
                alert("Erro ao atualizar o projeto.");
            }
        } else {
            const finalProject = {
                ...projectData,
                clientId: parseInt(projectData.clientId, 10),
                employeeId: parseInt(user.id, 10),
                status: "Em Andamento",
                activeStepIndex: 0,
                steps: steps,
            };

            console.log("Enviando para a API:", finalProject);
            // const createdProject = await createProject(finalProject); // Linha a ser usada com a API real
            try {
                // 3. Chame a função da API
                await createProject(finalProject);
                alert("Projeto criado com sucesso!");
                navigate(`/${user.role}/inicio`);
            } catch (error) {
                alert("Ocorreu um erro ao criar o projeto.");
            }
        }
    };

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(steps);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSteps(items);
    };

    return (
        <PageWrapper>
            <FormContainer>
                <h2>
                    {editingStepId ? "Editar Etapa" : "Adicionar Nova Etapa"}
                </h2>
                <form onSubmit={handleStepSubmit}>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            marginTop: "16px",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Nome da Etapa"
                            value={currentStep.name}
                            onChange={(e) =>
                                setCurrentStep({
                                    ...currentStep,
                                    name: e.target.value,
                                })
                            }
                            style={{ padding: "12px" }}
                            required
                        />
                        <textarea
                            placeholder="Descrição da Etapa"
                            value={currentStep.description}
                            onChange={(e) =>
                                setCurrentStep({
                                    ...currentStep,
                                    description: e.target.value,
                                })
                            }
                            style={{ padding: "12px", minHeight: "80px" }}
                        />

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "16px",
                            }}
                        >
                            <input
                                type="checkbox"
                                id="requiresDocuments"
                                checked={currentStep.requiresDocuments}
                                onChange={(e) =>
                                    setCurrentStep({
                                        ...currentStep,
                                        requiresDocuments: e.target.checked,
                                    })
                                }
                            />
                            <label htmlFor="requiresDocuments">
                                Esta etapa exige envio de documentos?
                            </label>
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: "10px",
                                backgroundColor: "#28a745",
                                color: "white",
                                fontWeight: "bold",
                                borderRadius: "4px",
                                marginTop: "16px",
                            }}
                        >
                            {editingStepId
                                ? "Atualizar Etapa"
                                : "Adicionar Etapa"}
                        </button>
                    </div>
                </form>
                <ButtonsContainer>
                    <Button
                        onClick={() =>
                            // navigate("/funcionario/novo-projeto", {
                            //     state: { projectData },
                            // })
                            navigate(-1)
                        }
                    >
                        Voltar
                    </Button>
                    <Button primary onClick={handleFinalizeProject}>
                        {isEditing ? "Salvar Alterações" : "Criar Projeto"}
                    </Button>
                </ButtonsContainer>
            </FormContainer>

            <StepsContainer>
                <h2>Etapas do Projeto</h2>
                {/* 3. Envolva a lista com os componentes */}
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="steps">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {steps.map((step, index) => (
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
                                                    <span>{step.name}</span>
                                                    <StepActions>
                                                        <FaPen
                                                            onClick={() =>
                                                                handleEditStep(
                                                                    step
                                                                )
                                                            }
                                                        />
                                                        <FaTrash
                                                            onClick={() =>
                                                                handleDeleteStep(
                                                                    step.id
                                                                )
                                                            }
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
            </StepsContainer>
        </PageWrapper>
    );
};

export default StepsPage;
