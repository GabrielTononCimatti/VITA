import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState("");
    const auth = getAuth();

    const oobCode = searchParams.get("oobCode");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Processando...");

        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setStatus("Senha redefinida com sucesso!");
        } catch (err) {
            console.error(err);
            setStatus("Falha ao redefinir senha: link inválido ou expirado.");
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
            <h2>Redefinir Senha</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    Redefinir senha
                </button>
            </form>
            {status && <p style={{ marginTop: "10px" }}>{status}</p>}
        </div>
    );
}
