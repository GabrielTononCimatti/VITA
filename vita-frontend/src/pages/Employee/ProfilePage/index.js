// Caminho: vita-frontend/src/pages/Employee/ProfilePage/index.js

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../../contexts/AuthContext";
import { requestPersonChanges, updatePerson } from "../../../services/peopleService";
import { resetEmailPassword } from "../../../services/userService";
import _ from "lodash";

// --- Styled Components (Preservados e adaptados) ---
const ProfileWrapper = styled.div`
    max-width: 800px;
    margin: 24px auto;
    padding: 24px;
`;

const FormSection = styled.form`
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 32px;
`;

const Title = styled.h1`
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 32px;
`;

const Form = styled.form`
    background-color: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
    margin-bottom: 24px;
    border-bottom: 1px solid #eee;
    padding-bottom: 24px;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    color: #333;
    margin-bottom: 16px;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
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

const Button = styled.button`
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    &:disabled {
        background-color: #ccc;
    }
`;

// --- Componente ---
// const ProfilePage = () => {
//     const { user, loading, logout } = useAuth({});
//     const [formData, setFormData] = useState({});
//     const [initialData, setInitialData] = useState({});

//     useEffect(() => {
//         // Quando o usuário do AuthContext carregar, preenchemos o formulário
//         if (user) {
//             const data = {
//                 // Dados que todos têm
//                 email: user.email || "",
//                 phoneNumber: user.phoneNumber || "",
//                 // Dados condicionais
//                 name: user.name || "",
//                 cpf: user.cpf || "",
//                 tradeName: user.tradeName || "",
//                 companyName: user.companyName || "",
//                 cnpj: user.cnpj || "",
//             };
//             setFormData(data);
//             setInitialData(data); // Guarda o estado original para comparar
//         }
//     }, [user]);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Compara o estado atual com o inicial para encontrar o que mudou
//         const changes = {};
//         Object.keys(formData).forEach((key) => {
//             if (!_.isEqual(formData[key], initialData[key])) {
//                 changes[key] = formData[key];
//             }
//         });

//         if (Object.keys(changes).length === 0) {
//             alert("Nenhuma alteração foi feita.");
//             return;
//         }

//         try {
//             // A rota updatePerson já espera o ID da pessoa (que está no user.id)
//             await updatePerson(user.id, changes);
//             alert(
//                 "Perfil atualizado com sucesso! Pode ser necessário recarregar a página para ver as alterações."
//             );
//             // Atualiza o initialData para o novo estado salvo
//             setInitialData(formData);
//         } catch (error) {
//             alert("Falha ao atualizar o perfil.");
//         }
//     };

//     if (loading || !user) {
//         return <div>Carregando perfil...</div>;
//     }

//     return (
//         <ProfileWrapper>
//             <Title>Meu Perfil</Title>
//             <Form onSubmit={handleSubmit}>
//                 <Section>
//                     <SectionTitle>Informações de Contato</SectionTitle>
//                     <FormGroup>
//                         <Label>Email</Label>
//                         {/* O email é gerenciado pelo Firebase Auth, então geralmente não é editável aqui */}
//                         <Input type="email" value={formData.email} disabled />
//                     </FormGroup>
//                     <FormGroup>
//                         <Label>Telefone</Label>
//                         <Input
//                             type="text"
//                             name="phoneNumber"
//                             value={formData.phoneNumber}
//                             onChange={handleChange}
//                         />
//                     </FormGroup>
//                 </Section>

//                 <Section>
//                     <SectionTitle>Informações Pessoais</SectionTitle>
//                     {/* Renderização condicional baseada no personType */}
//                     {(user.personType === "PF" ||
//                         user.personType === "F" ||
//                         user.personType === "A") && (
//                         <FormGroup>
//                             <Label>Nome Completo</Label>
//                             <Input
//                                 type="text"
//                                 name="name"
//                                 value={formData.name}
//                                 onChange={handleChange}
//                             />
//                         </FormGroup>
//                     )}
//                     {user.personType === "PF" && (
//                         <FormGroup>
//                             <Label>CPF</Label>
//                             <Input
//                                 type="text"
//                                 name="cpf"
//                                 value={formData.cpf}
//                                 onChange={handleChange}
//                             />
//                         </FormGroup>
//                     )}
//                     {user.personType === "PJ" && (
//                         <>
//                             <FormGroup>
//                                 <Label>Nome Fantasia</Label>
//                                 <Input
//                                     type="text"
//                                     name="tradeName"
//                                     value={formData.tradeName}
//                                     onChange={handleChange}
//                                 />
//                             </FormGroup>
//                             <FormGroup>
//                                 <Label>Razão Social</Label>
//                                 <Input
//                                     type="text"
//                                     name="companyName"
//                                     value={formData.companyName}
//                                     onChange={handleChange}
//                                 />
//                             </FormGroup>
//                             <FormGroup>
//                                 <Label>CNPJ</Label>
//                                 <Input
//                                     type="text"
//                                     name="cnpj"
//                                     value={formData.cnpj}
//                                     onChange={handleChange}
//                                 />
//                             </FormGroup>
//                         </>
//                     )}
//                 </Section>

//                 <Button type="submit">Salvar Alterações</Button>
//             </Form>
//         </ProfileWrapper>
//     );
// };
const ProfilePage = () => {
    const { user, loading, logout } = useAuth(); // Adicionado logout

    const [personForm, setPersonForm] = useState({});
    const [initialPersonData, setInitialPersonData] = useState({});
    const [accountForm, setAccountForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (user) {
            const personData = {
                phoneNumber: user.phoneNumber || "",
                name: user.name || "",
                cpf: user.cpf || "",
                tradeName: user.tradeName || "",
                companyName: user.companyName || "",
                cnpj: user.cnpj || "",
            };
            setPersonForm(personData);
            setInitialPersonData(personData);
            setAccountForm((prev) => ({ ...prev, email: user.email || "" }));
        }
    }, [user]);

    const handlePersonChange = (e) => {
        setPersonForm({ ...personForm, [e.target.name]: e.target.value });
    };

    const handleAccountChange = (e) => {
        setAccountForm({ ...accountForm, [e.target.name]: e.target.value });
    };

    // const handleRequestChanges = async (e) => {
    //     e.preventDefault();
    //     const changes = Object.keys(personForm)
    //         .filter(
    //             (key) => !_.isEqual(personForm[key], initialPersonData[key])
    //         )
    //         .map((key) => ({ field: key, value: personForm[key] }));

    //     if (changes.length === 0) {
    //         alert("Nenhuma alteração nos dados pessoais foi feita.");
    //         return;
    //     }

    //     try {
    //         console.log("Enviando alterações:", { changes });
    //         await requestPersonChanges({ changes });
    //         alert(
    //             "Sua solicitação de alteração foi enviada para um administrador!"
    //         );
    //         setInitialPersonData(personForm);
    //     } catch (error) {
    //         alert("Falha ao enviar solicitação.");
    //     }
    // };


    const handlePersonSubmit = async (e) => {
        e.preventDefault();

        const changesPayload = Object.keys(personForm)
            .filter((key) => !_.isEqual(personForm[key], initialPersonData[key]))
            .reduce((acc, key) => {
                acc[key] = personForm[key];
                return acc;
            }, {});

        if (Object.keys(changesPayload).length === 0) {
            alert("Nenhuma alteração nos dados pessoais foi feita.");
            return;
        }

        try {
            if (user.personType === "A") {

                changesPayload.personType = user.personType;
                await updatePerson(user.currentPersonID, changesPayload);
                alert("Dados pessoais atualizados com sucesso!");
                setInitialPersonData(personForm);
                window.location.reload();
            } else {

                await requestPersonChanges(changesPayload);
                alert("Sua solicitação de alteração foi enviada para um administrador!");
                setInitialPersonData(personForm);
            }
        } catch (error) {
            alert("Falha ao atualizar dados pessoais.");
        }
    };

    const handleAccountSubmit = async (e) => {
        e.preventDefault();
        if (
            accountForm.password &&
            accountForm.password !== accountForm.confirmPassword
        ) {
            alert("As senhas não coincidem.");
            return;
        }

        const payload = {};
        if (accountForm.email !== user.email) payload.email = accountForm.email;
        if (accountForm.password) payload.password = accountForm.password;

        if (Object.keys(payload).length === 0) {
            alert("Nenhuma alteração nos dados da conta foi feita.");
            return;
        }

        try {
            await resetEmailPassword(user.id, payload);
            alert(
                "Dados da conta atualizados com sucesso! Por segurança, você será deslogado."
            );
            logout(); // Desloga o usuário após a mudança
        } catch (error) {
            alert("Falha ao atualizar dados da conta.");
        }
    };

    if (loading || !user) return <div>Carregando perfil...</div>;

    return (
        <ProfileWrapper>
            <Title>Meu Perfil</Title>

            <FormSection onSubmit={handlePersonSubmit}>
                <SectionTitle>Informações Pessoais</SectionTitle>
                {user.personType !== "A" &&
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            marginTop: "-10px",
                            marginBottom: "20px",
                        }}
                    >
                        Qualquer alteração aqui será enviada para aprovação de um
                        administrador.
                    </p>}
                <FormGroup>
                    <Label>Telefone</Label>
                    <Input
                        type="text"
                        name="phoneNumber"
                        value={personForm.phoneNumber || ""}
                        onChange={handlePersonChange}
                    />
                </FormGroup>
                {(user.personType === "PF" ||
                    user.personType === "F" ||
                    user.personType === "A") && (
                    <FormGroup>
                        <Label>Nome Completo</Label>
                        <Input
                            type="text"
                            name="name"
                            value={personForm.name || ""}
                            onChange={handlePersonChange}
                        />
                    </FormGroup>
                )}
                {user.personType === "PF" && (
                    <FormGroup>
                        <Label>CPF</Label>
                        <Input
                            type="text"
                            name="cpf"
                            value={personForm.cpf || ""}
                            onChange={handlePersonChange}
                        />
                    </FormGroup>
                )}
                {user.personType === "PJ" && (
                    <>
                        <FormGroup>
                            <Label>Nome Fantasia</Label>
                            <Input
                                type="text"
                                name="tradeName"
                                value={personForm.tradeName || ""}
                                onChange={handlePersonChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Razão Social</Label>
                            <Input
                                type="text"
                                name="companyName"
                                value={personForm.companyName || ""}
                                onChange={handlePersonChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>CNPJ</Label>
                            <Input
                                type="text"
                                name="cnpj"
                                value={personForm.cnpj || ""}
                                onChange={handlePersonChange}
                            />
                        </FormGroup>
                    </>
                )}
                <Button type="submit">
                    {user.personType === "A" ? "Salvar Dados Pessoais" : "Solicitar Alterações"}
                </Button>
            </FormSection>

            <FormSection onSubmit={handleAccountSubmit}>
                <SectionTitle>Informações da Conta</SectionTitle>
                <FormGroup>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        name="email"
                        value={accountForm.email}
                        onChange={handleAccountChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Nova Senha (deixe em branco para não alterar)</Label>
                    <Input
                        type="password"
                        name="password"
                        value={accountForm.password}
                        onChange={handleAccountChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Confirmar Nova Senha</Label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        value={accountForm.confirmPassword}
                        onChange={handleAccountChange}
                    />
                </FormGroup>
                <Button type="submit">Salvar Dados da Conta</Button>
            </FormSection>
        </ProfileWrapper>
    );
};

export default ProfilePage;
