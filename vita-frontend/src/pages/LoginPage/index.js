import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";

// Estilização do componente com styled-components
const LoginWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: ${({ theme }) => theme.colors.primary};
`;

const LoginForm = styled.form`
    padding: 40px;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.medium};
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
`;

const Button = styled.button`
    padding: 12px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.2s;

    &:hover {
        opacity: 0.9;
    }
`;

const ForgotPasswordLink = styled.a`
    text-align: center;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
    text-decoration: underline;
    margin-top: -10px;

    &:hover {
        opacity: 0.8;
    }
`;

const Title = styled.h1`
    text-align: center;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Se o usuário está autenticado e temos os dados dele...
        if (isAuthenticated && user) {
            console.log(
                `Usuário autenticado com userType: ${user.userType}. Redirecionando...`
            );
            // ...nós o redirecionamos para a página correta.
            switch (user.userType) {
                case "A":
                    navigate("/admin/inicio", { replace: true });
                    break;
                case "F":
                    navigate("/employee/inicio", { replace: true });
                    break;
                case "C":
                    navigate("/client/inicio", { replace: true });
                    break;
                default:
                    navigate("/", { replace: true }); // Fallback
            }
        }
    }, [isAuthenticated, user, navigate]); // Dependências do efeito

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        console.log("Tentando fazer login...");
        try {
            let auth = getAuth();
            let user = (await signInWithEmailAndPassword(auth, email, password)).user;
            console.log(user.emailVerified);
            if(!user.emailVerified)
            {
                setError("Falha no login. Email não confirmado.");
                return;
            }
            await login(email, password);

            console.log("Login bem-sucedido!");
        } catch (err) {
            console.error(err);
            setError("Falha no login. Verifique seu e-mail e senha.");
        }
    };

    if (isAuthenticated) {
        return <div>Redirecionando...</div>;
    }

    return (
        <LoginWrapper>
            <LoginForm onSubmit={handleSubmit}>
                <Title>VITA</Title>
                <Input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit">Entrar</Button>
                <ForgotPasswordLink
                    onClick={() =>
                        (window.location.href =
                            "http://localhost:3000/forgot-password")
                    }
                >
                    Esqueci minha senha
                </ForgotPasswordLink>
                {error && ( <p style={{ color: "red", textAlign: "center", marginTop: "24px"}}>{error}</p>)}
            </LoginForm>
        </LoginWrapper>
    );
};

export default LoginPage;
