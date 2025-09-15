// Caminho: vita-frontend/src/contexts/AuthContext.js
import { useLocation } from "react-router-dom";
import React, { createContext, useState, useEffect, useContext } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";
import api from "../services/api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const excludedRoutes = ["/register", "/action", "/verify-email", "/forgot-password", "/reset-password"];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (excludedRoutes.includes(location.pathname)) {
                setLoading(false);
                return;
            }
            if (firebaseUser) {
                // Usuário autenticado no Firebase. Agora buscamos seus dados no nosso backend.
                try {
                    // O interceptor no api.js vai adicionar o token a esta chamada automaticamente.
                    const { data } = await api.get("/user/firebase");

                    console.log("Dados do usuário obtidos do backend:", data);

                    // O backend retorna os dados do usuário e da pessoa
                    const { currentUser: userData, currentPerson: personData } =
                        data;

                    // Combinamos os dados em um único objeto de usuário para o nosso contexto
                    const fullUserData = {
                        ...userData,
                        ...personData,
                        id: userData.id, // Garante que o ID principal seja o do nosso banco (coleção users)
                        role: mapUserTypeToRole(userData.userType), // Mapeia A -> admin, F -> employee, C -> client
                    };

                    setUser(fullUserData);
                    localStorage.setItem("user", JSON.stringify(fullUserData));
                } catch (error) {
                    console.error(
                        "Erro ao buscar dados do usuário no backend:",
                        error
                    );
                    // Se a chamada ao backend falhar, deslogamos o usuário para evitar inconsistências.
                    await signOut(auth);
                    setUser(null);
                    localStorage.removeItem("user");
                }
            } else {
                // Usuário deslogado
                setUser(null);
                localStorage.removeItem("user");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const mapUserTypeToRole = (userType) => {
        switch (userType) {
            case "A":
                return "admin";
            case "F":
                return "employee";
            case "C":
                return "client";
            default:
                return null;
        }
    };

    const login = async (email, password) => {
        try {
            // A autenticação é feita com o Firebase
            await signInWithEmailAndPassword(auth, email, password);
            // Se o login for bem-sucedido, o onAuthStateChanged listener acima fará o resto.
            return true;
        } catch (error) {
            console.error("Erro no login:", error.code, error.message);
            alert("Email ou senha inválidos.");
            return false;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated: !!user, user, login, logout, loading }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
