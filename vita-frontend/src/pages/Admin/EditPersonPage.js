import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { getPersonById, updatePerson } from "../../services/peopleService";
import { resetEmailPassword } from "../../services/userService";
import {
    maskCPF,
    maskCNPJ,
    formatPhoneNumber,
    unmask,
    maskPhone,
} from "../../utils/peopleUtils";

const FormWrapper = styled.div`
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
    &:disabled {
        background-color: #f1f1f1;
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    &:disabled {
        background-color: #f1f1f1;
    }
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

const EditPersonPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [formData, setFormData] = useState(null);
    const [initialEmail, setInitialEmail] = useState("");
    const [associatedUserId, setAssociatedUserId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPersonData = async () => {
            try {
                const response = await getPersonById(userId);
                console.log("Dados recebidos da API:", response);
                if (response) {
                    const fullData = {
                        ...response,
                        cpf: maskCPF(response.cpf || ""),
                        cnpj: maskCNPJ(response.cnpj || ""),
                        phoneNumber: formatPhoneNumber(
                            response.phoneNumber || ""
                        ),
                    };
                    setFormData(fullData);
                    setInitialEmail(response.user?.email || "");
                    setAssociatedUserId(response.user?.id || "");
                } else {
                    setError("Pessoa não encontrada.");
                }
            } catch (err) {
                setError("Não foi possível carregar os dados para edição.");
            } finally {
                setLoading(false);
            }
        };
        fetchPersonData();
    }, [userId]);

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

        setFormData({ ...formData, [name]: maskedValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const personPayload = {
            personType: formData.personType,
            phoneNumber: unmask(formData.phoneNumber),
        };

        if (
            formData.personType === "PF" ||
            formData.personType === "F" ||
            formData.personType === "A"
        ) {
            personPayload.name = formData.name;
        }
        if (formData.personType === "PF") {
            personPayload.cpf = unmask(formData.cpf);
        }
        if (formData.personType === "PJ") {
            personPayload.tradeName = formData.tradeName;
            personPayload.companyName = formData.companyName;
            personPayload.cnpj = unmask(formData.cnpj);
        }

        try {
            await updatePerson(userId, personPayload);

            if (formData.email !== initialEmail && associatedUserId) {
                await resetEmailPassword(associatedUserId, {
                    email: formData.email,
                });
            }

            alert("Dados atualizados com sucesso!");
            navigate("/admin/pessoas");
        } catch (err) {
            console.error("Erro ao atualizar:", err);
            navigate("/admin/pessoas");
            setError("Falha ao atualizar dados.");
        }
    };

    if (loading) {
        return <p>Carregando dados...</p>;
    }
    if (error) return <div style={{ color: "red" }}>{error}</div>;
    if (!formData) return <div>Dados da pessoa não encontrados.</div>;

    return (
        <FormWrapper>
            <Title>Editar Pessoa</Title>
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label>Tipo de Pessoa</Label>
                    <Select
                        name="personType"
                        value={formData.personType}
                        disabled
                    >
                        <option value="PF">Cliente (Pessoa Física)</option>
                        <option value="PJ">Cliente (Pessoa Jurídica)</option>
                        <option value="F">Funcionário</option>
                        <option value="A">Administrador</option>
                    </Select>
                </FormGroup>

                {(formData.personType === "PF" ||
                    formData.personType === "F" ||
                    formData.personType === "A") && (
                    <FormGroup>
                        <Label>Nome Completo</Label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                )}

                {formData.personType === "PF" && (
                    <FormGroup>
                        <Label>CPF</Label>
                        <Input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            pattern="\d{3}\.?\d{3}\.?\d{3}-?\d{2}"
                            title="CPF deve ter 11 dígitos (ex: 123.456.789-00)"
                            required
                        />
                    </FormGroup>
                )}

                {formData.personType === "PJ" && (
                    <>
                        <FormGroup>
                            <Label>Nome Fantasia</Label>
                            <Input
                                type="text"
                                name="tradeName"
                                value={formData.tradeName}
                                onChange={handleChange}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Razão Social (Opcional)</Label>
                            <Input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>CNPJ</Label>
                            <Input
                                type="text"
                                name="cnpj"
                                value={formData.cnpj}
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
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        pattern="(\(?\d{2}\)?\s?\d{4,5}-?\d{4})|(0\d{3}-\d{3}-\d{4})"
                        title="Digite um telefone válido (ex: (15) 99611-0650 ou 0800-727-1100)"
                    />
                </FormGroup>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <ButtonContainer>
                    <CancelButton
                        type="button"
                        onClick={() => navigate("/admin/pessoas")}
                    >
                        Cancelar
                    </CancelButton>
                    <SubmitButton type="submit">Salvar Alterações</SubmitButton>
                </ButtonContainer>
            </Form>
        </FormWrapper>
    );
};

export default EditPersonPage;
