import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import app, {auth} from "../services/firebase";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    deleteUser
} from "firebase/auth";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

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


export default function RegisterUser() {
    const hasRun = useRef(false);

    const [searchParams] = useSearchParams();
    const preUserID = searchParams.get("preUserID");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [fatalError, setFatalError] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const auth = getAuth();

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        const validatePreUser = async () => {
            try {

                if(!preUserID) {
                    throw new Error("Erro. link inválido.");
                }

                const res = await fetch(`http://localhost:5000/user/${preUserID}`, {
                    method: "GET"
                });

                if (!res.ok) {
                    throw new Error("Erro. link inválido.");
                }

                const data = await res.json();


                if(!data){
                    throw new Error("Erro. link inválido.");
                }

                if(Object.keys(data).length === 0){
                    throw new Error("Erro. link inválido.");
                }

                if(data.active === true) {
                    throw new Error("Erro. Usuário já registrado.");
                }

                setLoading(false); // ✅ valid, allow rendering
            } catch (err) {
                setFatalError(err.message);
                setLoading(false);
            }
        };

        validatePreUser();
    }, [preUserID]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); setFormError("");
        if (formData.password.length < 6) {
            setFormError("A senha deve ter no mínimo 6 caracteres.");
            return;
        }


        if (formData.password !== formData.confirmPassword) {
            setFormError("As senhas não coincidem.");
            return;
        }
        try {

            let user;
            try {
                // Try signing in first
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                user = userCredential.user;

                if (user.emailVerified) {
                    setFormError("Email já confirmado.");
                    return;
                }
            } catch (err) {
                if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
                    // If user doesn't exist, create it
                    const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                    user = userCredential.user;
                } else {
                    console.error(err);
                    setFormError("Falha ao registrar usuário: " + err.message);
                    return;
                }
            }

            const actionCodeSettings = {
                url: `http://localhost:3000/login?preUserID=${preUserID}&email=${formData.email}&password=${formData.password}`,
                handleCodeInApp: true
            };

            await sendEmailVerification(user, actionCodeSettings);
            setMessage("Email enviado! Verifique sua caixa de entrada para confirmar seu registro.");
        } catch (err) {
            console.error(err);
            setFormError("Falha ao registrar usuário: " + err.message);
        }
    };

    if (loading) {
        return <p style={{ textAlign: "center", marginTop: "50px" }}>Validando link...</p>;
    }

    if (fatalError) {
        return <p style={{ color: "red", textAlign: "center", marginTop: "50px" }}>{fatalError}</p>;
    }

    return (
        <PageWrapper>
            <FormContainer>
                <Title>Finalize seu Cadastro</Title>
                <Form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        name="email"
                        placeholder="Seu email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="password"
                        placeholder="Crie uma senha"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirme sua senha"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <SubmitButton type="submit" disabled={loading}>
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </SubmitButton>
                    {formError && ( <p style={{ color: "red", textAlign: "center", marginTop: "24px"}}>{formError}</p>)}
                    {message && <p style={{ color: "green", textAlign: "center", marginTop: "24px"}}>{message}</p>}
                </Form>
            </FormContainer>
        </PageWrapper>

    );
}
