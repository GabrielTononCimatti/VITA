import React, { useState } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    FaHome,
    FaSearch,
    FaBell,
    FaPlus,
    FaBars,
    FaTimes,
    FaUserFriends,
} from "react-icons/fa";
// Lembre-se de adicionar a logo na pasta `src/assets`
// import VitaLogo from '../../assets/vita-logo.png';

const SidebarWrapper = styled.div`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    height: 100vh;
    width: ${({ isOpen }) => (isOpen ? "250px" : "80px")};
    position: fixed;
    top: 0;
    left: 0;
    padding: ${({ theme }) => theme.spacing.medium};
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: ${({ isOpen }) => (isOpen ? "250px" : "0")};
        padding: ${({ isOpen }) => (isOpen ? "16px" : "0")};
        overflow: hidden;
    }
`;

const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    padding: 12px 0;
    color: ${({ theme }) => theme.colors.white};
    text-decoration: none;
    font-size: 16px;
    gap: ${({ theme }) => theme.spacing.medium};

    &.active {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding-left: 10px;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
`;

const IconWrapper = styled.div`
    font-size: 20px;
    min-width: 40px;
    text-align: center;
`;

const NavLabel = styled.span`
    opacity: ${({ isOpen }) => (isOpen ? "1" : "0")};
    transition: opacity 0.3s ease;
    white-space: nowrap;

    @media (max-width: 768px) {
        opacity: 1;
    }
`;

const ToggleButton = styled.button`
    display: none; // Só aparece em mobile
    @media (max-width: 768px) {
        display: block;
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 1001;
        font-size: 24px;
        color: ${({ theme }) => theme.colors.primary};
    }
`;

const Sidebar = ({ onToggleNotifications }) => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(true);

    // Define o prefixo do caminho com base no perfil
    const basePath = `/${user.role}`;

    return (
        <>
            <ToggleButton onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <FaTimes /> : <FaBars />}
            </ToggleButton>

            <SidebarWrapper isOpen={isOpen}>
                {/* Adicionar a logo aqui quando tiver o arquivo */}
                {/* <img src={VitaLogo} alt="VITA Logo" /> */}

                <h2
                    style={{
                        textAlign: "center",
                        padding: "20px 0",
                        whiteSpace: "nowrap",
                    }}
                >
                    {isOpen ? "VITA" : "V"}
                </h2>

                {user.role === "employee" && (
                    <NavItem to={`${basePath}/novo-projeto`}>
                        <IconWrapper>
                            <FaPlus />
                        </IconWrapper>
                        <NavLabel isOpen={isOpen}>Novo Projeto</NavLabel>
                    </NavItem>
                )}

                {user.role === "admin" && (
                    <NavItem to={`${basePath}/pessoas`}>
                        <IconWrapper>
                            <FaUserFriends />
                        </IconWrapper>
                        <NavLabel isOpen={isOpen}>Pessoas</NavLabel>
                    </NavItem>
                )}

                <NavItem to={`${basePath}/inicio`}>
                    <IconWrapper>
                        <FaHome />
                    </IconWrapper>
                    <NavLabel isOpen={isOpen}>Início</NavLabel>
                </NavItem>
                <NavItem to={`${basePath}/pesquisa`}>
                    <IconWrapper>
                        <FaSearch />
                    </IconWrapper>
                    <NavLabel isOpen={isOpen}>Pesquisa</NavLabel>
                </NavItem>
                {/* <NavItem to="/funcionario/novo-projeto">
                    <IconWrapper>
                        <FaPlus />
                    </IconWrapper>
                    <NavLabel isOpen={isOpen}>Novo Projeto</NavLabel>
                </NavItem> */}
                <button
                    onClick={onToggleNotifications}
                    style={{ all: "unset", cursor: "pointer" }}
                >
                    <NavItem as="div">
                        {" "}
                        {/* Usamos "as='div'" para que ele se pareça com os outros mas não seja um link */}
                        <IconWrapper>
                            <FaBell />
                        </IconWrapper>
                        <NavLabel isOpen={isOpen}>Notificações</NavLabel>
                    </NavItem>
                </button>
            </SidebarWrapper>
        </>
    );
};

export default Sidebar;
