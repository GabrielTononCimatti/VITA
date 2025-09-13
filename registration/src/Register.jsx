import React, { useState, useEffect } from "react";
import app from "./firebase";
import styled from "styled-components";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { useSearchParams } from "react-router-dom";

export default function RegisterUser() {
    const [searchParams] = useSearchParams();
    const preUserID = searchParams.get("preUserID");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const auth = getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            // Send verification email with preUserID
            const actionCodeSettings = {
                url: `http://localhost:3001/action?preUserID=${preUserID}`,
                handleCodeInApp: true,
            };
            await sendEmailVerification(user, actionCodeSettings);

            setMessage(
                "Email enviado! Verifique sua caixa de entrada para confirmar seu registro."
            );
        } catch (err) {
            console.error(err);
            setError("Falha ao registrar usuário: " + err.message);
        }
    };

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "50px auto",
                textAlign: "center",
            }}
        >
            <h2>Registrar sua conta</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                        padding: "10px",
                        width: "100%",
                        marginBottom: "10px",
                    }}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                        padding: "10px",
                        width: "100%",
                        marginBottom: "10px",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "red",
                        color: "white",
                    }}
                >
                    Registrar
                </button>
            </form>
            {message && (
                <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
            )}
            {error && (
                <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
            )}
        </div>
    );
}
