import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";
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
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const auth = getAuth(app);
    const oobCode = searchParams.get("oobCode");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!oobCode) {
            setError(
                "Link inválido ou expirado. Tente solicitar a redefinição novamente."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setMessage(
                "Senha redefinida com sucesso! Você já pode fazer o login."
            );
        } catch (err) {
            console.error(err);
            setError(
                "Falha ao redefinir senha: o link pode ser inválido ou expirado."
            );
        } finally {
            setLoading(false);
        }
    };

    if (message) {
        return (
            <PageWrapper>
                <FormContainer>
                    <Title>Sucesso!</Title>
                    <Message>{message}</Message>
                </FormContainer>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Redefinir Senha</Title>
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmPassword">
                            Confirmar Nova Senha
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? "Redefinindo..." : "Salvar Nova Senha"}
                    </SubmitButton>
                </Form>
                {error && <Message type="error">{error}</Message>}
            </FormContainer>
        </PageWrapper>
    );
}
