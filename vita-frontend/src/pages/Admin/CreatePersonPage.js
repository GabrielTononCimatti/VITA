import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { preRegisterPerson } from "../../services/peopleService";
import styled from "styled-components";

// Use os styled-components de formulário que já tem
const FormWrapper = styled.div`
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.large};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    max-width: 800px;
    margin: auto;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const Form = styled.form`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.large};

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.small};
    ${({ fullWidth }) => fullWidth && `grid-column: 1 / -1;`}
`;

const Label = styled.label`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textLight};
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
`;

const Select = styled.select`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    background-color: white;
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    min-height: 100px;
    resize: vertical;
`;

const Button = styled.button`
    padding: 12px 24px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    grid-column: 2 / 3; // Alinha o botão à direita no grid
    justify-self: end; // Alinha o conteúdo do item à direita

    @media (max-width: 768px) {
        grid-column: 1 / -1;
        width: 100%;
    }
`;

const LinkDisplay = styled.div`
    margin-top: 30px;
    padding: 20px;
    background-color: #e9ecef;
    border-radius: 4px;

    h3 {
        margin-bottom: 10px;
    }

    input {
        width: 100%;
        padding: 8px;
        background-color: #fff;
        border: 1px solid #ccc;
        font-family: monospace;
    }
`;

const CreatePersonPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        role: "client",
        personType: "PF",
        name: "",
        cpf: "",
        razaoSocial: "",
        cnpj: "",
        phone: "",
    });
    const [generatedLink, setGeneratedLink] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { personType, ...dataToSave } = formData;

        try {
            const person = await preRegisterPerson(dataToSave);
            const link = `${window.location.origin}/cadastro/${person.role}/${person.id}`;
            setGeneratedLink(link);
            alert(
                "Pessoa pré-registada com sucesso! Partilhe o link abaixo com o novo utilizador."
            );
        } catch (error) {
            alert("Erro ao pré-registar pessoa.");
        }
    };

    return (
        <FormWrapper>
            <Title>Pré-Registo de Novo Utilizador</Title>

            {!generatedLink ? (
                <Form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Tipo de Perfil</Label>
                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="client">Cliente</option>
                            <option value="employee">Funcionário</option>
                            <option value="admin">Administrador</option>
                        </Select>
                    </FormGroup>

                    {formData.role === "client" && (
                        <FormGroup>
                            <Label>Tipo de Cliente</Label>
                            <Select
                                name="personType"
                                value={formData.personType}
                                onChange={handleChange}
                            >
                                <option value="PF">Pessoa Física</option>
                                <option value="PJ">Pessoa Jurídica</option>
                            </Select>
                        </FormGroup>
                    )}

                    {formData.role === "client" &&
                    formData.personType === "PJ" ? (
                        <>
                            <FormGroup>
                                <Label>Razão Social</Label>
                                <Input
                                    name="razaoSocial"
                                    required
                                    value={formData.razaoSocial}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>CNPJ</Label>
                                <Input
                                    name="cnpj"
                                    required
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                        </>
                    ) : (
                        <>
                            <FormGroup>
                                <Label>Nome Completo</Label>
                                <Input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            {formData.role === "client" && (
                                <FormGroup>
                                    <Label>CPF</Label>
                                    <Input
                                        name="cpf"
                                        required
                                        value={formData.cpf}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                            )}
                        </>
                    )}

                    <FormGroup>
                        <Label>Telefone (Opcional)</Label>
                        <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </FormGroup>

                    <Button type="submit">Criar Pessoa e Gerar Link</Button>
                </Form>
            ) : (
                <LinkDisplay>
                    <h3>Link de Registo Gerado:</h3>
                    <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        onFocus={(e) => e.target.select()}
                    />
                    <p style={{ marginTop: "10px", fontSize: "14px" }}>
                        Copie e envie este link para o novo utilizador finalizar
                        o seu registo.
                    </p>
                    <Button
                        onClick={() => navigate("/admin/pessoas")}
                        style={{ marginTop: "20px" }}
                    >
                        Voltar para Pessoas
                    </Button>
                </LinkDisplay>
            )}
        </FormWrapper>
    );
};

export default CreatePersonPage;
