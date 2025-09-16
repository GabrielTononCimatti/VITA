// Caminho: vita-frontend/src/utils/dateUtils.js

/**
 * Converte uma string de data 'AAAA-MM-DD' de um input para um formato ISO String
 * que respeita o fuso horário local, evitando o problema do dia anterior.
 * @param {string} dateString - A data no formato 'AAAA-MM-DD'.
 * @returns {string | null} A data em formato ISO String ou null se a entrada for inválida.
 */
export const convertInputDateToISO = (dateString) => {
    if (!dateString || typeof dateString !== "string") {
        return null;
    }
    // O truque de substituir '-' por '/' faz o construtor do Date
    // interpretar a data como local, e não como UTC.
    const localDate = new Date(dateString.replace(/-/g, "/"));
    return localDate.toISOString();
};

/**
 * NOVO: Converte uma data em formato ISO String (vindo do backend) para o formato 'AAAA-MM-DD'
 * para ser usada em um <input type="date">, respeitando o fuso horário. (Função para LER dados)
 * @param {string} isoString - A data em formato ISO String (ex: "2025-09-12T03:00:00.000Z").
 * @returns {string | ''} A data no formato 'AAAA-MM-DD' ou uma string vazia.
 */
export const formatISOToInputDate = (isoString) => {
    if (!isoString) {
        return "";
    }
    try {
        // Cria um objeto Date, que automaticamente ajusta para o fuso horário do navegador
        const date = new Date(isoString);
        // Pega o ano, mês e dia da data JÁ CONVERTIDA para o fuso local
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() é 0-indexed
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Erro ao formatar data ISO:", error);
        return "";
    }
};

/**
 * NOVO: Formata uma data ISO para o padrão brasileiro (dd/MM/yyyy) para exibição.
 * @param {string} isoString - A data em formato ISO String.
 * @returns {string} A data formatada ou "N/A" se a entrada for inválida.
 */
export const formatDateToBrazilian = (isoString) => {
    if (!isoString) {
        return "N/A";
    }
    try {
        const date = new Date(isoString);
        // toLocaleDateString com o locale 'pt-BR' e timezone ajustado
        return date.toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo",
        });
    } catch (error) {
        console.error("Erro ao formatar data para o padrão brasileiro:", error);
        return "Data inválida";
    }
};
