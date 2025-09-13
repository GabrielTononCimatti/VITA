import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ActionHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const mode = searchParams.get("mode");
        const oobCode = searchParams.get("oobCode");
        const continueUrl = searchParams.get("continueUrl");

        if (!mode || !oobCode) return;
        let preUserID = null;
        if (mode === "verifyEmail") {
            if (continueUrl) {
                const decoded = decodeURIComponent(continueUrl);
                const parsed = new URL(decoded);
                preUserID = parsed.searchParams.get("preUserID");
            }
            navigate(
                `/verify-email?oobCode=${oobCode}${
                    preUserID ? `&preUserID=${preUserID}` : ""
                }`
            );
        } else if (mode === "resetPassword") {
            navigate(`/reset-password?oobCode=${oobCode}`);
        }
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            Redirecionando...
        </div>
    );
}
