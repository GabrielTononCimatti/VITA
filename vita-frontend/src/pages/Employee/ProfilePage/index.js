import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../../contexts/AuthContext";
import { updateUser } from "../../../services/userService";
import { getAdmins } from "../../../services/peopleService"; // NOVO: Importa a função de buscar admins
import { createNotification } from "../../../services/notificationService";

// Reutilizando componentes de formulário da CreateProjectPage
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

// const Form = styled.form`
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: ${({ theme }) => theme.spacing.large};

//     @media (max-width: 768px) {
//         grid-template-columns: 1fr;
//     }
// `;

const Form = styled.form`
    display: flex;
    flex-direction: column; // Alterado para coluna para agrupar os botões
    gap: ${({ theme }) => theme.spacing.large};
`;

const FieldGrid = styled.div`
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

const Button = styled.button`
    padding: 12px 24px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    grid-column: 2 / 3;
    justify-self: end;

    @media (max-width: 768px) {
        grid-column: 1 / -1;
        width: 100%;
    }
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-top: 24px;
    margin-bottom: 16px;
`;

// const ProfilePage = () => {
//     const { user, login } = useAuth(); // Precisamos do login para atualizar o contexto
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         phone: "",
//     });
//     const [newPassword, setNewPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");

//     useEffect(() => {
//         if (user) {
//             setFormData({
//                 name: user.name || "",
//                 email: user.email || "",
//                 phone: user.phone || "", // Adicione 'phone' ao seu db.json se não houver
//             });
//         }
//     }, [user]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (newPassword && newPassword !== confirmPassword) {
//             alert("As novas senhas não coincidem!");
//             return;
//         }

//         try {
//             const dataToUpdate = {
//                 ...formData,
//             };

//             if (newPassword) {
//                 dataToUpdate.password = newPassword;
//             }

//             // const password = user.password;
//             const updatedUser = await updateUser(user.id, dataToUpdate);
//             alert("Perfil atualizado com sucesso!");
//             await login(updatedUser.email, updatedUser.password);

//             setNewPassword("");
//             setConfirmPassword("");
//         } catch (error) {
//             alert("Não foi possível atualizar o perfil.");
//         }
//     };

//     return (
//         <FormWrapper>
//             <Title>Meu Perfil</Title>
//             <Form onSubmit={handleSubmit}>
//                 <FormGroup>
//                     <Label htmlFor="name">Nome Completo</Label>
//                     <Input
//                         id="name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                     />
//                 </FormGroup>

//                 <FormGroup>
//                     <Label htmlFor="phone">Telefone</Label>
//                     <Input
//                         type="tel"
//                         id="phone"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleChange}
//                     />
//                 </FormGroup>

//                 <FormGroup fullWidth>
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                         type="email"
//                         id="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                     />
//                 </FormGroup>

//                 <hr
//                     style={{
//                         gridColumn: "1 / -1",
//                         border: "none",
//                         borderTop: "1px solid #eee",
//                     }}
//                 />

//                 <FormGroup>
//                     <Label htmlFor="newPassword">Nova Senha</Label>
//                     <Input
//                         type="password"
//                         id="newPassword"
//                         name="newPassword"
//                         placeholder="Deixe em branco para não alterar"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                     />
//                 </FormGroup>

//                 <FormGroup>
//                     <Label htmlFor="confirmPassword">
//                         Confirmar Nova Senha
//                     </Label>
//                     <Input
//                         type="password"
//                         id="confirmPassword"
//                         name="confirmPassword"
//                         placeholder="Confirme a nova senha"
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                     />
//                 </FormGroup>

//                 {/* Adicionar campos de CPF/CNPJ aqui se necessário */}

//                 <FormGroup>
//                     {/* Espaço em branco para alinhar o botão */}
//                 </FormGroup>

//                 <Button type="submit">Salvar Alterações</Button>
//             </Form>
//         </FormWrapper>
//     );
// };

const ProfilePage = () => {
    const { user, login } = useAuth();

    // NOVO: Estados separados para dados pessoais e credenciais
    const [personalData, setPersonalData] = useState({});
    const [credentialsData, setCredentialsData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
    });

    // NOVO: Guarda o estado original do usuário para comparar as mudanças
    const [originalUser, setOriginalUser] = useState(null);

    useEffect(() => {
        if (user) {
            const initialData = {
                name: user.name || "",
                razaoSocial: user.razaoSocial || "",
                cpf: user.cpf || "",
                cnpj: user.cnpj || "",
                phone: user.phone || "",
            };
            setPersonalData(initialData);
            setCredentialsData({
                email: user.email || "",
                newPassword: "",
                confirmPassword: "",
            });
            setOriginalUser({ ...user, ...initialData }); // Salva o estado original
        }
    }, [user]);

    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setPersonalData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCredentialsChange = (e) => {
        const { name, value } = e.target;
        setCredentialsData((prev) => ({ ...prev, [name]: value }));
    };

    // NOVO: Função para solicitar alteração de dados pessoais
    const handleRequestChange = async (e) => {
        e.preventDefault();
        const admins = await getAdmins();
        if (admins.length === 0) {
            alert(
                "Nenhum administrador encontrado para receber a solicitação."
            );
            return;
        }

        let changes = [];
        // Compara os dados do formulário com os dados originais
        for (const key in personalData) {
            if (personalData[key] !== originalUser[key]) {
                changes.push(
                    `- ${key}: de "${originalUser[key] || "vazio"}" para "${
                        personalData[key]
                    }"`
                );
            }
        }

        if (changes.length === 0) {
            alert("Nenhuma alteração foi feita nos dados pessoais.");
            return;
        }

        const message = `O usuário ${
            originalUser.name || originalUser.razaoSocial
        } (ID: ${
            user.id
        }) solicitou as seguintes alterações de perfil:\n${changes.join("\n")}`;

        try {
            // Envia notificação para cada administrador
            for (const admin of admins) {
                await createNotification({
                    userId: admin.id,
                    message,
                    projectId: null,
                });
            }
            alert("Sua solicitação de alteração foi enviada ao administrador!");
        } catch (error) {
            alert("Ocorreu um erro ao enviar a solicitação.");
        }
    };

    // NOVO: Função para salvar diretamente email e senha
    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (
            credentialsData.newPassword &&
            credentialsData.newPassword !== credentialsData.confirmPassword
        ) {
            alert("As novas senhas não coincidem!");
            return;
        }

        const dataToUpdate = { email: credentialsData.email };
        if (credentialsData.newPassword) {
            dataToUpdate.password = credentialsData.newPassword;
        }

        // Verifica se houve alguma alteração real
        if (
            !credentialsData.newPassword &&
            credentialsData.email === user.email
        ) {
            alert("Nenhuma alteração foi feita no e-mail ou senha.");
            return;
        }

        try {
            const updatedUser = await updateUser(user.id, dataToUpdate);
            alert("Credenciais atualizadas com sucesso!");
            // Faz login novamente para atualizar o contexto
            await login(updatedUser.email, updatedUser.password);
            setCredentialsData((prev) => ({
                ...prev,
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            alert("Não foi possível atualizar as credenciais.");
        }
    };

    if (!user) {
        return <p>Carregando...</p>;
    }

    return (
        <FormWrapper>
            <Title>Meu Perfil</Title>

            {/* Formulário de Dados Pessoais */}
            <Form onSubmit={handleRequestChange}>
                <SectionTitle>Informações Pessoais</SectionTitle>
                <FieldGrid>
                    {user.role === "client" && user.cnpj ? (
                        <>
                            <FormGroup>
                                <Label htmlFor="razaoSocial">
                                    Razão Social
                                </Label>
                                <Input
                                    id="razaoSocial"
                                    name="razaoSocial"
                                    value={personalData.razaoSocial}
                                    onChange={handlePersonalChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input
                                    id="cnpj"
                                    name="cnpj"
                                    value={personalData.cnpj}
                                    onChange={handlePersonalChange}
                                />
                            </FormGroup>
                        </>
                    ) : (
                        <>
                            <FormGroup>
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={personalData.name}
                                    onChange={handlePersonalChange}
                                />
                            </FormGroup>
                            {user.role === "client" && user.cpf && (
                                <FormGroup>
                                    <Label htmlFor="cpf">CPF</Label>
                                    <Input
                                        id="cpf"
                                        name="cpf"
                                        value={personalData.cpf}
                                        onChange={handlePersonalChange}
                                    />
                                </FormGroup>
                            )}
                        </>
                    )}
                    <FormGroup>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={personalData.phone}
                            onChange={handlePersonalChange}
                        />
                    </FormGroup>
                </FieldGrid>
                <Button type="submit" secondary>
                    Solicitar Alteração
                </Button>
            </Form>

            {/* Formulário de Credenciais */}
            <Form onSubmit={handleSaveChanges}>
                <SectionTitle>Credenciais de Acesso</SectionTitle>
                <FieldGrid>
                    <FormGroup fullWidth>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={credentialsData.email}
                            onChange={handleCredentialsChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="Deixe em branco para não alterar"
                            value={credentialsData.newPassword}
                            onChange={handleCredentialsChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmPassword">
                            Confirmar Nova Senha
                        </Label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={credentialsData.confirmPassword}
                            onChange={handleCredentialsChange}
                        />
                    </FormGroup>
                </FieldGrid>
                <Button type="submit">Salvar Alterações</Button>
            </Form>
        </FormWrapper>
    );
};

export default ProfilePage;
