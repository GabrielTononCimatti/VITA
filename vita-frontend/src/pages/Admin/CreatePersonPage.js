import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createPerson } from "../../services/peopleService";
import { useAuth } from "../../contexts/AuthContext";
import {
    maskCPF,
    maskCNPJ,
    formatPhoneNumber,
    unmask,
    maskPhone,
} from "../../utils/peopleUtils";

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
    const { user } = useAuth();

    const [registrationLink, setRegistrationLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [personData, setPersonData] = useState({
        personType: "PF",
        name: "",
        cpf: "",
        tradeName: "",
        companyName: "",
        cnpj: "",
        phoneNumber: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        let maskedValue = value;

        if (name === "cpf") {
            maskedValue = maskCPF(value);
        } else if (name === "cnpj") {
            maskedValue = maskCNPJ(value);
        } else if (name === "phoneNumber") {
            maskedValue = maskPhone(value);
        }

        setPersonData((prev) => ({ ...prev, [name]: maskedValue }));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(registrationLink);
        alert("Link copiado para a área de transferência!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const payload = {
            personType: personData.personType,
            phoneNumber: unmask(personData.phoneNumber),
            createdBy: `users/${user.id}`,
        };

        if (personData.personType === "PF") {
            payload.name = personData.name;
            payload.cpf = unmask(personData.cpf);
        } else if (personData.personType === "PJ") {
            payload.tradeName = personData.tradeName;
            if (personData.companyName)
                payload.companyName = personData.companyName;
            payload.cnpj = unmask(personData.cnpj);
        } else {
            payload.name = personData.name;
        }

        try {
            const response = await createPerson(payload);
            if (response && response.userID) {
                const link = `http://localhost:3000/register?preUserID=${response.userID}`;
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
                            pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
                            title="CPF deve ter 11 dígitos (ex: 123.456.789-00)"
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
                                pattern="\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}"
                                title="CNPJ deve ter 14 dígitos (ex: 12.345.678/0001-99)"
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
                        pattern="(\(?\d{2}\)?\s?\d{4,5}-?\d{4})|(0\d{3}-\d{3}-\d{4})"
                        title="Digite um telefone válido (ex: (15) 99611-0650 ou 0800-727-1100)"
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
