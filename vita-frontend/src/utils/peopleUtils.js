/**
 * Retorna o nome de exibição correto para uma pessoa,
 * seja ela física (nome) ou jurídica (razão social).
 * @param {object} person - O objeto da pessoa.
 * @returns {string} O nome de exibição ou "N/A" se não houver.
 */
export const getDisplayName = (person) => {
    if (!person) {
        return "N/A";
    }
    // return person.name || person.razaoSocial || "N/A";
    // Para clientes do tipo Pessoa Jurídica (PJ), usamos o tradeName (nome fantasia)
    if (person.personType === "PJ" && person.tradeName) {
        return person.tradeName;
    }

    // Para todos os outros casos (PF, Funcionário 'F', Admin 'A'), usamos o campo 'name'
    if (person.name) {
        return person.name;
    }

    // Fallback para casos onde os dados podem estar incompletos
    return "Nome não disponível";
};

/**
 * NOVO: Formata um número de telefone para o padrão brasileiro.
 * Ex: "44999999999" -> "(44) 99999-9999"
 * @param {string} phoneNumber - O número de telefone apenas com dígitos.
 * @returns {string} O número formatado ou o original se a formatação falhar.
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || typeof phoneNumber !== "string") return "";
    const cleaned = phoneNumber.replace(/\D/g, "");

    // Formato 0800 (11 dígitos)
    if (cleaned.startsWith("0800") && cleaned.length === 11) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    }

    // Formato celular (11 dígitos)
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    // Formato fixo (10 dígitos)
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return phoneNumber; // Retorna o original se não corresponder
};

/**
 * NOVO: Formata um CPF ou CNPJ.
 */
export const formatDocument = (doc) => {
    if (!doc || typeof doc !== "string") return "N/A";
    const cleaned = doc.replace(/\D/g, "");

    // Formato CPF (11 dígitos)
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    // Formato CNPJ (14 dígitos)
    if (cleaned.length === 14) {
        return cleaned.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5"
        );
    }

    return doc; // Retorna o original se não corresponder
};

// NOVO: Funções de máscara para os inputs

export const maskCPF = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const maskCNPJ = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const maskPhoneNumber = (value) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{4})$/, "$1-$2");
};

// NOVO: Função para remover a máscara antes de enviar para o backend
export const unmask = (value) => {
    if (!value) return "";

    // Se contém apenas dígitos + caracteres de formatação (espaço, ponto, traço, parêntese, barra)
    if (/^[\d\s.\-()/]+$/.test(value)) {
        return value.replace(/\D/g, ""); // mantém só os números
    }

    // Caso tenha letras ou outros caracteres, retorna como está
    return value;
};
