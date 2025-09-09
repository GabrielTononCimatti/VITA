import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import NotificationsPanel from "../../components/layout/NotificationsPanel";
// Vamos reutilizar e adaptar as páginas do funcionário
import AdminHomePage from "./AdminHomePage";
import AdminSearchPage from "./AdminSearchPage";
import PeoplePage from "./PeoplePage";
import CreatePersonPage from "./CreatePersonPage";
import EditPersonPage from "./EditPersonPage";
import EmployeeProjectPage from "../Employee/ProjectPage";
import ProfilePage from "../Employee/ProfilePage";
import StepsPage from "../Employee/StepsPage";
import DocumentsPage from "../Employee/DocumentsPage";

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

const AdminLayout = () => {
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
                        <Route path="inicio" element={<AdminHomePage />} />
                        <Route path="pesquisa" element={<AdminSearchPage />} />
                        <Route
                            path="projeto/:projectId"
                            element={<EmployeeProjectPage />}
                        />
                        <Route path="perfil" element={<ProfilePage />} />
                        <Route path="pessoas" element={<PeoplePage />} />
                        <Route
                            path="pessoas/novo"
                            element={<CreatePersonPage />}
                        />
                        <Route
                            path="pessoas/editar/:userId"
                            element={<EditPersonPage />}
                        />

                        <Route
                            path="novo-projeto/etapas"
                            element={<StepsPage />}
                        />
                        <Route
                            path="projeto/:projectId/etapa/:etapaId/documentos"
                            element={<DocumentsPage />}
                        />
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

export default AdminLayout;
