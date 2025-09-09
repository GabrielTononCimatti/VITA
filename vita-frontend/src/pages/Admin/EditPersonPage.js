// Caminho: vita-frontend/src/pages/Admin/EditPersonPage.js

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { getPersonById, updatePerson } from "../../services/peopleService";

// --- Styled Components (sem alterações) ---
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

// --- Componente da Página ---
const EditPersonPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    // O estado do formulário foi simplificado, removendo o email
    const [formData, setFormData] = useState({
        personType: "",
        name: "",
        cpf: "",
        tradeName: "",
        companyName: "",
        cnpj: "",
        phoneNumber: "",
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPersonData = async () => {
            try {
                // A 'response' é o próprio objeto da pessoa
                const personDataFromApi = await getPersonById(userId);

                // Preenchemos o formulário diretamente com os dados recebidos
                setFormData({
                    personType: personDataFromApi.personType || "",
                    name: personDataFromApi.name || "",
                    cpf: personDataFromApi.cpf || "",
                    tradeName: personDataFromApi.tradeName || "",
                    companyName: personDataFromApi.companyName || "",
                    cnpj: personDataFromApi.cnpj || "",
                    phoneNumber: personDataFromApi.phoneNumber || "",
                });
            } catch (err) {
                console.error("Erro ao buscar dados:", err);
                setError("Não foi possível carregar os dados para edição.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchPersonData();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            // O payload de atualização contém apenas os dados da pessoa, sem o email
            await updatePerson(userId, formData);
            alert("Dados atualizados com sucesso!");
            navigate("/admin/pessoas");
        } catch (err) {
            console.error("Erro ao atualizar pessoa:", err);
            setError("Falha ao atualizar dados. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <p>Carregando dados...</p>;
    }

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

                {/* O campo de email foi REMOVIDO pois a API não fornece este dado */}

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
                        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </SubmitButton>
                </ButtonContainer>
            </Form>
        </FormWrapper>
    );
};

export default EditPersonPage;
