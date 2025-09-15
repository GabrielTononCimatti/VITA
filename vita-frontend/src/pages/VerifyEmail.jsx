import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    getAuth,
    applyActionCode,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    deleteUser
} from "firebase/auth";

export default function VerifyEmail() {
    const hasRun = useRef(false);
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("Processando...");
    const auth = getAuth();

    const oobCode = searchParams.get("oobCode");
    const preUserID = searchParams.get("preUserID");
    const email = searchParams.get("email");
    const password = searchParams.get("password");

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const validate = async () => {
            if (!oobCode || !preUserID) {
                setStatus("Link inválido");
                return;
            }
            /*console.log(oobCode);
            console.log(preUserID);
            console.log(email);
            console.log(password);*/

            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(auth, email, password)
            }
            catch(error)
            {
                setStatus("Falha ao confirmar email: link inválido ou expirado.");
                return;
            }
            let user = userCredential.user;

            if (user.emailVerified) {
                setStatus("Email confirmado com sucesso");
                return;
            }

            applyActionCode(auth, oobCode)
                .then(async () => {


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
                    setStatus("Falha ao confirmar email: link inválido ou expirado.");
                });
        };

        validate();
    }, [oobCode, preUserID, auth, email, password]);

    const handleRetry = async () => {
        setStatus("Processando...");
        let userCredential = await signInWithEmailAndPassword(auth, email, password);
        let user = userCredential.user;
        await deleteUser(user)

        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        const actionCodeSettings = {
            url: `http://localhost:3000/login?preUserID=${preUserID}&email=${email}&password=${password}`,
            handleCodeInApp: true
        };

        await sendEmailVerification(user, actionCodeSettings);
        setStatus("Código reenviado com sucesso. Verifique sua caixa de entrada.")
    };

    return <div style={{ textAlign: "center", marginTop: "50px" }}>
        {status}
        {status === "Falha ao confirmar email: link inválido ou expirado." && (
            <div
                style={{ marginTop: "20px", color: "blue", cursor: "pointer" }}
                onClick={() =>
                    handleRetry()
                }
            >
                Reenviar código
            </div>
        )}
    </div>;
}
