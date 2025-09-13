// Caminho: vita-frontend/src/pages/Admin/CreatePersonPage.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createPerson } from "../../services/peopleService";
import { useAuth } from "../../contexts/AuthContext";

// Seus styled-components foram preservados
const PageWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 24px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled(Button)`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
`;

const CancelButton = styled(Button)`
    background-color: #f1f1f1;
    color: #333;
`;

const LinkDisplay = styled.div`
    margin-top: 20px;
    padding: 15px;
    background-color: #f0fff4;
    border-left: 5px solid #4caf50;
`;

const LinkInput = styled(Input)`
    background-color: #fff;
    margin-bottom: 10px;
`;

const CreatePersonPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Pegamos o usuário logado para saber quem está criando

    const [registrationLink, setRegistrationLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NOVO: Estado inicial alinhado com a nova estrutura de dados
    const [personData, setPersonData] = useState({
        personType: "PF", // Tipo de pessoa (PF, PJ, F, A)
        name: "",
        cpf: "",
        tradeName: "", // Nome Fantasia
        companyName: "", // Razão Social
        cnpj: "",
        phoneNumber: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPersonData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(registrationLink);
        alert("Link copiado para a área de transferência!");
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setError("");
    //     setIsSubmitting(true);

    //     const payload = {
    //         personType: personData.personType,
    //         phoneNumber: personData.phoneNumber,
    //         createdBy: `users/${user.id}`,
    //     };

    //     if (personData.personType === "PF") {
    //         payload.name = personData.name;
    //         payload.cpf = personData.cpf;
    //     } else if (personData.personType === "PJ") {
    //         payload.tradeName = personData.tradeName;
    //         payload.companyName = personData.companyName;
    //         payload.cnpj = personData.cnpj;
    //     } else {
    //         payload.name = personData.name;
    //     }

    //     try {
    //         const responseData = await createPerson(payload);

    //         // Passo 1: Mostra a resposta completa no console para depuração
    //         console.log("Resposta do backend:", responseData);

    //         // Passo 2: Verifica se a resposta contém o link
    //         if (responseData && responseData.userID) {
    //             // Construímos o link completo do front-end
    //             const link = `${window.location.origin}/register/${responseData.userID}`;
    //             setRegistrationLink(link);
    //         } else {
    //             setError(
    //                 "Pessoa criada, mas o ID de registro não foi retornado. Verifique o console."
    //             );
    //         }
    //     } catch (err) {
    //         console.error("Erro completo ao criar pessoa:", err);
    //         // Mostra o erro da API para o admin no console
    //         setError(
    //             "Falha ao criar pessoa. Verifique os dados e tente novamente."
    //         );
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        // NOVO: Construção do payload limpo
        const payload = {
            personType: personData.personType,
            phoneNumber: personData.phoneNumber,
            createdBy: `users/${user.id}`,
        };

        if (personData.personType === "PF") {
            payload.name = personData.name;
            payload.cpf = personData.cpf;
        } else if (personData.personType === "PJ") {
            payload.tradeName = personData.tradeName;
            if (personData.companyName)
                payload.companyName = personData.companyName; // Só envia se não for vazio
            payload.cnpj = personData.cnpj;
        } else {
            // Para Funcionário (F) e Admin (A)
            payload.name = personData.name;
        }

        try {
            const response = await createPerson(payload);
            if (response && response.userID) {
                const link = `http://localhost:3001/?preUserID=${response.userID}`;
                setRegistrationLink(link);
            } else {
                setError(
                    "Pessoa criada, mas não foi possível obter o link de registro."
                );
            }
        } catch (err) {
            setError(
                "Falha ao criar pessoa. Verifique os dados e tente novamente."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Se o link foi gerado, mostramos a tela de sucesso
    if (registrationLink) {
        return (
            <PageWrapper>
                <Title>Pessoa Criada com Sucesso!</Title>
                <p>
                    Copie o link abaixo e envie para o novo usuário concluir o
                    cadastro.
                </p>
                <LinkDisplay>
                    <Label>Link de Registro:</Label>
                    <LinkInput type="text" value={registrationLink} readOnly />
                    <SubmitButton onClick={handleCopyLink}>
                        Copiar Link
                    </SubmitButton>
                </LinkDisplay>
                <ButtonContainer>
                    <CancelButton onClick={() => navigate("/admin/pessoas")}>
                        Voltar para a Lista
                    </CancelButton>
                </ButtonContainer>
            </PageWrapper>
        );
    }

    // Senão, mostramos o formulário de criação
    return (
        <PageWrapper>
            <Title>Criar Nova Pessoa (Pré-cadastro)</Title>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>Tipo de Pessoa</Label>
                    <Select
                        name="personType"
                        value={personData.personType}
                        onChange={handleChange}
                    >
                        <option value="PF">Cliente (Pessoa Física)</option>
                        <option value="PJ">Cliente (Pessoa Jurídica)</option>
                        <option value="F">Funcionário</option>
                        <option value="A">Administrador</option>
                    </Select>
                </FormGroup>

                {/* O campo de EMAIL foi REMOVIDO daqui */}

                {(personData.personType === "PF" ||
                    personData.personType === "F" ||
                    personData.personType === "A") && (
                    <FormGroup>
                        <Label>Nome Completo</Label>
                        <Input
                            type="text"
                            name="name"
                            value={personData.name}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                )}

                {personData.personType === "PF" && (
                    <FormGroup>
                        <Label>CPF</Label>
                        <Input
                            type="text"
                            name="cpf"
                            value={personData.cpf}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                )}

                {personData.personType === "PJ" && (
                    <>
                        <FormGroup>
                            <Label>Nome Fantasia</Label>
                            <Input
                                type="text"
                                name="tradeName"
                                value={personData.tradeName}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Razão Social (Opcional)</Label>
                            <Input
                                type="text"
                                name="companyName"
                                value={personData.companyName}
                                onChange={handleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>CNPJ</Label>
                            <Input
                                type="text"
                                name="cnpj"
                                value={personData.cnpj}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                    </>
                )}

                <FormGroup>
                    <Label>Telefone</Label>
                    <Input
                        type="text"
                        name="phoneNumber"
                        value={personData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <ButtonContainer>
                    <CancelButton
                        type="button"
                        onClick={() => navigate("/admin/pessoas")}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </CancelButton>
                    <SubmitButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Criando..." : "Criar e Gerar Link"}
                    </SubmitButton>
                </ButtonContainer>
            </Form>
        </PageWrapper>
    );
};

export default CreatePersonPage;
