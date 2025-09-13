import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import styled from "styled-components";
import app from "./firebase"; // Certifique-se que o caminho para seu firebase.js está correto

// --- Styled Components (reutilizados) ---
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
        background-color: #ccc;
    }
`;

const Message = styled.p`
    text-align: center;
    margin-top: 16px;
    color: ${({ type }) => (type === "error" ? "red" : "green")};
`;

const BackLink = styled(Link)`
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
export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const auth = getAuth(app);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (email !== confirmEmail) {
            setError("Os e-mails não coincidem.");
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email, {
                url: "http://localhost:3000/login", // Redireciona para o login após redefinir
                handleCodeInApp: true,
            });
            setMessage(
                "E-mail de redefinição enviado! Verifique sua caixa de entrada."
            );
        } catch (err) {
            console.error(err);
            setError("Falha ao enviar e-mail: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (message) {
        return (
            <PageWrapper>
                <FormContainer>
                    <Title>Verifique seu E-mail</Title>
                    <Message>{message}</Message>
                </FormContainer>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Esqueceu a Senha?</Title>
                <p
                    style={{
                        textAlign: "center",
                        color: "#666",
                        marginBottom: "20px",
                    }}
                >
                    Insira seu e-mail para receber o link de redefinição.
                </p>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmEmail">Confirmar Email</Label>
                        <Input
                            id="confirmEmail"
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <SubmitButton type="submit" disabled={loading}>
                        {loading
                            ? "Enviando..."
                            : "Enviar E-mail de Redefinição"}
                    </SubmitButton>
                </Form>
                {error && <Message type="error">{error}</Message>}
                <BackLink to="/login">Voltar para o Login</BackLink>
            </FormContainer>
        </PageWrapper>
    );
}
