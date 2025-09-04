import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getPersonById, updatePerson } from "../../services/peopleService";

// Reutilizando os componentes de formulário que você já tem
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

const Button = styled.button`
    padding: 12px 24px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    grid-column: 2 / 3;
    justify-self: end;
`;

const BackButton = styled(Button)`
    grid-column: 1 / 2;
    justify-self: start;
    background-color: #6c757d;
`;

const EditPersonPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPersonById(userId).then((data) => {
            if (data) {
                setPerson(data);
                setFormData({
                    name: data.name || "",
                    razaoSocial: data.razaoSocial || "",
                    cpf: data.cpf || "",
                    cnpj: data.cnpj || "",
                    phone: data.phone || "",
                    email: data.email || "",
                });
            }
            setLoading(false);
        });
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updatePerson(person, formData);
            alert("Dados atualizados com sucesso!");
            navigate("/admin/pessoas");
        } catch (error) {
            alert("Erro ao atualizar os dados.");
        }
    };

    if (loading) return <p>Carregando...</p>;
    if (!person) return <p>Usuário não encontrado.</p>;

    return (
        <FormWrapper>
            <Title>Editar: {person.name || person.razaoSocial}</Title>
            <Form onSubmit={handleSubmit}>
                {person.role === "client" && person.cpf && (
                    <>
                        <FormGroup>
                            <Label>Nome Completo</Label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>CPF</Label>
                            <Input
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                            />
                        </FormGroup>
                    </>
                )}

                {person.role === "client" && person.cnpj && (
                    <>
                        <FormGroup>
                            <Label>Razão Social</Label>
                            <Input
                                name="razaoSocial"
                                value={formData.razaoSocial}
                                onChange={handleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>CNPJ</Label>
                            <Input
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                            />
                        </FormGroup>
                    </>
                )}

                {(person.role === "employee" || person.role === "admin") && (
                    <FormGroup>
                        <Label>Nome Completo</Label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </FormGroup>
                )}

                <FormGroup>
                    <Label>Telefone</Label>
                    <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </FormGroup>

                <FormGroup fullWidth>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>

                <div></div>

                <FormGroup
                    style={{
                        gridColumn: "1 / -1",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: "20px",
                    }}
                >
                    <BackButton type="button" onClick={() => navigate(-1)}>
                        Voltar
                    </BackButton>
                    <Button type="submit">Salvar Alterações</Button>
                </FormGroup>
            </Form>
        </FormWrapper>
    );
};

export default EditPersonPage;
