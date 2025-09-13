import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const auth = getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        try {
            await sendPasswordResetEmail(auth, email, {
                url: "http://localhost:3001/action",
                handleCodeInApp: true,
            });
            setMessage("Email enviado! Verifique sua caixa de entrada.");
        } catch (err) {
            console.error(err);
            setError("Falha ao enviar email: " + err.message);
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
            <h2>Esqueceu a senha?</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Enviar email
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
