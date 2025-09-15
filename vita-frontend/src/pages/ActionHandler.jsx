import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ActionHandler() {
    const hasRun = useRef(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        const mode = searchParams.get("mode");
        const oobCode = searchParams.get("oobCode");
        const continueUrl = searchParams.get("continueUrl");

        if (!mode || !oobCode) return;
        let preUserID=null
        let email = null;
        let password = null;
        if (mode === "verifyEmail") {
            if(continueUrl)
            {
                const decoded = decodeURIComponent(continueUrl);
                const parsed = new URL(decoded);
                preUserID = parsed.searchParams.get("preUserID");
                email = parsed.searchParams.get("email");
                password = parsed.searchParams.get("password");
            }
            navigate(`/verify-email?oobCode=${oobCode}`+(preUserID ? `&preUserID=${preUserID}` : "")+(email ? `&email=${email}` : "") + (password ? `&password=${password}` : ""));
        } else if (mode === "resetPassword") {
            navigate(`/reset-password?oobCode=${oobCode}`);
        }
    }, [searchParams, navigate]);

    return <div style={{ textAlign: "center", marginTop: "50px" }}>Redirecionando...</div>;
}
