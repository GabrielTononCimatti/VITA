import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
import EmployeeLayout from "../pages/Employee/EmployeeLayout";
import ClientLayout from "../pages/Client/ClientLayout";
import AdminLayout from "../pages/Admin/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import RegistrationPage from "../pages/RegistrationPage";
import ActionHandler from "../pages/ActionHandler";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const AppRoutes = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/action" element={<ActionHandler />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Rota Protegida para Funcionário */}
                    <Route
                        element={<ProtectedRoute allowedRoles={["employee"]} />}
                    >
                        <Route
                            path="/employee/*"
                            element={<EmployeeLayout />}
                        />
                    </Route>

                    {/* NOVA ROTA PROTEGIDA PARA O CLIENTE */}
                    <Route
                        element={<ProtectedRoute allowedRoles={["client"]} />}
                    >
                        <Route path="/client/*" element={<ClientLayout />} />
                    </Route>

                    <Route
                        element={<ProtectedRoute allowedRoles={["admin"]} />}
                    >
                        <Route path="/admin/*" element={<AdminLayout />} />
                    </Route>

                    <Route path="*" element={<LoginPage />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default AppRoutes;
