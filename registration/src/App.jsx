import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ActionHandler from "./ActionHandler";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/action" element={<ActionHandler />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
        </Router>
    );
}

export default App;
