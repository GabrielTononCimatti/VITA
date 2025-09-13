import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAuth, applyActionCode } from "firebase/auth";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Processando...");
    const auth = getAuth();

    const oobCode = searchParams.get("oobCode");
    const preUserID = searchParams.get("preUserID");

    useEffect(() => {
        if (!oobCode || !preUserID) {
            setStatus("Link inválido");
            return;
        }

        applyActionCode(auth, oobCode)
            .then(async () => {
                const user = auth.currentUser;
                if (!user) throw new Error("Usuário não autenticado.");

                // Call backend to finalize user creation
                const response = await fetch(`http://localhost:5000/user/register/${preUserID}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: user.email,
                        firebaseUID: user.uid
                    })
                });

                if (!response.ok) throw new Error("Falha ao registrar usuário no backend");

                setStatus("Email confirmado com sucesso e usuário registrado!");
            })
            .catch((err) => {
                console.error(err);
                setStatus("Falha ao confirmar email: link inválido ou expirado." + err.message);
            });
    }, [oobCode, preUserID, auth]);

    return <div style={{ textAlign: "center", marginTop: "50px" }}>{status}</div>;
}
