import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
    getNotificationsForProject,
    markNotificationAsRead,
} from "../../services/notificationService";
import { FaTimes } from "react-icons/fa";

// Copie os styled-components do NotificationsPanel.js original
const PanelWrapper = styled.aside`
    position: fixed;
    top: 0;
    right: ${({ isOpen }) => (isOpen ? "0" : "-400px")};
    width: 400px;
    height: 100vh;
    background-color: #f8f9fa;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease-in-out;
    z-index: 1001; // Z-index maior para sobrepor o outro painel se necessário
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-left: 1px solid #ddd;

    @media (max-width: 480px) {
        width: 100%;
        right: ${({ isOpen }) => (isOpen ? "0" : "-100%")};
    }
`;

const PanelHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
        color: ${({ theme }) => theme.colors.primary};
        font-size: 20px; // Um pouco menor para diferenciar
    }
`;

const NotificationList = styled.div`
    overflow-y: auto;
    flex-grow: 1;
`;

const NotificationItem = styled.div`
    background-color: white;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 10px;
    border-left: 4px solid
        ${({ theme, read }) => (read ? "#ccc" : theme.colors.primary)};
    position: relative;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    cursor: pointer;
    color: #aaa;
    font-size: 14px;
`;

const NotificationMessage = styled.p`
    margin-bottom: 10px;
`;

const NotificationMeta = styled.div`
    font-size: 12px;
    color: #6c757d;
    display: flex;
    justify-content: space-between;
`;

const MarkAsReadButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.blue};
    font-weight: bold;
    cursor: pointer;
`;

const ProjectNotificationsPanel = ({
    projectId,
    projectName,
    isOpen,
    onClose,
}) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dismissedIds, setDismissedIds] = useState([]);

    const loadNotifications = async () => {
        if (!projectId) return;
        setLoading(true);
        let data = await getNotificationsForProject(projectId);

        if (Array.isArray(data)) {
            data = data.filter(
                (notification) => notification.projectId === projectId
            );
        }

        setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        } else {
            // Limpa as notificações dispensadas quando o painel fecha
            setDismissedIds([]);
        }
    }, [isOpen, projectId]);

    const handleMarkAsRead = async (notificationId) => {
        await markNotificationAsRead(notificationId);
        // Atualiza a lista visualmente
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const handleDismiss = (notificationId) => {
        setDismissedIds((prev) => [...prev, notificationId]);
    };

    // NOVO: Lógica para separar notificações lidas e não lidas
    const unreadNotifications = notifications.filter(
        (n) => !n.read && !dismissedIds.includes(n.id)
    );
    const readNotifications = notifications.filter(
        (n) => n.read && !dismissedIds.includes(n.id)
    );

    return (
        <PanelWrapper isOpen={isOpen}>
            <PanelHeader>
                <h2>Notificações de "{projectName}"</h2>
                <FaTimes
                    size={24}
                    onClick={onClose}
                    style={{ cursor: "pointer" }}
                />
            </PanelHeader>
            <NotificationList>
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <>
                        {/* NOVO: Seção de Não Lidas */}
                        <h3>Não Lidas</h3>
                        {unreadNotifications.length > 0 ? (
                            unreadNotifications.map((n) => (
                                <NotificationItem key={n.id} read={false}>
                                    <CloseButton
                                        onClick={() => handleDismiss(n.id)}
                                    >
                                        <FaTimes />
                                    </CloseButton>
                                    <NotificationMessage>
                                        {n.message}
                                    </NotificationMessage>
                                    <NotificationMeta>
                                        <span>
                                            {new Date(
                                                n.createdAt
                                            ).toLocaleString()}
                                        </span>
                                        <MarkAsReadButton
                                            onClick={() =>
                                                handleMarkAsRead(n.id)
                                            }
                                        >
                                            Marcar como lida
                                        </MarkAsReadButton>
                                    </NotificationMeta>
                                </NotificationItem>
                            ))
                        ) : (
                            <p>Nenhuma notificação nova.</p>
                        )}

                        <hr style={{ margin: "20px 0" }} />

                        {/* NOVO: Seção de Lidas */}
                        <h3>Lidas</h3>
                        {readNotifications.length > 0 ? (
                            readNotifications.map((n) => (
                                <NotificationItem key={n.id} read={true}>
                                    <CloseButton
                                        onClick={() => handleDismiss(n.id)}
                                    >
                                        <FaTimes />
                                    </CloseButton>
                                    <NotificationMessage>
                                        {n.message}
                                    </NotificationMessage>
                                    <NotificationMeta>
                                        <span>
                                            {new Date(
                                                n.createdAt
                                            ).toLocaleString()}
                                        </span>
                                    </NotificationMeta>
                                </NotificationItem>
                            ))
                        ) : (
                            <p>Nenhuma notificação lida.</p>
                        )}
                    </>
                )}
            </NotificationList>
        </PanelWrapper>
    );
};

export default ProjectNotificationsPanel;
