/**
 * Retorna o nome de exibição correto para uma pessoa,
 * seja ela física (nome) ou jurídica (razão social).
 * @param {object} person - O objeto da pessoa.
 * @returns {string} O nome de exibição ou "N/A" se não houver.
 */
export const getPersonDisplayName = (person) => {
    if (!person) {
        return "N/A";
    }
    return person.name || person.razaoSocial || "N/A";
};
