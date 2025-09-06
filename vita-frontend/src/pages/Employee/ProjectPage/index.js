import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import {
    getProjectById,
    updateProject,
} from "../../../services/projectService";
import { FaFileAlt, FaCogs, FaCheckCircle, FaPen } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

// --- Styled Components ---
const Header = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const ProjectTitle = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
`;

const DatesInfo = styled.p`
    color: ${({ theme }) => theme.colors.textLight};
`;

const StepsTracker = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap; // Para quebrar a linha em telas menores
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const StepButton = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.small};
    cursor: pointer;
    text-align: center;

    // O círculo
    div {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        color: ${({ theme, active, completed }) =>
            active || completed ? theme.colors.white : theme.colors.black};
        background-color: ${({ theme, active, completed }) => {
            if (completed) return theme.colors.green;
            if (active) return theme.colors.blue;
            return theme.colors.white;
        }};
        border: 2px solid
            ${({ theme, active, completed }) => {
                if (completed) return theme.colors.green;
                if (active) return theme.colors.blue;
                return "#ccc";
            }};
        transition: all 0.3s ease;
    }
`;

const StepConnector = styled.div`
    flex-grow: 1;
    height: 2px;
    background-color: #ccc;
    margin: 0 10px;
    margin-bottom: 25px; // Para alinhar com os círculos
`;

const DetailsWrapper = styled.div`
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: ${({ theme }) => theme.spacing.large};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const InfoBox = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    padding: ${({ theme }) => theme.spacing.large};
    border-radius: ${({ theme }) => theme.borderRadius};
`;

const ActionsContainer = styled.div`
    margin-top: ${({ theme }) => theme.spacing.large};
    padding: ${({ theme }) => theme.spacing.medium};
    background-color: #f8f9fa;
    border-radius: ${({ theme }) => theme.borderRadius};
    display: flex;
    justify-content: flex-end;
    gap: ${({ theme }) => theme.spacing.medium};
`;

const ActionButton = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 4px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: ${({ theme, primary, secondary }) => {
        if (primary) return theme.colors.primary;
        if (secondary) return "#6c757d"; // Cinza para ações secundárias
        return theme.colors.blue; // Azul para ação principal
    }};

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const ProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [activeStepIndex, setActiveStepIndex] = useState(0); // Simulação do estado ativo
    const [viewedStepIndex, setViewedStepIndex] = useState(0);

    const basePath = `/${user.role}`;

    const loadProject = useCallback(async () => {
        setLoading(true);
        const data = await getProjectById(projectId);
        setProject(data);
        if (data) {
            setViewedStepIndex(data.activeStepIndex);
        }
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            loadProject();
        }
    }, [projectId, loadProject]);

    const handleStepProgression = async (direction) => {
        if (!project) return;

        const currentStepIndex = project.activeStepIndex;
        const currentStep = project.steps[currentStepIndex];

        const actionText = direction > 0 ? "avançar" : "regredir";
        const confirmationMessage = `Você tem certeza que deseja ${actionText} a etapa "${currentStep.name}"?`;

        // if (window.confirm(confirmationMessage)) {
        //     const totalSteps = project.steps.length;
        //     let nextStepIndex = currentStepIndex + direction;

        //     if (direction > 0 && nextStepIndex >= totalSteps) {
        //         if (
        //             window.confirm(
        //                 "Você tem certeza que deseja finalizar este projeto?"
        //             )
        //         ) {
        //             try {
        //                 await updateProject(projectId, { status: "Concluído" });
        //                 alert("Projeto finalizado!");
        //                 navigate(`/${user.role}/pesquisa`);
        //             } catch (error) {
        //                 alert("Não foi possível finalizar o projeto.");
        //             }
        //         }
        //         return;
        //     }

        //     if (direction < 0 && nextStepIndex < 0) {
        //         alert("Não é possível regredir a partir da primeira etapa.");
        //         return;
        //     }

        //     try {
        //         await updateProject(projectId, {
        //             activeStepIndex: nextStepIndex,
        //         });
        //         loadProject();
        //     } catch (error) {
        //         alert("Não foi possível alterar a etapa.");
        //     }
        // }
        if (window.confirm(confirmationMessage)) {
            const totalSteps = project.steps.length;
            const nextStepIndex = currentStepIndex + direction;

            // Lógica para AVANÇAR de etapa
            if (direction > 0) {
                if (nextStepIndex >= totalSteps) {
                    if (
                        window.confirm(
                            "Esta é a última etapa. Deseja finalizar o projeto?"
                        )
                    ) {
                        await updateProject(projectId, { status: "Concluído" });
                        alert("Projeto finalizado!");
                        navigate(`/${user.role}/pesquisa`);
                    }
                    return;
                }
                // Ao avançar, o projeto está sempre 'Em Andamento' (a menos que a data o torne 'Atrasado')
                await updateProject(projectId, {
                    activeStepIndex: nextStepIndex,
                    status: "Em Andamento",
                });
                loadProject(); // Recarrega para verificar o estado de atraso
                return;
            }

            // Lógica para REGREDIR de etapa
            if (direction < 0) {
                if (nextStepIndex < 0) {
                    alert(
                        "Não é possível regredir a partir da primeira etapa."
                    );
                    return;
                }

                // --- NOVAS REGRAS DE NEGÓCIO APLICADAS AQUI ---
                let newStatus = project.status;

                // REGRA 1: Se o projeto estava 'Concluído', ele volta a estar 'Em Andamento'.
                if (project.status === "Concluído") {
                    newStatus = "Em Andamento";
                }

                // REGRA 2: Verifica se o projeto deve passar a 'Atrasado'.
                // Isto acontece se a data de entrega prevista já passou.
                if (project.data_fim_prevista) {
                    const deadline = new Date(project.data_fim_prevista);
                    const today = new Date();
                    // Normalizamos as datas para comparar apenas o dia, sem a hora.
                    deadline.setHours(23, 59, 59, 999);
                    today.setHours(0, 0, 0, 0);

                    if (deadline < today) {
                        newStatus = "Atrasado";
                    }
                }

                try {
                    // Atualiza tanto o índice da etapa como o novo status calculado.
                    await updateProject(projectId, {
                        activeStepIndex: nextStepIndex,
                        status: newStatus,
                    });
                    loadProject(); // Recarrega os dados para mostrar o estado atualizado na tela.
                } catch (error) {
                    alert("Não foi possível alterar a etapa.");
                }
            }
        }
    };

    if (loading) {
        return <p>Carregando projeto...</p>;
    }

    if (!project || !project.steps) {
        return <p>Projeto não encontrado ou não possui etapas.</p>;
    }

    const activeStepIndex = project.activeStepIndex;
    const selectedStep = project.steps[activeStepIndex];
    const viewedStep = project.steps[viewedStepIndex];

    if (!selectedStep) return <p>Erro ao carregar detalhes da etapa.</p>;

    return (
        <div>
            <Header>
                <ProjectTitle>
                    {project.name} - {project.id}
                </ProjectTitle>
                <DatesInfo>
                    Início: {new Date(project.startDate).toLocaleDateString()}
                    {project.endDate &&
                        ` | Término: ${new Date(
                            project.endDate
                        ).toLocaleDateString()}`}
                </DatesInfo>
            </Header>

            <StepsTracker>
                {project.steps.map((step, index) => (
                    <React.Fragment key={step.id || index}>
                        <StepButton
                            completed={index < activeStepIndex}
                            active={index === activeStepIndex}
                            onClick={() => setViewedStepIndex(index)}
                        >
                            {/* Ícones podem ser mapeados com base no nome ou em uma propriedade 'icon' */}
                            <div>
                                {step.name === "Contrato" ? (
                                    <FaFileAlt />
                                ) : step.name === "Desenvolvimento" ? (
                                    <FaCogs />
                                ) : (
                                    <FaCheckCircle />
                                )}
                            </div>
                            <span>{step.name}</span>
                        </StepButton>
                        {index < project.steps.length - 1 && <StepConnector />}
                    </React.Fragment>
                ))}
            </StepsTracker>

            {viewedStep && (
                <DetailsWrapper>
                    <InfoBox>
                        <h3>Descrição do Projeto</h3>
                        <p>{project.description}</p>
                    </InfoBox>
                    <InfoBox>
                        <h3>{viewedStep.name}</h3>
                        <p>{viewedStep.description}</p>
                        {/* antes tava com esse: */}
                        {/* <div
                        style={{
                            marginTop: "20px",
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <button
                            onClick={() => handleStepProgression(1)}
                            style={{
                                padding: "10px",
                                backgroundColor: "#007bff",
                                color: "white",
                                borderRadius: "4px",
                            }}
                        >
                            Avançar Etapa
                        </button>
                        <button
                            onClick={() => handleStepProgression(-1)}
                            style={{ padding: "10px" }}
                        >
                            Voltar Etapa
                        </button>
                    </div> */}
                        {viewedStep.requiresDocuments && (
                            <ActionButton
                                secondary
                                onClick={() =>
                                    navigate(
                                        `${basePath}/projeto/${projectId}/etapa/${viewedStep.id}/documentos`
                                    )
                                }
                                style={{ marginTop: "20px" }}
                            >
                                Ver Documentos
                            </ActionButton>
                        )}
                    </InfoBox>
                </DetailsWrapper>
            )}

            <ActionsContainer>
                <ActionButton
                    secondary
                    onClick={() =>
                        navigate(`/${user.role}/novo-projeto/etapas`, {
                            state: { projectData: project, isEditing: true },
                        })
                    }
                >
                    <FaPen /> Editar Etapas
                </ActionButton>

                {/* Botões de progressão só ficam ativos se estivermos vendo a etapa ativa */}
                <ActionButton
                    onClick={() => handleStepProgression(-1)}
                    disabled={viewedStepIndex !== activeStepIndex}
                >
                    Voltar Etapa
                </ActionButton>
                <ActionButton
                    onClick={() => handleStepProgression(1)}
                    disabled={viewedStepIndex !== activeStepIndex}
                >
                    Avançar Etapa
                </ActionButton>
            </ActionsContainer>

            {/* <InfoBox>
                <h3>{selectedStep.name}</h3>
                <p>{selectedStep.description}</p>
                <div
                    style={{ marginTop: "20px", display: "flex", gap: "10px" }}
                >
                    <button
                        onClick={() => handleStepProgression(1)}
                        style={{
                            padding: "10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            borderRadius: "4px",
                        }}
                    >
                        Avançar Etapa
                    </button>
                    <button
                        onClick={() => handleStepProgression(-1)}
                        style={{ padding: "10px" }}
                    >
                        Voltar Etapa
                    </button>
                </div>
            </InfoBox> */}
        </div>
    );
};

export default ProjectPage;
