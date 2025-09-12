// Caminho: vita-frontend/src/components/layout/NotificationsPanel.js

import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { FaTimes, FaChevronUp, FaChevronDown } from "react-icons/fa";
import {
    getReceivedNotifications,
    getSentNotifications,
    markAsRead,
} from "../../services/notificationService";

// --- Styled Components (Preservados) ---

const PanelOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
    opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 1000;
`;

const PanelContainer = styled.aside`
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    height: 100%;
    background-color: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transform: translateX(${({ isOpen }) => (isOpen ? "0" : "100%")});
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    z-index: 1001;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
`;

const Content = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
`;

const Section = styled.div`
    margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
    margin-top: 0;
    color: ${({ theme }) => theme.colors.primary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer; // Para indicar que é clicável
`;

const NotificationItem = styled.div`
    padding: 12px;
    border-radius: 4px;
    background-color: ${({ read }) => (read ? "#f9f9f9" : "#eef2f7")};
    margin-bottom: 10px;
    position: relative;

    strong {
        display: block;
        margin-bottom: 4px;
    }
    p {
        margin: 0;
        font-size: 14px;
    }
`;

const MarkAsReadButton = styled.button`
    margin-top: 8px;
    font-size: 12px;
    padding: 4px 8px;
    cursor: pointer;
`;

const DeleteButton = styled(CloseButton)`
    position: absolute;
    top: 5px;
    right: 5px;
    font-size: 14px;
    color: #999;
`;

// NOVO: Componente para o filtro de Recebidas/Enviadas
const FilterTabs = styled.div`
    display: flex;
    border-bottom: 1px solid #eee;
`;

const TabButton = styled.button`
    flex: 1;
    padding: 12px;
    background: ${({ active }) => (active ? "#f0f0f0" : "white")};
    border: none;
    font-weight: bold;
    cursor: pointer;
`;

// --- Componente ---
const NotificationsPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState("received"); // 'received' ou 'sent'

    const [isUnreadCollapsed, setUnreadCollapsed] = useState(false);
    const [isReadCollapsed, setReadCollapsed] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data =
                view === "received"
                    ? await getReceivedNotifications()
                    : await getSentNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error("Falha ao buscar notificações:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Busca as notificações sempre que o painel for aberto ou a visualização mudar
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, view]);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markAsRead(id);
            // Atualiza a notificação na lista localmente para refletir a mudança instantaneamente
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
        } catch (error) {
            alert("Não foi possível marcar como lida.");
        }
    };

    // const handleDelete = async (id) => {
    //     if (
    //         window.confirm("Tem certeza que deseja excluir esta notificação?")
    //     ) {
    //         try {
    //             await deleteNotification(id);
    //             // Remove a notificação da lista local
    //             setNotifications((prev) => prev.filter((n) => n.id !== id));
    //         } catch (error) {
    //             alert("Não foi possível excluir a notificação.");
    //         }
    //     }
    // };

    const { unreadNotifications, readNotifications } = useMemo(() => {
        const unread = notifications.filter((n) => !n.read);
        const read = notifications.filter((n) => n.read);
        return { unreadNotifications: unread, readNotifications: read };
    }, [notifications]);

    return (
        <PanelOverlay isOpen={isOpen} onClick={onClose}>
            <PanelContainer
                isOpen={isOpen}
                onClick={(e) => e.stopPropagation()}
            >
                <Header>
                    <h2>Notificações</h2>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </Header>

                <FilterTabs>
                    <TabButton
                        active={view === "received"}
                        onClick={() => setView("received")}
                    >
                        Recebidas
                    </TabButton>
                    <TabButton
                        active={view === "sent"}
                        onClick={() => setView("sent")}
                    >
                        Enviadas
                    </TabButton>
                </FilterTabs>

                {/* <Content>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : (
                        <>
                            <Section>
                                <SectionTitle>Não Lidas</SectionTitle>
                                {unreadNotifications.length > 0 ? (
                                    unreadNotifications.map((n) => (
                                        <NotificationItem key={n.id}>
                                            <DeleteButton
                                                onClick={() =>
                                                    handleDelete(n.id)
                                                }
                                            >
                                                <FaTimes />
                                            </DeleteButton>
                                            <strong>{n.subject}</strong>
                                            <p>{n.message}</p>
                                            {view === "received" && (
                                                <MarkAsReadButton
                                                    onClick={() =>
                                                        handleMarkAsRead(n.id)
                                                    }
                                                >
                                                    Marcar como lida
                                                </MarkAsReadButton>
                                            )}
                                        </NotificationItem>
                                    ))
                                ) : (
                                    <p>Nenhuma notificação nova.</p>
                                )}
                            </Section>
                            <Section>
                                <SectionTitle>Lidas</SectionTitle>
                                {readNotifications.length > 0 ? (
                                    readNotifications.map((n) => (
                                        <NotificationItem key={n.id} read>
                                            <DeleteButton
                                                onClick={() =>
                                                    handleDelete(n.id)
                                                }
                                            >
                                                <FaTimes />
                                            </DeleteButton>
                                            <strong>{n.subject}</strong>
                                            <p>{n.message}</p>
                                        </NotificationItem>
                                    ))
                                ) : (
                                    <p>Nenhuma notificação lida.</p>
                                )}
                            </Section>
                        </>
                    )}
                </Content> */}
                <Content>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : view === "received" ? (
                        <>
                            <Section>
                                <SectionTitle
                                    onClick={() =>
                                        setUnreadCollapsed(!isUnreadCollapsed)
                                    }
                                >
                                    <span>Não Lidas</span>
                                    {isUnreadCollapsed ? (
                                        <FaChevronDown />
                                    ) : (
                                        <FaChevronUp />
                                    )}
                                </SectionTitle>
                                {!isUnreadCollapsed &&
                                    (unreadNotifications.length > 0 ? (
                                        unreadNotifications.map((n) => (
                                            <NotificationItem key={n.id}>
                                                <strong>{n.subject}</strong>
                                                <p>{n.message}</p>
                                                <MarkAsReadButton
                                                    onClick={(e) =>
                                                        handleMarkAsRead(
                                                            n.id,
                                                            e
                                                        )
                                                    }
                                                >
                                                    Marcar como lida
                                                </MarkAsReadButton>
                                            </NotificationItem>
                                        ))
                                    ) : (
                                        <p>Nenhuma notificação nova.</p>
                                    ))}
                            </Section>
                            <Section>
                                <SectionTitle
                                    onClick={() =>
                                        setReadCollapsed(!isReadCollapsed)
                                    }
                                >
                                    <span>Lidas</span>
                                    {isReadCollapsed ? (
                                        <FaChevronDown />
                                    ) : (
                                        <FaChevronUp />
                                    )}
                                </SectionTitle>
                                {!isReadCollapsed &&
                                    (readNotifications.length > 0 ? (
                                        readNotifications.map((n) => (
                                            <NotificationItem key={n.id} read>
                                                <strong>{n.subject}</strong>
                                                <p>{n.message}</p>
                                            </NotificationItem>
                                        ))
                                    ) : (
                                        <p>Nenhuma notificação lida.</p>
                                    ))}
                            </Section>
                        </>
                    ) : (
                        // Visualização para "Enviadas" - sem divisão de lidas/não lidas
                        <Section>
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <NotificationItem key={n.id} read>
                                        <strong>{n.subject}</strong>
                                        <p>{n.message}</p>
                                    </NotificationItem>
                                ))
                            ) : (
                                <p>Nenhuma notificação enviada.</p>
                            )}
                        </Section>
                    )}
                </Content>
            </PanelContainer>
        </PanelOverlay>
    );
};

export default NotificationsPanel;
