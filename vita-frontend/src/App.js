import React from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyle";
import AppRoutes from "./routes/AppRoutes";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
            <AppRoutes />
        </ThemeProvider>
    );
}

export default App;
