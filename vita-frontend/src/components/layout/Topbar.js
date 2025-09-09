import React from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const TopbarWrapper = styled.div`
    height: 60px;
    background-color: ${({ theme }) => theme.colors.white};
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 ${({ theme }) => theme.spacing.large};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 999;
`;

const ProfileMenu = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.small};

    // Adicionar lógica de dropdown depois
`;

const ProfileName = styled.span`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;

const LogoutButton = styled.button`
    font-weight: bold;
    color: #555;
    margin-left: 20px;
`;

const ProfileLink = styled(NavLink)`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-left: 10px;
    padding: 8px;
    border-radius: 4px;

    &.active {
        background-color: #f0f0f0;
    }
`;

const Topbar = () => {
    const { user, logout } = useAuth();

    const profilePath = `/${user.role}/perfil`;

    return (
        <TopbarWrapper>
            <ProfileMenu>
                <FaUserCircle size={24} color="#800020" />
                <ProfileName>
                    {user?.name ||
                        user?.razaoSocial ||
                        user?.tradeName ||
                        "Usuário"}
                </ProfileName>

                <ProfileLink to={profilePath}>Meu Perfil</ProfileLink>

                <LogoutButton onClick={logout}>Sair</LogoutButton>
            </ProfileMenu>
        </TopbarWrapper>
    );
};

export default Topbar;
