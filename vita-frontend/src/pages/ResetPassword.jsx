import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";
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


export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState("");
    const auth = getAuth();

    const oobCode = searchParams.get("oobCode");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Processando...");

        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus("Senha redefinida com sucesso!");
        } catch (err) {
            console.error(err);
            setStatus("Falha ao redefinir senha: link inválido ou expirado.");
        }
    };

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Redefinir Senha</Title>
                <Form onSubmit={handleSubmit}>
                    <Input
                        type="password"
                        placeholder="Nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <SubmitButton type="submit">
                        {"Redefinir senha"}
                    </SubmitButton>
                    {status && <p style={{ marginTop: "24px" }}>{status}</p>}
                </Form>
            </FormContainer>
        </PageWrapper>

    );
}
