import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import HomePage from "./HomePage";
import CreateProjectPage from "./CreateProjectPage";
import StepsPage from "./StepsPage";
import EditProjectPage from "./EditProjectPage";
import SearchPage from "./SearchPage";
import ProjectPage from "./ProjectPage";
import ProfilePage from "./ProfilePage";
import DocumentsPage from "./DocumentsPage";
import NotificationsPanel from "../../components/layout/NotificationsPanel";

const LayoutWrapper = styled.div`
    display: flex;
`;

const MainContent = styled.main`
    flex-grow: 1;
    margin-left: 250px; // Largura da sidebar aberta
    transition: margin-left 0.3s ease;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

const EmployeeLayout = () => {
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);

    return (
        <LayoutWrapper>
            <Sidebar
                onToggleNotifications={() =>
                    setNotificationsOpen(!isNotificationsOpen)
                }
            />
            <MainContent>
                <Topbar />
                <div style={{ padding: "24px" }}>
                    <Routes>
                        <Route path="inicio" element={<HomePage />} />
                        <Route
                            path="novo-projeto"
                            element={<CreateProjectPage />}
                        />{" "}
                        <Route
                            path="novo-projeto/etapas"
                            element={<StepsPage />}
                        />
                        <Route path="pesquisa" element={<SearchPage />} />
                        <Route
                            path="projeto/:projectId"
                            element={<ProjectPage />}
                        />
                        <Route
                            path="projeto/:projectId/editar"
                            element={<EditProjectPage />}
                        />
                        <Route
                            path="projeto/:projectId/editar-etapas"
                            element={<StepsPage />}
                        />
                        <Route
                            path="projeto/:projectId/etapa/:etapaId/documentos"
                            element={<DocumentsPage />}
                        />
                        <Route path="perfil" element={<ProfilePage />} />
                    </Routes>
                </div>
            </MainContent>

            <NotificationsPanel
                isOpen={isNotificationsOpen}
                onClose={() => setNotificationsOpen(false)}
            />
        </LayoutWrapper>
    );
};

export default EmployeeLayout;
