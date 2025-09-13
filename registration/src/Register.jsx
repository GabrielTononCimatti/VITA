import React, { useState } from "react";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { useSearchParams, Link } from "react-router-dom";
import styled from "styled-components";
import app from "./firebase"; // Certifique-se que o caminho para seu firebase.js está correto

// --- Styled Components (baseado no estilo do seu projeto) ---
const PageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
`;

const FormContainer = styled.div`
    width: 100%;
    max-width: 450px;
    padding: 40px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
    text-align: center;
    color: #800020;
    margin-bottom: 24px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const SubmitButton = styled.button`
    padding: 12px;
    background-color: #800020;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 16px;

    &:disabled {
        background-color: #5e5353ff;
        cursor: not-allowed;
    }
`;

const Message = styled.p`
    text-align: center;
    margin-top: 16px;
    color: ${({ type }) => (type === "error" ? "red" : "green")};
`;

const LoginLink = styled(Link)`
    display: block;
    text-align: center;
    margin-top: 20px;
    color: #800020;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

// --- Componente ---
export default function RegisterUser() {
    const [searchParams] = useSearchParams();
    const preUserID = searchParams.get("preUserID");

    const [formData, setFormData] = useState({
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const auth = getAuth(app);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Validação dos campos de confirmação
        if (formData.email !== formData.confirmEmail) {
            setError("Os e-mails não coincidem.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            const actionCodeSettings = {
                url: `http://localhost:3000/action?preUserID=${preUserID}`, // Ajuste a URL conforme necessário
                handleCodeInApp: true,
            };
            await sendEmailVerification(user, actionCodeSettings);

            setMessage(
                "E-mail de verificação enviado! Verifique sua caixa de entrada para confirmar seu registro."
            );
        } catch (err) {
            console.error(err);
            setError("Falha ao registrar usuário: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (message) {
        return (
            <PageWrapper>
                <FormContainer>
                    <Title>Registro Quase Completo!</Title>
                    <Message>{message}</Message>
                </FormContainer>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Registrar sua Conta</Title>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmEmail">Confirmar Email</Label>
                        <Input
                            id="confirmEmail"
                            name="confirmEmail"
                            type="email"
                            value={formData.confirmEmail}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>

                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? "Registrando..." : "Registrar"}
                    </SubmitButton>
                </Form>
                {error && <Message type="error">{error}</Message>}
            </FormContainer>
        </PageWrapper>
    );
}
