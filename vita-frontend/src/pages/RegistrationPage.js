// Caminho: vita-frontend/src/pages/RegistrationPage.js

import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { auth } from "../services/firebase";
import app from "../services/firebase";
// NOVO: Importando a nova função de serviço
import { registerUser } from "../services/peopleService";

// --- Styled Components (Preservados) ---
const PageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
`;

const FormContainer = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
    text-align: center;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 24px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    padding: 12px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const SubmitButton = styled.button`
    padding: 12px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    &:disabled {
        background-color: #ccc;
    }
`;

// --- Componente da Página ---
const RegistrationPage = () => {
    const { token } = useParams(); // Pega o userID da URL
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (formData.password !== formData.confirmPassword) {
    //         setError("As senhas não coincidem.");
    //         return;
    //     }
    //     setError("");
    //     setLoading(true);

    //     try {
    //         // NOVO: Usando a função 'registerUser' para fazer a chamada POST correta
    //         await registerUser(token, {
    //             email: formData.email,
    //             password: formData.password,
    //         });
    //         alert(
    //             "Cadastro realizado com sucesso! Você será redirecionado para a página de login."
    //         );
    //         navigate("/login");
    //     } catch (err) {
    //         console.error("Erro no registro:", err);
    //         setError(
    //             "Falha ao realizar o cadastro. O link pode ser inválido ou expirado."
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const [searchParams] = useSearchParams();
    const preUserID = searchParams.get("preUserID");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;
            // Send verification email with preUserID
            const actionCodeSettings = {
                url: `http://localhost:3000/action?preUserID=${preUserID}`,
                handleCodeInApp: true,
            };
            await sendEmailVerification(user, actionCodeSettings);

            setMessage(
                "Email enviado! Verifique sua caixa de entrada para confirmar seu registro."
            );
        } catch (err) {
            console.error(err);
            setError("Falha ao registrar usuário: " + err.message);
        }
    };

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Finalize seu Cadastro</Title>
                <Form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Seu email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="password"
                        placeholder="Crie uma senha"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {error && (
                        <p style={{ color: "red", textAlign: "center" }}>
                            {error}
                        </p>
                    )}
                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </SubmitButton>
                </Form>
            </FormContainer>
        </PageWrapper>
    );
};

export default RegistrationPage;
