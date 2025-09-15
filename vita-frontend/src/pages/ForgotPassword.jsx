import React, { useState } from "react";
import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import styled from "styled-components";

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

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const auth =getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); setError("");
        try {
            await sendPasswordResetEmail(auth, email, {
                url: "http://localhost:3000/action",
                handleCodeInApp: true
            });
            setMessage("Email enviado! Verifique sua caixa de entrada.");
        } catch (err) {
            console.error(err);
            setError("Falha ao enviar email: " + err.message);
        }
    };

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Esqueceu a senha?</Title>
                <Form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
                    />
                    <SubmitButton type="submit">
                        {"Enviar email"}
                    </SubmitButton>
                    {message && <p style={{ color: "green", textAlign: "center", marginTop: "24px" }}>{message}</p>}
                    {error && <p style={{ color: "red", textAlign: "center", marginTop: "24px" }}>{error}</p>}
                </Form>
            </FormContainer>
        </PageWrapper>

    );
}
