import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("vitaUser");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const navigate = useNavigate();

    // const login = async (email, password) => {
    //     try {
    //         let loggedUser = null;
    //         let userResponse;
    //         // No json-server, vamos buscar o usuário pelo email e senha
    //         userResponse = await api.get(
    //             `/users?email=${email}&password=${password}`
    //         );

    //         if (userResponse.data.length > 0) {
    //             loggedUser = userResponse.data[0];
    //         } else {
    //             // 2. Se não encontrou, tenta encontrar na tabela 'clients'
    //             const clientResponse = await api.get(
    //                 `/clients?email=${email}&password=${password}`
    //             );
    //             if (clientResponse.data.length > 0) {
    //                 loggedUser = clientResponse.data[0];
    //             }
    //         }

    //         if (loggedUser) {
    //             localStorage.setItem("vitaUser", JSON.stringify(loggedUser));
    //             setUser(loggedUser);

    //             // Redireciona com base na permissão (role)
    //             switch (loggedUser.role) {
    //                 case "employee":
    //                     navigate("/employee/inicio");
    //                     break;
    //                 case "client":
    //                     navigate("/client/inicio");
    //                     break;
    //                 case "admin":
    //                     navigate("/admin/inicio");
    //                     break;
    //                 default:
    //                     navigate("/login");
    //             }
    //         } else {
    //             // Usuário ou senha inválidos
    //             alert("Email ou senha inválidos.");
    //         }
    //     } catch (error) {
    //         console.error("Erro no login:", error);
    //         alert("Ocorreu um erro ao tentar fazer login.");
    //     }
    // };

    const login = async (email, password) => {
        try {
            let foundUser = null;

            // 1. Tenta encontrar o usuário pelo email na tabela 'users'
            const userResponse = await api.get(`/users?email=${email}`);

            if (userResponse.data.length > 0) {
                foundUser = userResponse.data[0];
            } else {
                // 2. Se não encontrou, tenta encontrar na tabela 'clients' (se aplicável no seu db.json)
                const clientResponse = await api.get(`/clients?email=${email}`);
                if (clientResponse.data.length > 0) {
                    foundUser = clientResponse.data[0];
                }
            }

            // 3. AGORA, verifica se um usuário foi encontrado E se a senha corresponde
            if (foundUser && foundUser.password === password) {
                localStorage.setItem("vitaUser", JSON.stringify(foundUser));
                setUser(foundUser);

                // Redireciona com base na permissão (role)
                switch (foundUser.role) {
                    case "employee":
                        navigate("/employee/inicio");
                        break;
                    case "client":
                        navigate("/client/inicio");
                        break;
                    case "admin":
                        navigate("/admin/inicio");
                        break;
                    default:
                        navigate("/login");
                }
            } else {
                // 4. Se nenhum usuário foi encontrado com aquele e-mail OU se a senha está incorreta
                alert("Email ou senha inválidos.");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Ocorreu um erro ao tentar fazer login.");
        }
    };

    const logout = () => {
        localStorage.removeItem("vitaUser");
        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated: !!user, user, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};
