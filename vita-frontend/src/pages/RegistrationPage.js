import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { completeRegistration } from "../services/peopleService";
import styled from "styled-components";

const PageWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f4f4;
`;

const Form = styled.form`
    padding: 40px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
`;

const Title = styled.h2`
    text-align: center;
    margin-bottom: 10px;
    color: #800020;
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
    background-color: #800020;
    color: white;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
`;

const RegistrationPage = () => {
    const { userId, role } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
        try {
            await completeRegistration(userId, role, {
                email: formData.email,
                password: formData.password,
            });
            alert("Registo concluído com sucesso! Pode agora fazer login.");
            navigate("/login");
        } catch (error) {
            alert("Erro ao concluir o registo.");
        }
    };

    return (
        <PageWrapper>
            <Form onSubmit={handleSubmit}>
                <Title>Finalize o seu Registo</Title>
                <Input
                    type="email"
                    name="email"
                    placeholder="Seu Email"
                    required
                    onChange={handleChange}
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Crie uma Senha"
                    required
                    onChange={handleChange}
                />
                <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirme a Senha"
                    required
                    onChange={handleChange}
                />
                <Button type="submit">Finalizar Registo</Button>
            </Form>
        </PageWrapper>
    );
};

export default RegistrationPage;
