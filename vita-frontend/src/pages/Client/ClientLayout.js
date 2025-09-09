import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import NotificationsPanel from "../../components/layout/NotificationsPanel";
import ClientHomePage from "./ClientHomePage"; // Página inicial do cliente
// import ClientProjectPage from "./ClientProjectPage"; // Página de projeto do cliente
import ProjectPage from "../Employee/ProjectPage";
import ClientSearchPage from "./ClientSearchPage";
// A página de pesquisa pode ser reutilizada ou adaptada se necessário
import DocumentsPage from "../Employee/DocumentsPage/index";
import SearchPage from "../Employee/SearchPage";
import ProfilePage from "../Employee/ProfilePage/index";

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

const ClientLayout = () => {
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
                        <Route path="inicio" element={<ClientHomePage />} />
                        <Route path="pesquisa" element={<ClientSearchPage />} />
                        {/* Reutilizando a SearchPage */}
                        <Route
                            path="projeto/:projectId"
                            element={<ProjectPage />}
                        />
                        <Route
                            path="projeto/:projectId/etapa/:etapaId/documentos"
                            element={<DocumentsPage />}
                        />
                        <Route path="perfil" element={<ProfilePage />} />
                        <Route path="*" element={<ClientHomePage />} />
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

export default ClientLayout;
