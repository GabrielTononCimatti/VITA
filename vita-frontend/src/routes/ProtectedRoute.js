import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// O `allowedRoles` é um array de permissões que podem acessar a rota
const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se a rota exige permissões específicas, verificamos se o usuário as possui
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Se não tiver permissão, pode redirecionar para uma página de "Não autorizado" ou para o login
        return <Navigate to="/login" replace />;
    }

    return <Outlet />; // Renderiza o conteúdo da rota filha (ex: o layout do funcionário)
};

export default ProtectedRoute;
