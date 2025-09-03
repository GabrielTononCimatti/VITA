import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById } from "../../services/projectService"; // Reutilizamos o serviço
import { FaFileAlt, FaCogs, FaCheckCircle } from "react-icons/fa";

// Copie todos os styled-components da EmployeeProjectPage
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

const ClientProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewedStepIndex, setViewedStepIndex] = useState(0);

    useEffect(() => {
        getProjectById(projectId).then((data) => {
            setProject(data);
            if (data) {
                setViewedStepIndex(data.activeStepIndex);
            }
            setLoading(false);
        });
    }, [projectId]);

    if (loading) return <p>A carregar projeto...</p>;
    if (!project) return <p>Projeto não encontrado.</p>;

    const activeStepIndex = project.activeStepIndex;
    const viewedStep = project.steps[viewedStepIndex];

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
                        {viewedStep.requiresDocuments && (
                            <ActionButton
                                onClick={() =>
                                    navigate(
                                        `/client/projeto/${projectId}/etapa/${viewedStep.id}/documentos`
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
        </div>
    );
};

export default ClientProjectPage;
