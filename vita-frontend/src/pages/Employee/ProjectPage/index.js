// Caminho: vita-frontend/src/pages/Employee/ProjectPage/index.js

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
    getProjectById,
    advanceProjectStage,
    returnProjectStage,
} from "../../../services/projectService";
import { useAuth } from "../../../contexts/AuthContext";
import { getDisplayName } from "../../../utils/peopleUtils";
import {
    FaFileAlt,
    FaCog,
    FaCheckCircle,
    FaChevronRight,
    FaChevronLeft,
    FaEdit,
    FaFileMedical,
} from "react-icons/fa";

// --- Styled Components (sem alterações) ---
const ProjectPageWrapper = styled.div`
    padding: 24px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    flex-wrap: wrap;
`;

const TitleSection = styled.div`
    h1 {
        color: ${({ theme }) => theme.colors.primary};
        margin: 0;
    }
    p {
        margin: 5px 0 0;
        color: #666;
    }
`;

const DatesSection = styled.div`
    text-align: right;
    color: #333;
`;

const StagesContainer = styled.div`
    display: flex;
    align-items: center;
    overflow-x: auto;
    padding-bottom: 20px;
    margin-bottom: 32px;
`;

const StageItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 120px;
    cursor: pointer; // Adicionado para indicar que é clicável
`;

const StageCircle = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    border: 3px solid;
    background-color: ${({ status }) => {
        if (status === "Finalizada") return "#28a745";
        if (status === "Em andamento") return "#163560"; // Azul para a etapa ativa
        return "#fff";
    }};
    border-color: ${({ status }) => {
        if (status === "Finalizada") return "#28a745";
        if (status === "Em andamento") return "#163560";
        return "#ccc";
    }};
    color: ${({ status }) => {
        if (status === "Finalizada" || status === "Em andamento") return "#fff";
        return "#ccc";
    }};
`;

const StageName = styled.p`
    margin-top: 8px;
    font-weight: bold;
    color: #333;
`;

const StageLine = styled.div`
    flex-grow: 1;
    height: 3px;
    background-color: #ccc;
    margin: 0 10px;
    transform: translateY(-25px);
`;

const DetailsWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
`;

const InfoCard = styled.div`
    background-color: #fff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    h3 {
        margin-top: 0;
        color: ${({ theme }) => theme.colors.primary};
    }
`;

const ActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
`;

const ActionButton = styled.button`
    padding: 10px 15px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: ${({ theme, variant }) =>
        variant === "primary" ? theme.colors.primary : "#f1f1f1"};
    color: ${({ theme, variant }) =>
        variant === "primary" ? "white" : "#333"};

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
        color: #666;
    }
`;

// --- Componente da Página ---
const ProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // NOVO: Estado para controlar qual etapa está selecionada para exibição
    const [selectedStage, setSelectedStage] = useState(null);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const data = await getProjectById(projectId);
            setProjectData(data);

            const stages = data.project.stages.sort(
                (a, b) => a.order - b.order
            );
            // NOVO: Ao carregar, define a etapa selecionada como a etapa ativa do projeto
            const activeStageOnInit = stages.find(
                (s) => s.status === "Em andamento"
            );
            setSelectedStage(activeStageOnInit || stages[stages.length - 1]);
        } catch (err) {
            console.error("Erro ao buscar dados do projeto:", err);
            setError("Não foi possível carregar o projeto.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId]);

    const handleAdvanceStage = async () => {
        if (
            window.confirm(
                "Tem certeza que deseja avançar para a próxima etapa?"
            )
        ) {
            try {
                await advanceProjectStage(projectId);
                fetchProject();
            } catch (err) {
                alert("Erro ao avançar etapa.");
            }
        }
    };

    const handleReturnStage = async () => {
        const message =
            projectData?.project?.status === "Finalizado"
                ? "Este projeto está finalizado. Deseja reabri-lo na última etapa?"
                : "Tem certeza que deseja retornar para a etapa anterior?";

        if (window.confirm(message)) {
            try {
                await returnProjectStage(projectId);
                fetchProject();
            } catch (err) {
                alert("Erro ao retornar etapa.");
            }
        }
    };

    const canEdit = user?.role === "admin" || user?.role === "employee";

    if (loading) return <div>Carregando projeto...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!projectData) return <div>Projeto não encontrado.</div>;

    const { project, client, employee } = projectData;
    const stages = project.stages.sort((a, b) => a.order - b.order);
    const activeStage = stages.find((s) => s.status === "Em andamento");
    const lastStage = stages[stages.length - 1];

    // Lógica de habilitação dos botões
    const isAdvanceEnabled =
        activeStage && selectedStage?.id === activeStage?.id;
    const isReturnEnabled =
        (activeStage && selectedStage?.id === activeStage?.id) ||
        (project.status === "Finalizado" &&
            selectedStage?.id === lastStage?.id);

    // NOVO: Função para obter o ícone correto com base na posição
    const getStageIcon = (index, totalStages) => {
        if (index === 0) return <FaFileAlt />;
        if (index === totalStages - 1) return <FaCheckCircle />;
        return <FaCog />;
    };

    return (
        <ProjectPageWrapper>
            <Header>
                <TitleSection>
                    <h1>{project.name}</h1>
                    <p>ID do Projeto: {project.id}</p>
                </TitleSection>
                <DatesSection>
                    <p>
                        <strong>Início:</strong>{" "}
                        {new Date(project.startDate).toLocaleDateString()}
                    </p>
                    {project.expectedEndDate && (
                        <p>
                            <strong>Previsão de Término:</strong>{" "}
                            {new Date(
                                project.expectedEndDate
                            ).toLocaleDateString()}
                        </p>
                    )}
                </DatesSection>
            </Header>

            <StagesContainer>
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.id}>
                        {/* NOVO: Adicionado onClick para atualizar a etapa selecionada */}
                        <StageItem onClick={() => setSelectedStage(stage)}>
                            <StageCircle status={stage.status}>
                                {getStageIcon(index, stages.length)}
                            </StageCircle>
                            <StageName>{stage.name}</StageName>
                        </StageItem>
                        {index < stages.length - 1 && <StageLine />}
                    </React.Fragment>
                ))}
            </StagesContainer>

            <DetailsWrapper>
                <InfoCard>
                    <h3>Informações Gerais</h3>
                    <p>
                        <strong>Cliente:</strong>{" "}
                        {client ? getDisplayName(client.personData) : "N/A"}
                    </p>
                    <p>
                        <strong>Responsável:</strong>{" "}
                        {employee ? getDisplayName(employee.personData) : "N/A"}
                    </p>
                    <p>
                        <strong>Descrição do Projeto:</strong>{" "}
                        {project.description || "Sem descrição."}
                    </p>
                </InfoCard>

                {/* NOVO: Este card agora mostra os dados da 'selectedStage' */}
                {selectedStage ? (
                    <InfoCard>
                        <h3>Detalhes da Etapa: {selectedStage.name}</h3>
                        <p>
                            <strong>Descrição:</strong>{" "}
                            {selectedStage.description ||
                                "Sem descrição para esta etapa."}
                        </p>
                        {selectedStage.requiresDocument && (
                            <ActionButton
                                variant="secondary"
                                onClick={() =>
                                    navigate(
                                        `/${user.role}/projeto/${projectId}/etapa/${selectedStage.id}/documentos`
                                    )
                                }
                            >
                                <FaFileMedical /> Ver Documentos
                            </ActionButton>
                        )}
                    </InfoCard>
                ) : (
                    <InfoCard>
                        <h3>Selecione uma etapa para ver os detalhes</h3>
                    </InfoCard>
                )}

                {canEdit && (
                    <ActionsContainer>
                        {/* NOVO: Botões desabilitados se a etapa selecionada não for a ativa */}
                        <ActionButton
                            variant="primary"
                            onClick={handleAdvanceStage}
                            disabled={!isAdvanceEnabled}
                        >
                            <FaChevronRight /> Avançar Etapa
                        </ActionButton>
                        <ActionButton
                            variant="secondary"
                            onClick={handleReturnStage}
                            disabled={!isReturnEnabled}
                        >
                            <FaChevronLeft /> Voltar Etapa
                        </ActionButton>
                        <ActionButton
                            variant="secondary"
                            onClick={() =>
                                navigate(
                                    `/${user.role}/projeto/${projectId}/editar-etapas`
                                )
                            }
                        >
                            <FaEdit /> Editar Etapas
                        </ActionButton>
                    </ActionsContainer>
                )}
            </DetailsWrapper>
        </ProjectPageWrapper>
    );
};

export default ProjectPage;
