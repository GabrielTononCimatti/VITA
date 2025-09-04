import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import {
    getNotificationsForUser,
    markNotificationAsRead,
} from "../../services/notificationService";
import { FaTimes } from "react-icons/fa";

const PanelWrapper = styled.aside`
    position: fixed;
    top: 0;
    right: ${({ isOpen }) => (isOpen ? "0" : "-400px")};
    width: 400px;
    height: 100vh;
    background-color: #f8f9fa;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease-in-out;
    z-index: 1000;
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

const NotificationsPanel = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [dismissedIds, setDismissedIds] = useState([]);

    const loadNotifications = async () => {
        if (user) {
            const data = await getNotificationsForUser(user.id);
            setNotifications(data);
        }
    };

    useEffect(() => {
        // Carrega as notificações quando o painel é aberto
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen, user]);

    const handleMarkAsRead = async (notificationId) => {
        await markNotificationAsRead(notificationId);
        // Atualiza a lista visualmente sem precisar de outra chamada à API
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const handleDismiss = (notificationId) => {
        setDismissedIds((prev) => [...prev, notificationId]);
    };

    const unreadNotifications = notifications.filter(
        (n) => !n.read && !dismissedIds.includes(n.id)
    );
    const readNotifications = notifications.filter(
        (n) => n.read && !dismissedIds.includes(n.id)
    );

    return (
        <PanelWrapper isOpen={isOpen}>
            <PanelHeader>
                <h2>Notificações</h2>
                <FaTimes
                    size={24}
                    onClick={onClose}
                    style={{ cursor: "pointer" }}
                />
            </PanelHeader>
            <NotificationList>
                <h3>Não Lidas</h3>
                {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((n) => (
                        <NotificationItem key={n.id} read={false}>
                            <CloseButton onClick={() => handleDismiss(n.id)}>
                                <FaTimes />
                            </CloseButton>
                            <NotificationMessage>
                                {n.message}
                            </NotificationMessage>
                            <NotificationMeta>
                                <span>
                                    {new Date(n.createdAt).toLocaleString()}
                                </span>
                                {!n.read && (
                                    <MarkAsReadButton
                                        onClick={() => handleMarkAsRead(n.id)}
                                    >
                                        Marcar como lida
                                    </MarkAsReadButton>
                                )}
                            </NotificationMeta>
                        </NotificationItem>
                    ))
                ) : (
                    <p>Nenhuma notificação nova.</p>
                )}

                <hr style={{ margin: "20px 0" }} />

                <h3>Lidas</h3>
                {readNotifications.length > 0 ? (
                    readNotifications.map((n) => (
                        <NotificationItem key={n.id} read={true}>
                            <CloseButton onClick={() => handleDismiss(n.id)}>
                                <FaTimes />
                            </CloseButton>
                            <NotificationMessage>
                                {n.message}
                            </NotificationMessage>
                            <NotificationMeta>
                                <span>
                                    {new Date(n.createdAt).toLocaleString()}
                                </span>
                            </NotificationMeta>
                        </NotificationItem>
                    ))
                ) : (
                    <p>Nenhuma notificação lida.</p>
                )}
            </NotificationList>
        </PanelWrapper>
    );
};

export default NotificationsPanel;
